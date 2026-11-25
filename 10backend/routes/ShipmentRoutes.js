import express from "express"; //2.1.2 Whole Shipment Routes
import pool from "../config/db.js";

const router = express.Router();

// Record a shipment: save it AND subtract the quantity from the bag's stock
router.post("/shipments", async (req, res) => {
  const bagId = Number(req.body.bagId);
  const quantity = Number(req.body.quantity);
  const destination = String(req.body.destination ?? "")
    .trim()
    .slice(0, 100);

  // 1) Check what the admin typed
  if (!Number.isInteger(bagId) || bagId < 1) {
    return res.status(400).json({ message: "Please choose a bag." });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res
      .status(400)
      .json({ message: "Quantity must be a whole number of 1 or more." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 2) Get the bag's current stock
    const [rows] = await conn.query(
      "SELECT product_name, quantity FROM bags WHERE id = ? FOR UPDATE",
      [bagId],
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Bag not found." });
    }

    // 3) Not enough bags? Reject the shipment
    const stock = rows[0].quantity;
    if (stock < quantity) {
      await conn.rollback();
      return res.status(400).json({
        message: `Not enough stock. Only ${stock} available for ${rows[0].product_name}.`,
      });
    }

    // 4) Subtract the stock and save the shipment
    await conn.query("UPDATE bags SET quantity = quantity - ? WHERE id = ?", [
      quantity,
      bagId,
    ]);
    await conn.query(
      "INSERT INTO shipments (bag_id, quantity, destination) VALUES (?, ?, ?)",
      [bagId, quantity, destination || null],
    );

    await conn.commit();
    res.status(201).json({
      message: `Shipped ${quantity} of ${rows[0].product_name}.`,
      remaining: stock - quantity,
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
});

export default router;
