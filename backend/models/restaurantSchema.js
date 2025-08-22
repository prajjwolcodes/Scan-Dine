import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  contactNumber: String,
  phone: { type: String },
  email: { type: String },
  tableCount: { type: Number, default: 1 },
  openingTime: { type: String },
  closingTime: { type: String },
  qrCodeUrl: { type: String },
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
