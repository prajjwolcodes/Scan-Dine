import express from "express";

import { registerOwner, login } from "../controllers/auth/authController.js";
import { createChef, getAllChefs, removeChef } from "../controllers/chef/createChef.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", registerOwner);
router.post("/login", login);
router.post("/createchef", authMiddleware, createChef);
router.post("/chefs", authMiddleware, getAllChefs);
router.delete("/chef/remove/:chefId", authMiddleware, removeChef);

export default router;
