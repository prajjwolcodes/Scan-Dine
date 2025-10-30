// socket/io.js
import { Server } from "socket.io";

export let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONT_END_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("joinRestaurant", ({ restaurantId }) => {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`👨‍🍳 Chef joined restaurant`);
    });

    socket.on("joinOrder", ({ orderId }) => {
      socket.join(`order:${orderId}`);
      console.log(`Client joined order:${orderId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
}

// export const getIO = () => {
//   if (!io) throw new Error("Socket.io not initialized!");
//   return io;
// };

// Initialize Socket.IO
// const io = initSocket(server);

// Pass io to controllers via app.set (optional)
// app.set("io", io);

//  const io = getIO();
// io.to(`restaurant:${restaurantId}`).emit("order:update", order);
