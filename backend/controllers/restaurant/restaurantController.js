import Restaurant from "../../models/restaurantSchema.js";
import User from "../../models/userSchema.js";

export const createRestaurant = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res
        .status(403)
        .json({ message: "Only owners can create a restaurant" });
    }

    const {
      name,
      address,
      phone,
      email,
      tableCount,
      openingTime,
      closingTime,
    } = req.body;

    const existingRestaurant = await Restaurant.findOne({
      owner: req.user._id,
    });
    if (existingRestaurant)
      return res.status(400).json({ message: "You already have a restaurant" });

    const restaurant = await Restaurant.create({
      name,
      address,
      phone,
      email,
      tableCount,
      openingTime,
      closingTime,
      owner: req.user._id,
      tables: Array.from({ length: tableCount }, (_, i) => ({ tableNumber: i + 1, isBooked: false })),
    });


    // link owner with restaurant
    await User.findByIdAndUpdate(req.user._id, {
      restaurant: restaurant._id,
      hasRestaurant: true,
    });

    res.status(201).json({
      success: true,
      restaurant,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyRestaurant = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.restaurant) {
      return res.status(404).json({ message: "No restaurant assigned" });
    }

    const restaurant = await Restaurant.findById(user.restaurant)
      .populate("owner", "username email")
      .populate("chefs", "username email");

    res.json({ success: true, restaurant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res
        .status(403)
        .json({ message: "Only owners can update a restaurant" });
    }

    const { id } = req.params;

    // check if restaurant belongs to this owner
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not the owner of this restaurant" });
    }

    const {
      name,
      address,
      phone,
      email,
      tableCount,
      openingTime,
      closingTime,
    } = req.body;

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      { name, address, phone, email, tableCount, openingTime, closingTime },
      { new: true, runValidators: true }
    );

    res.json({ success: true, restaurant: updatedRestaurant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
