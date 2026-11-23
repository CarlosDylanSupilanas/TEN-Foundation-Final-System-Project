import pool from "../config/db.js"; // change db.js to your real db file name

export async function findAdminByLogin(email, password) {
  const [rows] = await pool.query(
    "SELECT id, email FROM inventory_admins WHERE email = ? AND password = ?",
    [email, password]
  );
  return rows[0] || null;
}

export async function findAllBags() {
  const [rows] = await pool.query(
    `SELECT id, product_name AS productName, product_code AS productCode,
     category, color, quantity FROM bags ORDER BY id DESC`
  );
  return rows;
}

export async function insertBag(bag) {
  await pool.query(
    `INSERT INTO bags (product_name, product_code, category, color, quantity)
     VALUES (?, ?, ?, ?, ?)`,
    [bag.productName, bag.productCode, bag.category, bag.color, bag.quantity]
  );
}

export async function updateBagById(id, bag) {
  const [result] = await pool.query(
    `UPDATE bags SET product_name=?, product_code=?, category=?, color=?, quantity=?
     WHERE id=?`,
    [bag.productName, bag.productCode, bag.category, bag.color, bag.quantity, id]
  );
  return result.affectedRows;
}

export async function deleteBagById(id) {
  const [result] = await pool.query("DELETE FROM bags WHERE id = ?", [id]);
  return result.affectedRows;
}