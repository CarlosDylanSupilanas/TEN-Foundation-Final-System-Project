// 1.1.2

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { getSecret } from './authRoutes.js';
import * as workerModel from '../models/workerModels.js';
import * as attendanceModel from '../models/attendanceModels.js';
const logbookRoutes = express.Router();

const INVALID_LOGIN = "Invalid email or password!";
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);
const WORKER_ID_PATTERN = /^WRK-[0-9A-F]{6}$/;

// Logbook tokens use their own secret, so they can't open the admin or trainee routes.
const logbookSecret = () => `${getSecret()}:logbook`;

const requireLogbook = (req, res, next) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: "Please sign in first." });
    }

    try {
        req.logbook = jwt.verify(token, logbookSecret());
        next();
    } catch {
        return res.status(401).json({ error: "Your session has expired. Please sign in again." });
    }
};

// Login
logbookRoutes.post('/login', async (req, res) => {
    try {
        const email = String(req.body?.email ?? '').trim().toLowerCase();
        const password = String(req.body?.password ?? '');

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required!" });
        }
        if (email.length > 255 || password.length > 200) {
            return res.status(401).json({ error: INVALID_LOGIN });
        }

        const [rows] = await pool.query(
            'SELECT logbook_id AS logbookId, email, password_hash AS passwordHash FROM logbook WHERE email = ?',
            [email]
        );
        const account = rows[0];

        const passwordOk = await bcrypt.compare(password, account ? account.passwordHash : DUMMY_HASH);
        if (!account || !passwordOk) {
            return res.status(401).json({ error: INVALID_LOGIN });
        }

        const token = jwt.sign(
            { logbookId: account.logbookId, email: account.email },
            logbookSecret(),
            { expiresIn: '12h' }
        );

        res.status(200).json({ success: true, token });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});

// Scan a QR code: read it, verify it, then record attendance
logbookRoutes.post('/scan', requireLogbook, async (req, res) => {
    try {
        // 1) Read the QR text and check that it has the right shape
        const raw = String(req.body?.qr ?? '');

        let payload = null;
        if (raw && raw.length <= 500) {
            try {
                payload = JSON.parse(raw);
            } catch {
                payload = null;
            }
        }

        const workerId = typeof payload?.workerId === 'string' ? payload.workerId.trim() : '';
        const name = typeof payload?.name === 'string' ? payload.name.trim().replace(/\s+/g, ' ') : '';

        if (!WORKER_ID_PATTERN.test(workerId) || !name) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_QR',
                error: "Invalid QR code. This is not a TEN Foundation worker QR code."
            });
        }

        // 2) The worker ID and name must match a registered worker
        const [worker] = await workerModel.findWorkerByWorkerId(workerId);
        if (!worker || worker.name !== name) {
            return res.status(404).json({
                success: false,
                code: 'UNREGISTERED',
                error: "Unregistered worker. Attendance was not recorded."
            });
        }

                // 3) Ignore a repeat scan within one minute
        const recent = await attendanceModel.findRecentEvent(workerId);
        if (recent) {
            return res.status(409).json({
                success: false,
                code: 'ALREADY_LOGGED',
                error: `${worker.name} was just recorded. Please wait a minute before scanning again.`
            });
        }

              // 4) Only 2 scans a day: Time In, then Time Out
const todayRecord = await attendanceModel.findTodayRecord(workerId);

if (todayRecord && todayRecord.timeOut) {
    return res.status(409).json({
        success: false,
        code: 'COMPLETED',
        error: `${worker.name} already timed in and out today.`
    });
}

let action;
let recordId;
if (!todayRecord) {
    recordId = await attendanceModel.insertTimeIn(workerId);
    action = 'TIME_IN';
} else {
    await attendanceModel.setTimeOut(todayRecord.id);
    recordId = todayRecord.id;
    action = 'TIME_OUT';
}

        
        const record = await attendanceModel.findById(recordId);
        const label = action === 'TIME_IN' ? 'Time In' : 'Time Out';

        res.status(200).json({
            success: true,
            action,
            message: `${label} recorded for ${worker.name} (${worker.workerId}).`,
            worker: { workerId: worker.workerId, name: worker.name },
            attendance: record,
            recordedAt: action === 'TIME_IN' ? record.timeIn : record.timeOut
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});

// Today's Activity
logbookRoutes.get('/today', requireLogbook, async (req, res) => {
    try {
        const records = await attendanceModel.fetchToday();
        res.status(200).json({ success: true, records });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});

export default logbookRoutes;