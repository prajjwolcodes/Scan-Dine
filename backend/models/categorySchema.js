import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" }],
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
