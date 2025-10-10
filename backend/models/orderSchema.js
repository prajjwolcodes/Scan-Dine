import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: { type: String, required: true }, // snapshot for history
    unitPrice: { type: Number, required: true }, // snapshot for history
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  tableNumber: { type: Number, required: true },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null, // remains null until a chef accepts it
  },

  items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
  totalAmount: Number,
  status: {
    type: String,
    enum: ["pending", "accepted", "completed", "cancelled"],
    default: "pending",
    index: true,
  },
  paymentStatus: {
    type: String,
    enum: ["UNPAID", "PAID"],
    default: "UNPAID",
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
