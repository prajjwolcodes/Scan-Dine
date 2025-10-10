import Category from "../../models/categorySchema.js";
import Restaurant from "../../models/restaurantSchema.js";
import User from "../../models/userSchema.js";

export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const restaurant = await Restaurant.findById(user.restaurant);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    const category = await Category.create({
      restaurant: restaurant._id,
      name,
      description,
    });
    await User.findByIdAndUpdate(req.user._id, { hasMenu: true });

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const restaurant = await Restaurant.findById(user.restaurant);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    const categories = await Category.find({ restaurant: restaurant._id });
    res.json({
      success: true,
      message: "Categories fetched successfully",
      categories,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomerCategories = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    const categories = await Category.find({ restaurant: restaurant._id });
    res.json({
      success: true,
      message: "Categories fetched successfully",
      categories,
      restaurant
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const restaurant = await Restaurant.findById(user.restaurant);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    const category = await Category.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    if (category.restaurant.toString() !== restaurant._id.toString())
      return res
        .status(403)
        .json({ message: "You are not authorized to remove this category" });

    if (category.menuItems.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete category with menu items" });
    }

    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: "Category removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const restaurant = await Restaurant.findById(user.restaurant);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    const category = await Category.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    if (category.restaurant.toString() !== restaurant._id.toString())
      return res
        .status(403)
        .json({ message: "You are not authorized to update this category" });

    category.name = name;
    category.description = description;
    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
