import { io } from "socket.io-client";

const restaurantId = "68a8075cd597ed2a11b59cb7"; // replace with actual MongoDB restaurant ID
const socket = io("http://localhost:8000");

socket.on("connect", () => {
  console.log("✅ Chef connected:", socket.id);

  socket.emit("joinRestaurant", { restaurantId });
});

socket.on("order:new", (order) => {
  console.log("🍽️ New DB order received:", order);
});
