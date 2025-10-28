"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { BellPlus } from "lucide-react";

export default function NewOrderPopup({ order, onAccept, onClose }) {
  useEffect(() => {
    // no-op; parent handles audio play
  }, [order]);

  return (
    <AnimatePresence>
      {order && order.status === "pending" && (
        <motion.div
          key={order._id}
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-x-0 top-5 z-50 flex justify-center px-4"
          aria-live="assertive"
        >
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
            {/* Left Content */}
            <div className="flex-1 min-w-full">
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-base">
                  <span role="img" aria-label="New">
                    <BellPlus className="h-5 w-5" />
                  </span>{" "}
                  New Order
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-500 font-medium">
                  Table{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {order.tableNumber}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-gray-800 dark:text-gray-200 text-sm">
                <div className="font-semibold mb-1">Items</div>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-600 scrollbar-track-transparent">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="truncate">
                      {item.name}{" "}
                      <span className="text-gray-500 dark:text-gray-400">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-shrink-0 flex-col gap-3 w-full md:w-auto">
              <Button
                onClick={() => onAccept(order._id)}
                className="bg-gray-700 hover:bg-gray-800 text-gray-100 rounded-xl px-5 py-2 text-sm font-semibold shadow-md transition-colors"
              >
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => onClose()}
                className="border-gray-700 text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl px-5 py-2 text-sm font-semibold transition-colors"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
