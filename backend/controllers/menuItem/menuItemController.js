import Category from "../../models/categorySchema.js";
import MenuItem from "../../models/menuItemSchema.js";
import Restaurant from "../../models/restaurantSchema.js";
import User from "../../models/userSchema.js";

export const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, categoryId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const restaurant = await Restaurant.findById(user.restaurant);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    const category = await Category.findOne({
      _id: categoryId,
      restaurant: restaurant._id,
    });
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const menuItem = await MenuItem.create({
      restaurant: restaurant._id,
      category: category._id,
      name,
      description,
      price,
      image,
    });

    await menuItem.populate("category", "name");

    await User.findByIdAndUpdate(req.user._id, { hasMenu: true });

    res.status(201).json({
      success: true,
      message: "Menu item added successfully",
      menuItem,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMenuItems = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });
  try {
    const menuItems = await MenuItem.find({
      restaurant: user.restaurant,
    }).populate("category", "name");
    res.json({
      success: true,
      message: "Menu items fetched successfully",
      menuItems,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomerMenuItems = async (req, res) => {
  const { restaurantId } = req.params;
  try {
    const menuItems = await MenuItem.find({
      restaurant: restaurantId,
    }).populate("category", "name");
    res.json({
      success: true,
      message: "Menu items fetched successfully",
      menuItems,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeMenuItems = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const restaurant = await Restaurant.findById(user.restaurant);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    const menuItem = await MenuItem.findById(id);
    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });

    if (menuItem.restaurant.toString() !== restaurant._id.toString())
      return res
        .status(403)
        .json({ message: "You are not authorized to remove this menu item" });

    await MenuItem.findByIdAndDelete(id);
    res.json({ success: true, message: "Menu item removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, categoryId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const restaurant = await Restaurant.findById(user.restaurant);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    const menuItem = await MenuItem.findById(id).populate("category", "name");

    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });

    if (menuItem.restaurant.toString() !== restaurant._id.toString())
      return res
        .status(403)
        .json({ message: "You are not authorized to update this menu item" });

    const category = await Category.findOne({
      _id: categoryId,
      restaurant: restaurant._id,
    });
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    menuItem.name = name;
    menuItem.description = description;
    menuItem.price = price;
    menuItem.image = image;
    menuItem.category = {
      _id: category._id,
      name: category.name,
    };
    await menuItem.save();
    res.json({
      success: true,
      message: "Menu item updated successfully",
      menuItem,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
