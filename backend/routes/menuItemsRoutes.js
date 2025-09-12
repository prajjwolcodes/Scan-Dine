import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addMenuItem,
  getCustomerMenuItems,
  getMenuItems,
  removeMenuItems,
  updateMenuItem,
} from "../controllers/menuItem/menuItemController.js";

const router = express.Router();

router.post("/", authMiddleware, addMenuItem);
router.get("/", authMiddleware, getMenuItems);
router.get("/customer/:restaurantId", getCustomerMenuItems);
router.delete("/:id", authMiddleware, removeMenuItems);
router.put("/:id", authMiddleware, updateMenuItem);

export default router;
