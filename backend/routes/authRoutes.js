import express from "express";

import { registerOwner, login } from "../controllers/auth/authController.js";
// const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", registerOwner);
router.post("/login", login);

export default router;
