"use client";

import { motion } from "framer-motion";
import OrderCard from "./OrderCard";

/**
 * AcceptedOrdersBar
 * - orders: array of accepted/preparing orders
 * - onComplete(orderId)
 * - highlightedOrders: Set of order ids to highlight
 *
 * This bar is sticky and horizontally scrollable.
 */

export default function AcceptedOrdersBar({
  orders = [],
  onComplete,
  highlightedOrders = new Set(),
}) {
  return (
    <div className="bg-white rounded-2xl sm:shadow-sm p-1 sm:p-3 sm:px-4 sm:border">
      <h3 className="sm:text-sm font-semibold ml-2 sm:ml-0 mb-1 sm:mb-2">
        Cooking Now
      </h3>

      {orders.length === 0 ? (
        <div className="text-sm text-gray-500 py-6 text-center">
          No active cooking orders
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-x-auto no-scrollbar py-2">
          {orders.map((o) => (
            <motion.div
              key={o._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              <OrderCard
                order={o}
                compact
                highlighted={highlightedOrders.has(o._id)}
                onComplete={() => onComplete(o._id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
