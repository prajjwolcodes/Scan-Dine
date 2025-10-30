import Restaurant from "../../models/restaurantSchema.js";
import User from "../../models/userSchema.js";
import { generateQR } from "../../utils/qrCodeGenerator.js";

export const generateRestaurantQR = async (req, res) => {
  const { userId } = req.params;
  if (req.user._id.toString() !== userId) {
    return res.status(403).json({ message: "Not authorized" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const restaurant = await Restaurant.findById(user.restaurant);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    // Only owner can generate QR
    if (restaurant.owner.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const menuUrl = `${process.env.FRONT_END_APP_URL}/menu/${restaurant._id}`;
    const qrCodeDataUrl = await generateQR(menuUrl);

    // Save QR code in DB
    restaurant.qrCodeUrl = qrCodeDataUrl;
    await restaurant.save();

    res.status(200).json({ success: true, qrCodeUrl: qrCodeDataUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
