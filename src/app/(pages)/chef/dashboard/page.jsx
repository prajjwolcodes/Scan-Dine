"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/app/store/authSlice";

let socket;

export default function ChefDashboard() {
  const { user, token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const dispatch = useDispatch();
  const [restaurant, setRestaurant] = useState(null);
  const [latestOrder, setLatestOrder] = useState(null);
  const [fadingOrderId, setFadingOrderId] = useState(null); // New state to track fading order
  const statuses = [
    "pending",
    "accepted",
    "preparing",
    "completed",
    "cancelled",
  ];

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
      setRestaurant(res.data.restaurant || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch orders");
    }
  };

  useEffect(() => {
    if (user?.restaurant) {
      fetchOrders();
      socket = io("http://localhost:8000");

      socket.on("connect", () => {
        socket.emit("joinRestaurant", { restaurantId: user.restaurant });
      });

      // New order received: Display it without fading
      socket.on("order:new", (order) => {
        toast.success(`New order from table ${order.tableNumber}`);
        setLatestOrder(order);
        setOrders((prev) => [order, ...prev]);
        setFadingOrderId(null); // Ensure no old fade is active
      });

      // Order updated
      socket.on("order:update", (updatedOrder) => {
        setOrders((prev) =>
          prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
      });

      return () => socket.disconnect();
    }
  }, [user]);

  const acceptOrder = async (orderId) => {
    try {
      const res = await api.patch(
        `/orders/status/${orderId}`,
        { status: "accepted" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit("order:update", res.data.order);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data.order : o))
      );
      setLatestOrder(res.data.order);
      toast.success(`Order ${orderId} accepted`);

      // Start the fade-out effect
      setFadingOrderId(orderId);

      // Use a timeout to hide the notification after the fade completes
      setTimeout(() => {
        setLatestOrder(null);
        setFadingOrderId(null);
      }, 5000); // 3 seconds includes both the delay and the fade transition
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept order");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button onClick={() => dispatch(logout())}>Logout</button>
      <h1 className="text-2xl font-bold mb-4">Chef Dashboard</h1>
      {restaurant ? (
        <p>{restaurant.name}</p>
      ) : (
        <p className="text-gray-400">Unkwown</p>
      )}

      {/* Latest Order Notification with fade effect */}
      {latestOrder && (
        <div
          className={`p-4 border flex justify-between rounded shadow transition-opacity duration-1000 ${
            fadingOrderId === latestOrder._id
              ? "opacity-0"
              : "opacity-100 bg-yellow-50"
          }`}
        >
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Latest Order</p>
            <p>Table: {latestOrder.tableNumber}</p>
            <p>Status: {latestOrder.status}</p>
            <div>
              Items:{" "}
              {latestOrder.items.map((i, idx) => (
                <div key={idx}>{`${i.name} x${i.quantity}`}</div>
              ))}
            </div>
          </div>
          {latestOrder.status === "pending" && (
            <Button onClick={() => acceptOrder(latestOrder._id)}>Accept</Button>
          )}
        </div>
      )}

      {/* Tabs by status */}
      <Tabs defaultValue="pending">
        <TabsList>
          {statuses.map((status) => (
            <TabsTrigger key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {statuses.map((status) => (
          <TabsContent key={status} value={status}>
            {orders.filter((o) => o.status === status).length === 0 ? (
              <p className="text-gray-500">No orders in this status.</p>
            ) : (
              <div className="space-y-4 mt-4">
                {orders
                  .filter((o) => o.status === status)
                  .map((order) => (
                    <div
                      key={order._id}
                      className="p-4 border rounded shadow flex justify-between items-center"
                    >
                      <div>
                        <p>
                          Table: <strong>{order.tableNumber}</strong>
                        </p>
                        <div>
                          Items:{" "}
                          {order.items.map((i, idx) => (
                            <div key={idx}>{`${i.name} x${i.quantity}`}</div>
                          ))}
                        </div>
                      </div>
                      {status === "pending" && (
                        <Button onClick={() => acceptOrder(order._id)}>
                          Accept
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
