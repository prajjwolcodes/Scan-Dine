import express from "express";
import {
  addCategory,
  getCategories,
  removeCategory,
} from "../controllers/category/categoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addCategory);
router.get("/", authMiddleware, getCategories);
router.delete("/:id", authMiddleware, removeCategory);

export default router;
