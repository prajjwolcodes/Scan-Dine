// routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  listActiveOrders,
  listAllOrders,
  updateOrderStatus,
  updateOrderPayment,
  getOrderDetails,
} from "../controllers/orders/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public: customers place orders (no auth)
router.post("/", createOrder);

// Kitchen/Admin: must be owner or chef
router.get(
  "/active",
  authMiddleware,
  roleMiddleware(["owner", "chef"]),
  listActiveOrders
);
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["owner", "chef"]),
  listAllOrders
);
router.patch(
  "/status/:id",
  authMiddleware,
  roleMiddleware(["owner", "chef"]),
  updateOrderStatus
);
router.patch(
  "/payment/:id",
  authMiddleware,
  roleMiddleware(["owner", "chef"]),
  updateOrderPayment
);
router.get("/order/:id", getOrderDetails);

export default router;
