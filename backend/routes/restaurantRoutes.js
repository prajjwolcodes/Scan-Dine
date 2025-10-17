import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createRestaurant,
  getAvailableTables,
  getMyRestaurant,
  updateRestaurant,
} from "../controllers/restaurant/restaurantController.js";

const router = express.Router();

router.post("/", authMiddleware, createRestaurant);
router.get("/:userId", authMiddleware, getMyRestaurant);
router.put("/:id", authMiddleware, updateRestaurant);
router.get("/:restaurantId/tables", getAvailableTables);

export default router;
