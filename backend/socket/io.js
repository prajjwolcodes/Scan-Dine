// socket/io.js
import { Server } from "socket.io";

export let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST", "PATCH"] },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("joinRestaurant", ({ restaurantId }) => {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`👨‍🍳 Chef joined restaurant`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
}
