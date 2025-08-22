import Category from "../../models/categorySchema.js";
import MenuItem from "../../models/menuItemSchema.js";
import Restaurant from "../../models/restaurantSchema.js";

export const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, categoryId } = req.body;

    const restaurant = await Restaurant.findById(req.user.restaurant);
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
  try {
    const menuItems = await MenuItem.find({
      restaurant: req.user.restaurant,
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

    const restaurant = await Restaurant.findById(req.user.restaurant);
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

    const restaurant = await Restaurant.findById(req.user.restaurant);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    const menuItem = await MenuItem.findById(id);
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
    menuItem.category = category._id;

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
