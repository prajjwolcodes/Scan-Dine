import express from "express";

import { registerOwner, login } from "../controllers/auth/authController.js";
import { createChef, getAllChefs } from "../controllers/chef/createChef.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", registerOwner);
router.post("/login", login);
router.post("/createchef", authMiddleware, createChef);
router.post("/chefs", authMiddleware, getAllChefs);

export default router;
