"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

let socket;

export default function OrderStatusPage() {
  const { orderId } = useParams();
  console.log(orderId);
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/order/${orderId}`);
        setOrder(res.data.order);
        setLoading(false);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch order");
      }
    };

    fetchOrder();

    // Connect to socket
    socket = io("http://localhost:8000");

    // Join the order room
    socket.emit("joinOrder", { orderId });

    // Listen for updates
    socket.on("order:update", (updatedOrder) => {
      console.log(order);
      toast.success(`Order status updated to ${updatedOrder.status}`);
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  if (loading) return <p className="p-6">Loading order...</p>;
  if (!order) return <p className="p-6 text-red-500">Order not found</p>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-center">Order Status</h2>
      <p className="text-gray-700">
        Order ID: <span className="font-mono">{order._id}</span>
      </p>
      <p className="text-gray-700">Table: {order.tableNumber}</p>
      <p className="text-gray-700">Customer: {order.customerName}</p>
      <p className="text-gray-700">
        Status:{" "}
        <span
          className={`font-semibold ${
            order.status === "pending"
              ? "text-yellow-600"
              : order.status === "preparing"
              ? "text-blue-600"
              : order.status === "ready"
              ? "text-green-600"
              : "text-gray-500"
          }`}
        >
          {order.status.toUpperCase()}
        </span>
      </p>

      <h3 className="font-semibold mt-4">Items</h3>
      <ul className="list-disc pl-5 space-y-1">
        {order.items.map((item, index) => (
          <li key={index}>
            {item.name} x {item.quantity} = Rs {item.unitPrice * item.quantity}
          </li>
        ))}
      </ul>

      <p className="font-semibold text-lg text-right">
        Total: Rs {order.totalAmount}
      </p>

      <div className="text-center">
        <Button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
        >
          Copy Order Link
        </Button>
      </div>
      <div className="text-center">
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    </div>
  );
}
