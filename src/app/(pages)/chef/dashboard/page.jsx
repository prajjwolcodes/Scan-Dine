"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/store/authSlice";
import AcceptedOrdersBar from "../components/AcceptedOrdersBar";
import NewOrderPopup from "../components/NewOrderPopup";
import OrderTabs from "../components/OrderTabs";
import { LogOut } from "lucide-react";

// IMPORTANT: ensure socket server URL is correct for your environment
let socket;

export default function ChefDashboard() {
  const { user, token } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const [orders, setOrders] = useState([]); // all orders
  const [restaurant, setRestaurant] = useState(null);
  const [latestOrder, setLatestOrder] = useState(null); // newest incoming order (for popup)
  const [highlightedOrders, setHighlightedOrders] = useState(new Set()); // items-added highlights

  // audio ref so we don't recreate element repeatedly
  const audioRef = useRef(null);
  useEffect(() => {
    audioRef.current =
      typeof Audio !== "undefined"
        ? new Audio("/sounds/notification.mp3")
        : null;
  }, []);

  // Fetch all orders & restaurant info on mount
  const fetchOrders = async () => {
    try {
      // your existing route used in original code was GET /orders
      const res = await api.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
      setRestaurant(res.data.restaurant || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch orders");
    }
  };

  useEffect(() => {
    if (!user?.restaurant) return;
    fetchOrders();

    // connect socket
    socket = io(
      /* you can replace with process.env.SOCKET_URL */ "http://localhost:8000",
      {
        transports: ["websocket"],
      }
    );

    socket.on("connect", () => {
      socket.emit("joinRestaurant", { restaurantId: user.restaurant });
    });

    // New order arrives
    socket.on("order:new", (order) => {
      // play sound
      try {
        audioRef.current?.play().catch(() => {});
      } catch (e) {}
      toast.success(`New order — Table ${order.tableNumber}`);

      setLatestOrder(order);
      setOrders((prev) => [order, ...prev]);
    });

    // Items added to existing order
    socket.on("order:items-added", ({ order, message }) => {
      toast.success(message || `Items added to Table ${order.tableNumber}`);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));

      // highlight the order briefly
      setHighlightedOrders((s) => {
        const next = new Set(s);
        next.add(order._id);
        return next;
      });
      setTimeout(() => {
        setHighlightedOrders((s) => {
          const next = new Set(s);
          next.delete(order._id);
          return next;
        });
      }, 10000); // highlight 10s
    });

    // Generic order update
    socket.on("order:update", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
      // clear latestOrder if it was updated/accepted
      setLatestOrder((lo) => (lo && lo._id === updatedOrder._id ? null : lo));
    });

    // cleanup
    return () => {
      socket?.disconnect();
      socket = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.restaurant, token]);

  // handler to update order status (accept / complete / cancel)
  const updateOrderStatus = async (orderId, payload) => {
    try {
      const res = await api.patch(`/orders/status/${orderId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // emit via socket to notify others (server probably emits already, but keep local sync)
      socket?.emit("order:update", res.data.order);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data.order : o))
      );
      toast.success(`Order ${orderId} ${payload.status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    }
  };

  // Accept order convenience wrapper (include chefId)
  const acceptOrder = async (orderId) => {
    await updateOrderStatus(orderId, { status: "accepted", chefId: user?._id });
  };

  return (
    <ProtectedRoute allowedRoles={["chef"]}>
      <div className="px-4 py-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Chef Dashboard</h1>
            <p className="text-sm text-gray-600">
              {user?.username} · {restaurant?.name || "Restaurant"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => dispatch(logout())}>
              <LogOut className="h-4 w-4 " /> Logout
            </Button>
          </div>
        </div>

        {/* Always-visible accepted/preparing orders bar */}
        <AcceptedOrdersBar
          orders={orders.filter((o) =>
            ["accepted", "preparing"].includes(o.status)
          )}
          onComplete={(id) => updateOrderStatus(id, { status: "completed" })}
          highlightedOrders={highlightedOrders}
        />

        {/* New order popup (appears when latestOrder exists and status pending) */}
        <NewOrderPopup
          order={latestOrder}
          onAccept={(id) => acceptOrder(id)}
          onClose={() => setLatestOrder(null)}
        />

        {/* Tabs for pending / preparing / completed / cancelled */}
        <OrderTabs
          orders={orders}
          onAccept={acceptOrder}
          onComplete={(id) => updateOrderStatus(id, { status: "completed" })}
          highlightedOrders={highlightedOrders}
        />
      </div>
    </ProtectedRoute>
  );
}
