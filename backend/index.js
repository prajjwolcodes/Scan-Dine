import { configDotenv } from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import menuItemsRoutes from "./routes/menuItemsRoutes.js";
import checkoutRoutes from "./routes/checkoutRoute.js";
import qrRoutes from "./routes/qrRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import { connectDb } from "./database/db.js";
import { initSocket } from "./socket/io.js";

const app = express();
configDotenv();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDb();
app.use(
  cors({
    origin: "*", // your Next.js frontend
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 8000;

// routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/menu-items", menuItemsRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/checkout", checkoutRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
