"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  closeCart,
  decreaseQty,
  increaseQty,
  openCart,
  removeItem,
  clearCart,
  placeOrder,
} from "@/app/store/cartSlice";
import { useRouter } from "next/navigation";

export default function CartDrawer({ restaurantId }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const cart = useSelector((s) => s.cart);
  const { placing, lastOrder, orderError } = cart;

  const [loading, setLoading] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // FIX: State for hydration safety in the floating button (since this component renders it too)
  const [isClient, setIsClient] = useState(false);

  const openDrawer = () => dispatch(openCart());
  const closeDrawer = () => dispatch(closeCart());

  // ✅ Handle order placement
  const handlePlaceOrder = async () => {
    setLoading(true);

    if (!tableNumber) {
      toast.error("Please enter your table number");
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
        placeOrder({ restaurantId, tableNumber, customerName, customerPhone })
      );

      if (res.meta.requestStatus === "fulfilled") {
        dispatch(clearCart());
        const orderId = res.payload.order._id;

        // ✅ FIX: Store order with current timestamp
        const orderData = {
          id: orderId,
          status: res.payload.order.status,
          timestamp: Date.now(), // 💡 CORRECTED: Added timestamp
        };
        localStorage.setItem("guestOrder", JSON.stringify(orderData));

        // ✅ auto-remove after 15 minutes
        setTimeout(() => {
          localStorage.removeItem("guestOrder");
          console.log("Guest order expired and cleared");
        }, 15 * 60 * 1000);

        toast.success("Order placed successfully!");
        closeDrawer();
        router.push(`/orderSuccess/${orderId}`);
      } else {
        // Handle failure if Redux action rejects without throwing
        toast.error(res.payload || "Failed to place order.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred placing the order.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ check on mount if previous order expired or still valid
  useEffect(() => {
    setIsClient(true); // 💡 FIX: Set true on mount

    const savedOrder = localStorage.getItem("guestOrder");
    if (savedOrder) {
      try {
        const { id, timestamp } = JSON.parse(savedOrder);

        // Safety check for missing data (important if old data was saved incorrectly)
        if (!id || !timestamp) {
          localStorage.removeItem("guestOrder");
          return;
        }

        const now = Date.now();
        const FIFTEEN_MINUTES = 15 * 60 * 1000;

        if (now - timestamp > FIFTEEN_MINUTES) {
          localStorage.removeItem("guestOrder");
          console.log("Old guest order cleared automatically");
        } else {
          // 💡 CORRECTED: Redirect to order tracking page if order is still valid
          router.replace(`/orderSuccess/${id}`);
        }
      } catch (e) {
        console.error("Error parsing guestOrder from localStorage", e);
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
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <p className="text-white">Placing order...</p>
        </div>
      )}

      {/* Floating cart button (rendered here, but logic is simplified/duplicated for safety) */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={openDrawer}
          className="flex items-center gap-3 bg-black text-white px-4 py-2 rounded-full shadow-lg"
        >
          {/* FIX: Use isClient for hydration safety */}
          {isClient ? (
            <>
              <span className="font-semibold">{cart.totalQty}</span>
              <span className="text-sm">items</span>
              <span className="font-medium">•</span>
              <span className="font-semibold">
                Rs {cart.totalPrice.toFixed(2)}
              </span>
            </>
          ) : (
            // Consistent server render output
            <>
              <span className="font-semibold">0</span>
              <span className="text-sm">items</span>
              <span className="font-medium">•</span>
              <span className="font-semibold">Rs 0.00</span>
            </>
          )}
        </button>
      </div>

      {/* Drawer */}
      {cart.open && (
        <>
          {/* Backdrop for closing */}
          <div
            className="fixed inset-0 z-20 bg-black/50"
            onClick={closeDrawer}
          />

          <div className="fixed right-0 top-0 z-30 w-full max-w-md bg-white h-full p-6 overflow-auto shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Your Cart</h3>

            {cart.items.length === 0 ? (
              <p className="text-gray-500">No items in cart.</p>
            ) : (
              <div className="space-y-4">
                {cart.items.map((it) => (
                  <div
                    key={it._id}
                    className="flex items-center justify-between border-b pb-3 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{it.name}</p>
                      <p className="text-sm text-gray-500">
                        Rs {it.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                        onClick={() => dispatch(decreaseQty(it._id))}
                      >
                        −
                      </button>
                      <span className="w-6 text-center">{it.qty}</span>
                      <button
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                        onClick={() => dispatch(increaseQty(it._id))}
                      >
                        +
                      </button>
                      <button
                        className="ml-2 text-sm text-red-600 hover:text-red-800"
                        onClick={() => dispatch(removeItem(it._id))}
                      >
                        remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <p className="font-medium text-lg">
                    Total: Rs {cart.totalPrice.toFixed(2)}
                  </p>
                </div>

                <div className="mt-4">
                  <input
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Table number (Required)"
                    className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-black"
                    required
                  />
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name (Optional)"
                    className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-black"
                  />
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Your phone (Optional)"
                    className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-black"
                  />
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={
                      placing || cart.items.length === 0 || !tableNumber
                    }
                    className="w-full h-12 bg-black hover:bg-gray-800"
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
                    className="w-full mt-2"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 text-right">
              <button
                onClick={closeDrawer}
                className="text-sm cursor-pointer text-gray-600 hover:text-black"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
