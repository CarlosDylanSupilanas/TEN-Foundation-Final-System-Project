import pool from '../config/db.js';

const TABLE = 'worker';   // my table name in database - xampp

const COLUMNS = "worker_id AS workerId, name, created_at AS createdAt";

export const fetchAllWorkers = async () => {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM ${TABLE} ORDER BY id DESC`);
    return rows;
};

export const findWorkerByNameKey = async (nameKey) => {
    const [rows] = await pool.query(
        `SELECT ${COLUMNS} FROM ${TABLE} WHERE name_key = ?`,
        [nameKey]
    );
    return rows;
};

export const findWorkerByWorkerId = async (workerId) => {
    const [rows] = await pool.query(
        `SELECT ${COLUMNS} FROM ${TABLE} WHERE worker_id = ?`,
        [workerId]
    );
    return rows;
};

export const insert = async (workerId, name, nameKey) => {
    const [result] = await pool.query(
        `INSERT INTO ${TABLE}(worker_id, name, name_key) VALUES (?, ?, ?)`,
        [workerId, name, nameKey]
    );
    return result.insertId;
};

/* Remove */
export const remove = async (workerId) => {
    const [result] = await pool.query(
        `DELETE FROM ${TABLE} WHERE worker_id = ?`,
        [workerId]
    );
    return result.affectedRows;
};