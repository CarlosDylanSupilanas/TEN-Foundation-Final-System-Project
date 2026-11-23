// The db file you pasted is probably in config/. Check the real file name.
import pool from "../config/db.js";

const SELECT_BAGS = `SELECT id, product_name AS productName, product_code AS productCode,
  category, color, quantity FROM bags ORDER BY id DESC`;

function validateBag(body) {
  const { productName, productCode, category, color, quantity } = body;
  if (!productName || !productCode || !category || !color) {
    return "All fields are required";
  }
  if (quantity === undefined || quantity === null || Number(quantity) < 0 || isNaN(Number(quantity))) {
    return "Quantity must be 0 or more";
  }
  return null;
}

// First admin login
export async function loginInventoryAdmin(req, res) {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query(
      "SELECT id, email FROM inventory_admins WHERE email = ? AND password = ?",
      [email, password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Wrong email or password" });
    }
    res.json({ id: rows[0].id, email: rows[0].email, role: "inventory" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// View
export async function getBags(req, res) {
  try {
    const [rows] = await pool.query(SELECT_BAGS);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Add
export async function addBag(req, res) {
  const error = validateBag(req.body);
  if (error) return res.status(400).json({ message: error });

  const { productName, productCode, category, color, quantity } = req.body;
  try {
    await pool.query(
      `INSERT INTO bags (product_name, product_code, category, color, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [productName, productCode, category, color, quantity]
    );
    res.status(201).json({ message: "Bag added" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Product code already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Edit
export async function updateBag(req, res) {
  const error = validateBag(req.body);
  if (error) return res.status(400).json({ message: error });

  const { productName, productCode, category, color, quantity } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE bags SET product_name=?, product_code=?, category=?, color=?, quantity=?
       WHERE id=?`,
      [productName, productCode, category, color, quantity, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bag not found" });
    }
    res.json({ message: "Bag updated" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Product code already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Delete
export async function deleteBag(req, res) {
  try {
    const [result] = await pool.query("DELETE FROM bags WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bag not found" });
    }
    res.json({ message: "Bag deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}