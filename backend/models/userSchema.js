import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["owner", "chef"], required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    hasRestaurant: { type: Boolean, default: false },
    hasMenu: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
