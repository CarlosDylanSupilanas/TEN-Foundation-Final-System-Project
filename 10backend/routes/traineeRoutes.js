import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { getSecret } from './authRoutes.js';

const traineeRoutes = express.Router();

const INVALID_LOGIN = "Invalid email or password!";
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);
const PROGRAMS = ["Cutting Program", "Sewing Program", "Designing Program"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_PATTERN = /^[0-9+\-\s()]{7,20}$/;

// Trainee tokens use a DIFFERENT secret from admin tokens, so a trainee
// token can never be used on the admin /worker routes (and the reverse).
const traineeSecret = () => `${getSecret()}:trainee`;

const signToken = (trainee) =>
    jwt.sign(
        { traineeId: trainee.id, name: trainee.name, email: trainee.email },
        traineeSecret(),
        { expiresIn: '8h' }
    );

const requireTrainee = (req, res, next) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: "Please sign in first." });
    }

    try {
        req.trainee = jwt.verify(token, traineeSecret());
        next();
    } catch {
        return res.status(401).json({ error: "Your session has expired. Please sign in again." });
    }
};

// Register
traineeRoutes.post('/register', async (req, res) => {
    try {
        const name = String(req.body?.name ?? '').trim().replace(/\s+/g, ' ');
        const email = String(req.body?.email ?? '').trim().toLowerCase();
        const password = String(req.body?.password ?? '');
        const contact = String(req.body?.contact ?? '').trim();
        const address = String(req.body?.address ?? '').trim().replace(/\s+/g, ' ');

        if (!name || !email || !password || !contact || !address) {
            return res.status(400).json({ error: "Please complete all fields!" });
        }
        if (name.length < 2 || name.length > 100) {
            return res.status(400).json({ error: "Name must be 2 to 100 characters long!" });
        }
        if (!EMAIL_PATTERN.test(email) || email.length > 255) {
            return res.status(400).json({ error: "Enter a valid email address!" });
        }
        if (password.length < 8 || password.length > 200) {
            return res.status(400).json({ error: "Password must be 8 to 200 characters long!" });
        }
        if (!CONTACT_PATTERN.test(contact)) {
            return res.status(400).json({ error: "Enter a valid contact number!" });
        }
        if (address.length > 255) {
            return res.status(400).json({ error: "Address is too long!" });
        }

        const hash = await bcrypt.hash(password, 10);

        let insertId;
        try {
            const [result] = await pool.query(
                'INSERT INTO trainee(name, email, password_hash, contact, address) VALUES (?, ?, ?, ?, ?)',
                [name, email, hash, contact, address]
            );
            insertId = result.insertId;
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: "That email is already registered!" });
            }
            throw e;
        }

        const trainee = { id: insertId, name, email };
        res.status(201).json({
            success: true,
            token: signToken(trainee),
            trainee: { name, email }
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});

// Login
traineeRoutes.post('/login', async (req, res) => {
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
            'SELECT trainee_id AS id, name, email, password_hash AS passwordHash FROM trainee WHERE email = ?',
            [email]
        );
        const trainee = rows[0];

        const passwordOk = await bcrypt.compare(password, trainee ? trainee.passwordHash : DUMMY_HASH);
        if (!trainee || !passwordOk) {
            return res.status(401).json({ error: INVALID_LOGIN });
        }

        res.status(200).json({
            success: true,
            token: signToken(trainee),
            trainee: { name: trainee.name, email: trainee.email }
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});

// My applications
traineeRoutes.get('/applications', requireTrainee, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT a.id, a.program, a.status, t.name AS traineeName
             FROM application a
             JOIN trainee t ON t.trainee_id = a.trainee_id
             WHERE a.trainee_id = ?
             ORDER BY a.id DESC`,
            [req.trainee.traineeId]
        );
        res.status(200).json(rows);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});

// Submit an application
traineeRoutes.post('/applications', requireTrainee, async (req, res) => {
    try {
        const program = String(req.body?.program ?? '');

        if (!PROGRAMS.includes(program)) {
            return res.status(400).json({ error: "Please select a valid training program!" });
        }

        let insertId;
        try {
            const [result] = await pool.query(
                'INSERT INTO application(trainee_id, program) VALUES (?, ?)',
                [req.trainee.traineeId, program]
            );
            insertId = result.insertId;
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: `You already applied for the ${program}.` });
            }
            throw e;
        }

        res.status(201).json({
            success: true,
            application: {
                id: insertId,
                program,
                traineeName: req.trainee.name,
                status: 'Pending'
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});

export default traineeRoutes;