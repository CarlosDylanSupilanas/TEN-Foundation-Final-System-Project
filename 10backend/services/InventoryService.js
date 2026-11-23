import * as InventoryModel from "../models/InventoryModel.js";

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateBag(body) {
  const { productName, productCode, category, color, quantity } = body;
  if (!productName || !productCode || !category || !color) {
    throw fail(400, "All fields are required");
  }
  if (quantity === undefined || quantity === null || isNaN(Number(quantity)) || Number(quantity) < 0) {
    throw fail(400, "Quantity must be 0 or more");
  }
  return {
    productName: productName.trim(),
    productCode: productCode.trim(),
    category: category.trim(),
    color: color.trim(),
    quantity: Number(quantity),
  };
}

function handleDuplicate(err) {
  if (err.code === "ER_DUP_ENTRY") {
    throw fail(400, "Product code already exists");
  }
  throw err;
}

export async function login(email, password) {
  const admin = await InventoryModel.findAdminByLogin(email, password);
  if (!admin) throw fail(401, "Wrong email or password");
  return { id: admin.id, email: admin.email, role: "inventory" };
}

export function listBags() {
  return InventoryModel.findAllBags();
}

export async function createBag(body) {
  const bag = validateBag(body);
  try {
    await InventoryModel.insertBag(bag);
  } catch (err) {
    handleDuplicate(err);
  }
}

export async function editBag(id, body) {
  const bag = validateBag(body);
  try {
    const affected = await InventoryModel.updateBagById(id, bag);
    if (affected === 0) throw fail(404, "Bag not found");
  } catch (err) {
    handleDuplicate(err);
  }
}

export async function removeBag(id) {
  const affected = await InventoryModel.deleteBagById(id);
  if (affected === 0) throw fail(404, "Bag not found");
}