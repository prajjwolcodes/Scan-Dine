import Restaurant from "../../models/restaurantSchema.js";
import User from "../../models/userSchema.js";
import { generateQR } from "../../utils/qrCodeGenerator.js";

export const generateRestaurantQR = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const restaurant = await Restaurant.findById(req.user.restaurant);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    // Only owner can generate QR
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const menuUrl = `${process.env.APP_URL_DEV}/menu/${restaurant._id}`;
    const qrCodeDataUrl = await generateQR(menuUrl);

    // Save QR code in DB
    restaurant.qrCodeUrl = qrCodeDataUrl;
    await restaurant.save();

    res.json({ success: true, qrCodeUrl: qrCodeDataUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
