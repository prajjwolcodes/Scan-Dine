import Restaurant from "../../models/restaurantSchema.js";
import User from "../../models/userSchema.js";
import bcrypt from "bcrypt";

export const createChef = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ message: "Only owners can create chefs" });
    }

    const { username, email, password, restaurant } = req.body;

    const existingUser = await User.findOne({ email, role: "chef" , restaurant: restaurant });
    if (existingUser)
      return res.status(400).json({ message: "Chef already assigned with that email" });
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingRestaurant = await Restaurant.findOne({
      _id: restaurant,
    });

    if(!existingRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const chef = await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, 10),
      role: "chef",
      restaurant: existingRestaurant._id, // link chef to owner’s restaurant
    });

    res.status(201).json({
      success: true,
      message: "Chef created successfully",
      chef: { id: chef._id, username: chef.username, email:chef.email, role: chef.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllChefs = async (req, res) => {
const {restaurant} = req.body;
  if (req.user.role !== "owner") {
    return res.status(403).json({ message: "Only owners can view chefs" });
  }
  const existingRestaurant = await Restaurant.findOne({
    _id: restaurant,
  });
  if(!existingRestaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  try {
    const chefs = await User.find({
      role: "chef",
      restaurant: existingRestaurant._id,
    });
    res.status(200).json({
      success: true,
      message: "Chefs retrieved successfully",
      chefs: chefs.map((chef) => ({
        _id: chef._id,
        username: chef.username,
      email: chef.email,
        role: chef.role,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeChef = async (req, res) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({ message: "Only owners can remove chefs" });
  }
  const { chefId } = req.params;
  console.log(chefId)
  try {
    const chef = await User.findOne({ _id: chefId, role: "chef" });
    if (!chef) {
      return res.status(404).json({ message: "Chef not found" });
    }
    await User.deleteOne({ _id: chefId });
    res.status(200).json({ message: "Chef removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
