"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { Bell, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

const socket = io(process.env.NEXT_PUBLIC_API_URL);

export default function ChefDashboard() {
  const [orders, setOrders] = useState([]);
  const [newOrders, setNewOrders] = useState([]);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    fetchOrders();
    socket.on("order:new", (order) => handleNewOrder(order));
    return () => socket.off("order:new");
  }, []);

  const fetchOrders = async () => {
    const { data } = await api.get("/orders/active?status=pending");
    setOrders(data.orders);
  };

  const handleNewOrder = (order) => {
    setNewOrders((prev) => [order, ...prev]);
    if (soundOn) {
      const alert = new Audio("/sounds/new-order.mp3");
      alert.play();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-red-500" />
          <h2 className="font-semibold text-lg">Chef Dashboard</h2>
        </div>
        <Button
          variant={soundOn ? "default" : "outline"}
          onClick={() => setSoundOn(!soundOn)}
        >
          <Bell className="mr-2 w-4 h-4" /> {soundOn ? "Sound On" : "Sound Off"}
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* New Orders */}
        {newOrders.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              New Orders
            </h3>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {newOrders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-red-300 rounded-xl shadow-md p-4 animate-pulse-soft"
                >
                  <div className="flex justify-between">
                    <h4 className="font-semibold text-lg">
                      Table {order.tableNumber}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {order.customerName}
                    </span>
                  </div>
                  <ul className="mt-2 text-sm text-gray-700">
                    {order.items.slice(0, 3).map((i) => (
                      <li key={i._id}>
                        • {i.name} × {i.quantity}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-4 w-full bg-red-500 hover:bg-red-600">
                    Accept Order
                  </Button>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Active Orders */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Active Orders</h3>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border rounded-xl shadow p-4"
              >
                <div className="flex justify-between">
                  <h4 className="font-semibold">Table {order.tableNumber}</h4>
                  <span className="text-gray-500 text-sm">{order.status}</span>
                </div>
                <ul className="mt-2 text-sm text-gray-700">
                  {order.items.slice(0, 3).map((i) => (
                    <li key={i._id}>
                      • {i.name} × {i.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
