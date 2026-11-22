import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const authRoutes = express.Router();

const INVALID_LOGIN = "Invalid email or password!";

// Need for Email and Password
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

export const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16) {
        throw new Error("JWT_SECRET is missing or too short. Set it in your .env file.");
    }
    return secret;
};

// Login
authRoutes.post('/login', async (req, res) => {
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
            'SELECT admin_id AS adminId, email, password_hash AS passwordHash FROM admin WHERE email = ?',
            [email]
        );
        const admin = rows[0];

        const passwordOk = await bcrypt.compare(password, admin ? admin.passwordHash : DUMMY_HASH);
        if (!admin || !passwordOk) {
            return res.status(401).json({ error: INVALID_LOGIN });
        }

        const token = jwt.sign(
            { adminId: admin.adminId, email: admin.email },
            getSecret(),
            { expiresIn: '8h' }
        );

        res.status(200).json({
            success: true,
            token,
            admin: { adminId: admin.adminId, email: admin.email }
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});

// SignIn
export const requireAuth = (req, res, next) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: "Please sign in first." });
    }

    try {
        req.admin = jwt.verify(token, getSecret());
        next();
    } catch {
        return res.status(401).json({ error: "Your session has expired. Please sign in again." });
    }
};

export default authRoutes;