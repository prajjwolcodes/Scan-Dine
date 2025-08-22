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
  items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
  totalAmount: Number,
  status: {
    type: String,
    enum: ["pending", "accepted", "preparing", "completed", "paid"],
    default: "pending",
    index: true,
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "khalti", "esewa"],
    default: "cash",
  },
  paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
