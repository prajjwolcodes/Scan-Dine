import { io } from "socket.io-client";

const restaurantId = "68a8075cd597ed2a11b59cb7"; // 👈 Replace with real restaurant id
const socket = io("http://localhost:8000");

socket.on("connect", () => {
  console.log("✅ Customer connected:", socket.id);

  // Simulate placing an order after 2 seconds
  setTimeout(() => {
    const order = {
      items: ["Pizza", "Pasta"],
      table: 5,
      note: "Extra cheese",
    };
    socket.emit("placeOrder", { restaurantId, order });
    console.log("🛒 Customer placed order:", order);
  }, 2000);
});

socket.on("disconnect", () => {
  console.log("❌ Customer disconnected");
});
