import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateRestaurantQR } from "../controllers/qr/qrController.js";

const router = express.Router();

router.post("/generate", authMiddleware, generateRestaurantQR);

export default router;
