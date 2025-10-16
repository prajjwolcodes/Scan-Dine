"use client";

import PaymentOptions from "@/components/PaymentOptions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/lib/axios";
import { CreditCard } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

let socket;

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ timer state
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/order/${orderId}`);
        setOrder(res.data.order);
        setLoading(false);

        // store guest order in localStorage without timer yet
        localStorage.setItem(
          "guestOrder",
          JSON.stringify({
            id: res.data.order._id,
            status: res.data.order.status,
          })
        );
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch order");
      }
    };

    fetchOrder();

    // Connect to socket
    socket = io("http://localhost:8000");

    socket.emit("joinOrder", { orderId });

    socket.on("order:update", (updatedOrder) => {
      toast.success(`Order status updated to ${updatedOrder.status}`);
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);

        // ✅ start timer if completed
        if (
          updatedOrder.status === "completed" &&
          !localStorage.getItem("guestOrderCompletedAt")
        ) {
          const completedAt = Date.now();
          localStorage.setItem(
            "guestOrderCompletedAt",
            JSON.stringify({ id: orderId, completedAt })
          );

          // start countdown
          setRemainingTime(15 * 60); // 15 minutes in seconds
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  // ✅ Countdown effect
  useEffect(() => {
    const saved = localStorage.getItem("guestOrderCompletedAt");
    if (!saved) return;

    const { completedAt } = JSON.parse(saved);
    const now = Date.now();
    const elapsed = Math.floor((now - completedAt) / 1000);

    if (elapsed < 15 * 60) {
      setRemainingTime(15 * 60 - elapsed);
    } else {
      // remove localStorage if more than 15 mins
      localStorage.removeItem("guestOrder");
      localStorage.removeItem("guestOrderCompletedAt");
      setRemainingTime(0);
    }
  }, []);

  // timer countdown
  useEffect(() => {
    if (remainingTime <= 0) return;
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          localStorage.removeItem("guestOrder");
          localStorage.removeItem("guestOrderCompletedAt");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingTime]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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
              : order.status === "accepted"
              ? "text-blue-600"
              : order.status === "completed"
              ? "text-green-600"
              : "text-gray-500"
          }`}
        >
          {order.status.toUpperCase()}
        </span>
      </p>

      {/* ✅ Countdown Timer */}
      {order.status === "completed" && remainingTime > 0 && (
        <p className="text-center text-green-600 font-semibold">
          Order will be cleared from your session in:{" "}
          {formatTime(remainingTime)}
        </p>
      )}

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

      <div className="flex items-center gap-4">
        <div className="text-center">
          <Button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            Copy Order Link
          </Button>
        </div>
        <div className="text-center bg-blue-600 text-white">
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>

        {order.status === "completed" &&
          (order.paymentStatus === "UNPAID" ? (
            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-green-400 text-white">
                    Pay Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Payment Method
                    </DialogTitle>
                  </DialogHeader>
                  <PaymentOptions orderId={order._id} />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
          ) : (
            <Button variant="outline" className="bg-green-600 text-white">
              PAID
            </Button>
          ))}
      </div>

      {order.status === "completed" && (
        <p className="text-green-600 font-semibold text-center">
          Your order is completed! Enjoy your meal 🍽️
        </p>
      )}
    </div>
  );
}
