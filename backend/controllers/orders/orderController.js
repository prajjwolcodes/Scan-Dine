import Order from "../../models/orderSchema.js";
import Restaurant from "../../models/restaurantSchema.js";
import { io } from "../../socket/io.js";
import { buildOrderLines } from "../../utils/orderLineUp.js";

export const createOrder = async (req, res) => {
  try {
    const { restaurantId, tableNumber, items } = req.body;

    // 1) Basic checks
    if (!restaurantId || !tableNumber) {
      return res
        .status(400)
        .json({ message: "Restaurant ID and table number are required" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    // 2) Build order lines & compute total
    const { orderItems, total } = await buildOrderLines(restaurant._id, items);

    // 3) Create order
    const order = await Order.create({
      restaurant: restaurant._id,
      tableNumber,
      items: orderItems,
      totalAmount: total,
      status: "pending",
      paymentStatus: "unpaid",
    });

    // 4) Emit to kitchen (chefs joined this room)
    io.to(`restaurant:${restaurant._id}`).emit("order:new", order);

    // 5) Respond to customer
    res
      .status(201)
      .json({ success: true, message: "Order created successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/active?status=pending|accepted|preparing|ready
export const listActiveOrders = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) return res.status(400).json({ message: "Status is required" });
    const restaurantId = req.user.restaurant; // from auth middleware (owner/chef)

    const query = {
      restaurant: restaurantId,
      status: { $in: ["pending", "accepted", "preparing"] },
    };
    if (status) query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listAllOrders = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant; // from auth middleware (owner/chef)

    const orders = await Order.find({ restaurant: restaurantId }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      message: "All orders retrieved successfully",
      orders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; // accepted|preparing|ready|completed|cancelled
    if (!status) return res.status(400).json({ message: "Status is required" });
    const restaurantId = req.user.restaurant;

    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: restaurantId,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    // Emit updates
    io?.to(`restaurant:${restaurantId}`).emit("order:update", order);
    io?.to(`order:${order._id}`).emit("order:update", order);

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderPayment = async (req, res) => {
  try {
    const { paymentStatus } = req.body; // paid|unpaid
    if (!paymentStatus)
      return res.status(400).json({ message: "Payment status is required" });

    const restaurantId = req.user.restaurant;

    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: restaurantId,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = paymentStatus;
    await order.save();

    // Emit updates
    io?.to(`restaurant:${restaurantId}`).emit("order:update", order);
    io?.to(`order:${order._id}`).emit("order:update", order);

    res.json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
