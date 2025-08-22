import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  contactNumber: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  chefs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // restaurant can have multiple chefs
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
});

module.exports = mongoose.model("Restaurant", restaurantSchema);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
