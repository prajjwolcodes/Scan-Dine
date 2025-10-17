"use client";

import {
  clearCart,
  closeCart,
  decreaseQty,
  increaseQty,
  openCart,
  placeOrder,
  removeItem,
} from "@/app/store/cartSlice";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/axios"; // Assuming this is your Axios instance

export default function CartDrawer({ restaurantId }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const cart = useSelector((s) => s.cart);
  const { placing, lastOrder, orderError } = cart;

  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [tableNumber, setTableNumber] = useState();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isClient, setIsClient] = useState(false);

  const openDrawer = () => dispatch(openCart());
  const closeDrawer = () => dispatch(closeCart());

  // ✅ Fetch available (unbooked) tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await api.get(`/restaurant/${restaurantId}/tables`);

        setTables(res.data.availableTables);
      } catch (err) {
        console.error("Failed to fetch tables:", err);
        toast.error("Couldn't load tables");
      }
    };
    if (restaurantId) fetchTables();
  }, [restaurantId]);

  const handlePlaceOrder = async () => {
    setLoading(true);
    if (!tableNumber) {
      toast.error("Please select your table number");
      setLoading(false);
      return;
    }
    if (cart.items.length === 0) {
      toast.error("Cart is empty");
      setLoading(false);
      return;
    }

    try {
      const res = await dispatch(
        placeOrder({
          restaurantId,
          tableNumber: Number(tableNumber.split(" ")[1].trim()),
          customerName,
          customerPhone,
        })
      );

      if (res.meta.requestStatus === "fulfilled") {
        dispatch(clearCart());
        const orderId = res.payload.order._id;

        const orderData = {
          id: orderId,
          status: res.payload.order.status,
          timestamp: Date.now(),
        };
        localStorage.setItem("guestOrder", JSON.stringify(orderData));

        toast.success("Order placed successfully!");
        closeDrawer();
        router.push(`/orderSuccess/${orderId}`);
      } else toast.error(res.payload || "Failed to place order.");
    } catch (error) {
      console.error(error);
      toast.error("Unexpected error while placing order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    const savedOrder = localStorage.getItem("guestOrder");
    if (savedOrder) {
      try {
        const { id, timestamp } = JSON.parse(savedOrder);
        const now = Date.now();
        if (now - timestamp <= 15 * 60 * 1000) {
          router.replace(`/orderSuccess/${id}`);
        } else {
          localStorage.removeItem("guestOrder");
        }
      } catch (e) {
        console.error("Error parsing guestOrder:", e);
        localStorage.removeItem("guestOrder");
      }
    }
  }, [router]);

  useEffect(() => {
    if (lastOrder) {
      setTableNumber("");
      setCustomerName("");
      setCustomerPhone("");
    }
    if (orderError) toast.error(orderError);
  }, [lastOrder, orderError]);

  return (
    <>
      {/* Loading Overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <p className="text-white text-lg font-medium animate-pulse">
            Placing order...
          </p>
        </motion.div>
      )}

      {/* Floating Cart Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <button
          onClick={openDrawer}
          className="flex items-center gap-3 bg-black text-white px-5 py-3 rounded-full shadow-2xl transition-all duration-200"
        >
          {isClient ? (
            <>
              <span className="font-semibold">{cart.totalQty}</span>
              <span className="text-sm text-gray-200">items</span>
              <span className="font-medium text-gray-400">•</span>
              <span className="font-semibold">
                Rs {cart.totalPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <>
              <span className="font-semibold">0</span>
              <span className="text-sm text-gray-200">items</span>
              <span className="font-medium text-gray-400">•</span>
              <span className="font-semibold">Rs 0.00</span>
            </>
          )}
        </button>
      </motion.div>

      {/* Drawer */}
      <AnimatePresence>
        {cart.open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              onClick={closeDrawer}
            />

            {/* Drawer Panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
              className="fixed right-0 top-0 z-40 w-full max-w-md h-full bg-white shadow-2xl rounded-l-3xl p-6 flex flex-col overflow-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <motion.h3
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-gray-900"
                >
                  Your Cart
                </motion.h3>
                <button
                  onClick={closeDrawer}
                  className="text-gray-400 hover:text-gray-800 transition-colors text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Items */}
              {cart.items.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 text-center mt-20"
                >
                  No items in cart.
                </motion.p>
              ) : (
                <motion.div
                  className="flex-1 space-y-5"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 },
                    },
                  }}
                >
                  {cart.items.map((it) => (
                    <motion.div
                      key={it._id}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 },
                      }}
                      className="flex items-center justify-between border-b pb-3 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{it.name}</p>
                        <p className="text-sm text-gray-500">
                          Rs {it.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 py-1 border rounded hover:bg-gray-100 transition-colors"
                          onClick={() => dispatch(decreaseQty(it._id))}
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-medium">
                          {it.qty}
                        </span>
                        <button
                          className="px-2 py-1 border rounded hover:bg-gray-100 transition-colors"
                          onClick={() => dispatch(increaseQty(it._id))}
                        >
                          +
                        </button>
                        <button
                          className="ml-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                          onClick={() => dispatch(removeItem(it._id))}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Total + Form */}
                  <div className="pt-4 border-t">
                    <p className="font-semibold text-lg text-gray-900">
                      Total: Rs {cart.totalPrice.toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {/* 🔽 Animated Dropdown for Tables */}
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <select
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full border overflow-y-auto rounded-lg p-3 bg-white focus:ring-2 focus:ring-black focus:outline-none transition"
                      >
                        <option value="">Select Table (Required)</option>
                        {tables.map((t) => (
                          <option key={t._id} value={t.number}>
                            Table {t.tableNumber}
                          </option>
                        ))}
                      </select>
                    </motion.div>

                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your name"
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-black focus:outline-none transition"
                    />
                    <input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Your phone"
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-black focus:outline-none transition"
                    />
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={
                        placing || cart.items.length === 0 || !tableNumber
                      }
                      className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-lg font-semibold transition-all duration-300"
                    >
                      {placing
                        ? "Placing..."
                        : `Place Order (Rs ${cart.totalPrice.toFixed(2)})`}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        dispatch(clearCart());
                        toast.success("Cart cleared");
                      }}
                      className="w-full h-12 rounded-lg"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
