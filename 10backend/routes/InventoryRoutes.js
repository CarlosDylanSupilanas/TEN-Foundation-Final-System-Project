import express from "express";
import {
  loginInventoryAdmin,
  getBags,
  addBag,
  updateBag,
  deleteBag,
} from "../controllers/InventoryController.js";

const router = express.Router();

router.post("/inventory/login", loginInventoryAdmin);
router.get("/bags", getBags);
router.post("/bags", addBag);
router.put("/bags/:id", updateBag);
router.delete("/bags/:id", deleteBag);

export default router;