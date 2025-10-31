import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  isBooked: { type: Boolean, default: false },
});

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: { type: String },
  email: { type: String },
  tableCount: { type: Number, default: 0 },
  tables: [tableSchema],
  openingTime: { type: String },
  closingTime: { type: String },
  qrCodeUrl: { type: String },
  logo: { type: String },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  chefs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // restaurant can have multiple chefs
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
