import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  checkoutController,
  updatePaymentStatus,
  verifyPayment,
} from "../controllers/payment/paymentController.js";

const router = express.Router();

// router.use(authMiddleware); // Apply auth middleware to all routes in this router

router.route("/:id").put(checkoutController);
router.route("/verify").post(verifyPayment);
router.route("/:id/status").put(updatePaymentStatus);

// router.post("/payment-status");

export default router;
