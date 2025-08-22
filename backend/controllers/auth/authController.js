import User from "../../models/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role, restaurant: user.restaurant },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const registerOwner = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, 10),
      role: "owner",
    });

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      user: { _id: user._id, username: user.username, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "User with that email do not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({
      success: true,
      user: { _id: user._id, username: user.username, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
