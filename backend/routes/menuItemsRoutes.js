import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addMenuItem,
  getMenuItems,
  removeMenuItems,
  updateMenuItem,
} from "../controllers/menuItem/menuItemController.js";

const router = express.Router();

router.post("/", authMiddleware, addMenuItem);
router.get("/", authMiddleware, getMenuItems);
router.delete("/:id", authMiddleware, removeMenuItems);
router.put("/:id", authMiddleware, updateMenuItem);

export default router;
