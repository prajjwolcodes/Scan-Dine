"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { BellRing, CheckCircle2, Flame, Timer } from "lucide-react";

export default function OrderCard({
  order,
  compact = false,
  highlighted = false,
  onAccept,
  onComplete,
}) {
  const [elapsed, setElapsed] = useState(() => {
    if (!order?.acceptedAt && !order?.createdAt) return 0;
    const base = order.acceptedAt
      ? new Date(order.acceptedAt)
      : new Date(order.createdAt);
    return Math.floor((Date.now() - base.getTime()) / 1000);
  });

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const isPending = order?.status === "pending";
  const isCooking = order?.status === "accepted";
  const isCompleted = order?.status === "completed";

  // ---------- Compact version (horizontal bar) ----------
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className={`min-w-[260px] bg-white border rounded-2xl p-3 flex flex-col gap-3 shadow-sm hover:shadow-md transition ${
          highlighted ? "ring-2 ring-blue-400" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPending ? (
              <BellRing className="h-5 w-5 text-amber-500" />
            ) : isCooking ? (
              <Flame className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            <div className="font-semibold text-gray-800 text-base sm:text-base">
              Table {order.tableNumber}
            </div>
          </div>
          <div
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isPending
                ? "bg-amber-100 text-amber-700"
                : isCooking
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isPending && "Pending"}
            {isCooking && "Cooking"}
            {isCompleted && "Completed"}
          </div>
        </div>

        <div className="flex-col sm:flex-row justify-between items-center">
          <div className="text-xs sm:text-sm text-gray-700 max-h-24 overflow-auto">
            {order.items.map((it, idx) => (
              <div className="text-sm" key={idx}>
                {it.name} × {it.quantity}
              </div>
            ))}
            <div className="mt-3 text-sm text-gray-500">
              From : {order.customerName || "—"}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {isPending && (
              <Button
                size="sm"
                className="rounded-xl w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-gray-100"
                onClick={() => onAccept && onAccept(order._id)}
              >
                Accept
              </Button>
            )}
            {isCooking && (
              <Button
                size="sm"
                className="rounded-xl sm:px-6 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-gray-100"
                onClick={() => onComplete && onComplete(order._id)}
              >
                Complete
              </Button>
            )}
          </div>
        </div>

        {highlighted && (
          <div className="text-xs text-blue-600 mt-1 font-semibold">
            🔹 New items added
          </div>
        )}
      </motion.div>
    );
  }

  // ---------- Full version ----------
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition ${
        highlighted ? "ring-2 ring-blue-400" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-6">
        {/* Left Section */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full flex justify-between items-center">
              <div className="flex gap-2 items-center text-base sm:text-lg font-bold">
                {isPending ? (
                  <BellRing className="h-4 w-4 text-amber-600" />
                ) : isCooking ? (
                  <Flame className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                Table {order.tableNumber}
              </div>

              <div className="text-base font-semibold text-gray-800">
                Rs {order.totalAmount}
              </div>
            </div>

            {highlighted && (
              <div className="ml-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                New items
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="mt-2 text-sm text-gray-700 space-y-1 max-h-32 overflow-auto">
            {order.items.map((it, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border-b border-gray-100 py-1"
              >
                <div className="truncate w-3/4">
                  {it.name} × {it.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-sm text-gray-500">
            From : {order.customerName || "—"}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col sm:items-end justify-between gap-2 sm:gap-3">
          {isPending && (
            <Button
              className="rounded-xl bg-gray-800 hover:bg-gray-900 text-gray-100"
              onClick={() => onAccept && onAccept(order._id)}
            >
              Accept
            </Button>
          )}
          {isCooking && (
            <Button
              className="rounded-xl bg-green-600 hover:bg-green-700 text-gray-100"
              onClick={() => onComplete && onComplete(order._id)}
            >
              Complete
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
