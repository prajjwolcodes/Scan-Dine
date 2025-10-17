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
import { Separator } from "@/components/ui/separator";
import api from "@/lib/axios";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Clock, Hamburger } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import {
  saveGuestOrder,
  markGuestOrderCompleted,
  getGuestOrderCompletedAt,
  removeGuestOrder,
} from "@/lib/guestOrder";

let socket;

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/order/${orderId}`);
        setOrder(res.data.order);
        setLoading(false);
        // ensure guest order persistence has restaurantId
        saveGuestOrder({
          id: res.data.order._id,
          restaurantId: res.data.order.restaurant?._id,
          status: res.data.order.status,
        });
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch order");
      }
    };

    fetchOrder();
    socket = io("http://localhost:8000");
    socket.emit("joinOrder", { orderId });

    socket.on("order:update", (updatedOrder) => {
      toast.success(`Order status updated to ${updatedOrder.status}`);
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
        if (
          updatedOrder.status === "completed" &&
          !getGuestOrderCompletedAt()
        ) {
          const completedAt = markGuestOrderCompleted(orderId);
          setRemainingTime(15 * 60);
        }
      }
    });

    return () => socket.disconnect();
  }, [orderId]);

  // ⏱ Countdown setup
  useEffect(() => {
    const saved = getGuestOrderCompletedAt();
    if (!saved) return;

    const { completedAt } = saved;
    const now = Date.now();
    const elapsed = Math.floor((now - completedAt) / 1000);

    if (elapsed < 15 * 60) {
      setRemainingTime(15 * 60 - elapsed);
    } else {
      removeGuestOrder();
      setRemainingTime(0);
    }
  }, []);

  useEffect(() => {
    if (remainingTime <= 0) return;
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          removeGuestOrder();
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading your order...
      </div>
    );

  if (!order)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Order not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-2">
      {/* Header */}
      <header className="flex items-center sticky top-0 z-30 backdrop-blur-sm ">
        <Button
          variant="ghost"
          onClick={() =>
            order.restaurant._id
              ? router.push("/menu/" + order.restaurant._id)
              : router.back()
          }
          className="text-white max-w-sm hover:bg-white/10"
        >
          <ArrowLeft size={30} className="h-10 w-10 mr-1 text-black" />
        </Button>
        <div className=" py-3 flex items-center gap-3">
          <Image
            src={order?.restaurant?.logo || "/logo.png"}
            alt={order?.restaurant?.name || "Restaurant"}
            className="w-12 h-12 rounded-full object-cover border"
            width={48}
            height={48}
          />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {order?.restaurant?.name || "Restaurant Menu"}
            </h1>
            <p className="text-xs text-gray-500">
              {order?.restaurant?.address || ""}
            </p>
          </div>
        </div>
      </header>

      <div className="flex justify-between items-center p-2 pt-8">
        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto rounded-2xl p-4 space-y-6"
        >
          <div className="flex justify-center">
            {order.status === "completed" && (
              <CheckCircle className="text-green-500 h-14 w-14" />
            )}
            {order.status === "accepted" && (
              <Hamburger className="text-yellow-500 h-16 w-16" />
            )}

            {order.status === "pending" && <Clock className="h-14 w-14" />}
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {order.status === "completed" && "Your order is completed!"}
              {order.status === "accepted" && "Your order is cooking!"}
              {order.status === "pending" && "Order in progress!"}
            </h2>
            <p className="text-gray-600">
              {order.status === "completed" &&
                "Enjoy your meal, and don’t forget to settle your payment."}
              {order.status === "accepted" &&
                "Hang tight! Our chefs are preparing your order."}
              {order.status === "pending" &&
                "Please wait while we prepare your delicious order."}
            </p>
          </div>

          <div className="border-t pt-4 space-y-3 text-gray-700">
            <p>
              <span className="font-medium">Table:</span> {order.tableNumber}
            </p>
            <p>
              <span className="font-medium">Customer:</span>{" "}
              {order.customerName || "Guest"}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`${
                  order.status === "pending"
                    ? ""
                    : order.status === "accepted"
                    ? "text-yellow-600"
                    : order.status === "completed"
                    ? "text-green-600"
                    : "text-gray-500"
                } font-semibold`}
              >
                {order.status.toUpperCase()}
              </span>
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Ordered Items</h3>
            <div className="bg-gray-50 rounded-lg py-3 space-y-2">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-gray-700 text-sm border-b last:border-0 pb-2"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>Rs {item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Order link copied to clipboard");
              }}
              className="rounded-full py-2 px-4 "
            >
              Copy Order Link
            </Button>

            <p className="text-right text-lg font-semibold text-gray-900">
              Total: Rs {order.totalAmount}
            </p>
          </div>

          <Separator className="mt-6" />

          {/* Countdown */}
          <AnimatePresence>
            {order.status === "completed" && remainingTime > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-center text-sm"
              >
                <p>
                  This order session will expire in{" "}
                  <span className="font-semibold">
                    {formatTime(remainingTime)}
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-3 justify-center">
            {order.status === "completed" &&
              (order.paymentStatus === "UNPAID" ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-green-600 text-white rounded-full hover:bg-green-700">
                      Pay Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle className="flex font-semibold items-center">
                        Choose Payment Method
                      </DialogTitle>
                    </DialogHeader>
                    <PaymentOptions orderId={order._id} />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" className="border-gray-300">
                          Cancel
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full bg-green-600 text-white rounded-full cursor-default"
                  >
                    PAID
                  </Button>
                  <h1 className="text-sm text-green-600">
                    Thank you for your payment!
                  </h1>
                </>
              ))}
          </div>
        </motion.div>
      </div>

      <div
        className="fixed bottom-0 w-full flex flex-col items-center
       justify-center mt-10 mb-6 text-xs text-gray-500"
      >
        <p>
          {" "}
          {order?.restaurant?.name || "Restaurant"} - &copy;{" "}
          {new Date().getFullYear()}
        </p>
        <p>
          {order?.restaurant?.address} {order?.restaurant?.phone}{" "}
        </p>
      </div>
    </div>
  );
}
