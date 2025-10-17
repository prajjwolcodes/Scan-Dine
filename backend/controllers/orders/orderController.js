import e from "express";
import Order from "../../models/orderSchema.js";
import Restaurant from "../../models/restaurantSchema.js";
import { io } from "../../socket/io.js";
import { buildOrderLines } from "../../utils/orderLineUp.js";

export const createOrder = async (req, res) => {
  try {
    const { restaurantId, tableNumber, items, customerName, customerPhone } =
      req.body;

    console.log(restaurantId, tableNumber, items, customerName, customerPhone);

    if (!restaurantId || !tableNumber) {
      return res
        .status(400)
        .json({ message: "Restaurant ID and table number are required" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // 🔒 1. Check if the table is already booked in DB
    const table = restaurant.tables.find(
      (t) => t.tableNumber === Number(tableNumber)
    );
    if (!table) {
      return res
        .status(404)
        .json({ message: `Table ${tableNumber} not available right now` });
    }
    if (table.isBooked) {
      return res
        .status(400)
        .json({ message: `Table ${tableNumber} is already booked.` });
    }

    // 2. Check active order (extra safety)
    const existingOrder = await Order.findOne({
      restaurant: restaurant._id,
      tableNumber,
      status: { $in: ["pending", "accepted", "preparing"] },
    });
    if (existingOrder) {
      return res
        .status(400)
        .json({ message: "This table already has an active order." });
    }

    // 3. Build order lines and total
    const { orderItems, total } = await buildOrderLines(restaurant._id, items);

    // 4. Create new order
    const order = await Order.create({
      restaurant: restaurant._id,
      tableNumber,
      items: orderItems,
      totalAmount: total,
      status: "pending",
      customerName,
      customerPhone,
    });

    // 5. Update restaurant table as booked
    table.isBooked = true;
    await restaurant.save();

    // 6. Emit new order to kitchen
    io.to(`restaurant:${restaurant._id}`).emit("order:new", order);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/orders/:id/add-items (public)
// Allows adding items to an existing active order (pending/accepted) while UNPAID.
export const addItemsToOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { items } = req.body; // [{ menuItemId, quantity }]

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Items array is required to add to the order" });
    }

    const order = await Order.findById(orderId).populate("restaurant");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only allow while order is active and unpaid
    if (!["pending", "accepted"].includes(order.status)) {
      return res.status(400).json({
        message: "Cannot add items to this order. Order is not active.",
      });
    }
    if (order.paymentStatus === "PAID") {
      return res
        .status(400)
        .json({ message: "Cannot add items to an already paid order." });
    }

    const restaurantId = order.restaurant._id;
    const { orderItems, total } = await buildOrderLines(restaurantId, items);

    // Merge items: increment quantity for existing lines with same menuItem
    for (const newLine of orderItems) {
      const idx = order.items.findIndex((li) =>
        li.menuItem.equals(newLine.menuItem)
      );
      if (idx >= 0) {
        order.items[idx].quantity += newLine.quantity;
      } else {
        order.items.push(newLine);
      }
    }
    order.totalAmount = (order.totalAmount || 0) + total;

    // If previously accepted or pending we keep status. If kitchen needs re-notify, that happens via socket below.
    await order.save();

    // Notify kitchen with special "items-added" event for highlighting
    io.to(`restaurant:${restaurantId}`).emit("order:items-added", {
      order,
      tableNumber: order.tableNumber,
      addedItems: orderItems,
      message: `Table ${order.tableNumber} added more items to their order`,
    });

    // Also emit standard update for customer and any other listeners
    io.to(`restaurant:${restaurantId}`).emit("order:update", order);
    io.to(`order:${order._id}`).emit("order:update", order);

    res.json({ success: true, message: "Items added to order", order });
  } catch (err) {
    console.error(err);
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
    const existingRestaurant = await Restaurant.findOne({
      _id: req.user.restaurant,
    });
    if (!existingRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const orders = await Order.find({
      restaurant: existingRestaurant._id,
    }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      message: "All orders retrieved successfully",
      orders,
      restaurant: existingRestaurant,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, chefId } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });

    const restaurantId = req.user.restaurant;
    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: restaurantId,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (chefId) order.acceptedBy = chefId;

    await order.save();

    // 🟢 Emit order update
    io.to(`restaurant:${restaurantId}`).emit("order:update", order);
    io.to(`order:${order._id}`).emit("order:update", order);

    // 🧹 If order completed or cancelled, mark table as available again
    if (["completed", "cancelled"].includes(status)) {
      const restaurant = await Restaurant.findById(restaurantId);
      if (restaurant) {
        const table = restaurant.tables.find(
          (t) => t.tableNumber === order.tableNumber
        );
        if (table) {
          table.isBooked = false;
          await restaurant.save();
        }
      }
    }

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
    io.to(`restaurant:${restaurantId}`).emit("order:update", order);
    io.to(`order:${order._id}`).emit("order:update", order);

    res.json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// this is for the customer who dont have to login
export const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findOne({
      _id: orderId,
    }).populate("restaurant", "name address phone email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
