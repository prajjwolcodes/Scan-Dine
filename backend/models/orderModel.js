import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  tableNumber: { type: Number, required: true },
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
      quantity: { type: Number, default: 1 },
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "completed", "paid"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "khalti", "esewa"],
    default: cash,
  },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
