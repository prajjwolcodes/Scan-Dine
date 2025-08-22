import express from "express";

import { registerOwner, login } from "../controllers/auth/authController.js";
import { createChef } from "../controllers/chef/createChef.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/signup", registerOwner);
router.post("/login", login);
router.post("/createchef", authMiddleware, createChef);

export default router;
