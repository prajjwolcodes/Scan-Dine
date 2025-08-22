import { configDotenv } from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { connectDb } from "./database/db.js";

const app = express();
configDotenv();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDb();
app.use(
  cors({
    origin: "*", // your Next.js frontend
    methods: ["GET", "POST"],
    credentials: true,
  })
);
const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", // must match frontend
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

const PORT = process.env.PORT || 8000;

// routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// io.on("connection", (socket) => {
//   console.log("New client connected:", socket.id);

//   socket.on("join", ({ room }) => {
//     socket.join(room);
//     socket.to(room).emit("msg", `Client ${socket.id} joined room: ${room}`);
//   });

//   socket.on("msg", ({ inputValue, room }) => {
//     console.log("Received message from client:", inputValue);
//     if (room) io.to(room).emit("msg", inputValue); // send to specific room
//     else socket.emit("msg", "Select a room first"); // send to the sender only
//     // socket.broadcast.emit("msg", `All received: ${inputValue}`); // echo back to all clients
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected:", socket.id);
//   });
// });
