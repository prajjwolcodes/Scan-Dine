import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["owner", "chef"], required: true },
    restaurant: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
