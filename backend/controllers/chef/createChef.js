import User from "../../models/userSchema.js";

export const createChef = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ message: "Only owners can create chefs" });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const chef = await User.create({
      username,
      email,
      password,
      role: "chef",
      restaurant: req.user.restaurant, // link chef to owner’s restaurant
    });

    res.status(201).json({
      success: true,
      chef: { id: chef._id, username: chef.username, role: chef.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
