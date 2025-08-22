import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
} from "../controllers/restaurant/restaurantController.js";

const router = express.Router();

router.post("/", authMiddleware, createRestaurant);
router.get("/", authMiddleware, getMyRestaurant);
router.put("/:id", authMiddleware, updateRestaurant);

export default router;
