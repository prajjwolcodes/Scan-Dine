import express from "express";
import {
  addCategory,
  getCategories,
  getCustomerCategories,
  removeCategory,
  updateCategory,
} from "../controllers/category/categoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addCategory);
router.get("/", authMiddleware, getCategories);
router.get("/customer/:restaurantId", getCustomerCategories);
router.delete("/:id", authMiddleware, removeCategory);
router.put("/:id", authMiddleware, updateCategory);

export default router;
