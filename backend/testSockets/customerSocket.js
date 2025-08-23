import { io } from "socket.io-client";

const restaurantId = "68a8075cd597ed2a11b59cb7"; // 👈 Replace with real restaurant id
const socket = io("http://localhost:8000");

socket.on("connect", () => {
  console.log("✅ Customer connected:", socket.id);
});
socket.emit("joinRestaurant", { restaurantId });
socket.on("order:update", (order) => {
  console.log("🍽️ Order updated:", order);
});

socket.on("disconnect", () => {
  console.log("❌ Customer disconnected");
});
