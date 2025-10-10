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
} from "@/app/store/cartSlice";
import { placeOrder } from "@/app/store/cartSlice";
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

  const openDrawer = () => dispatch(openCart());
  const closeDrawer = () => dispatch(closeCart());

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      if (!tableNumber) {
        toast.error("Please enter your table number");
        return;
      }
      if (cart.items.length === 0) {
        toast.error("Cart is empty");
        return;
      }

      const res = await dispatch(
        placeOrder({ restaurantId, tableNumber, customerName, customerPhone })
      );
      dispatch(clearCart());
      if (res.meta.requestStatus === "fulfilled") {
        router.push(`/orderSuccess/${res.payload.order._id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

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
      {/* Floating button */}
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <p className="text-white">Placing order...</p>
        </div>
      )}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={openDrawer}
          className="flex items-center gap-3 bg-black text-white px-4 py-2 rounded-full shadow-lg"
        >
          <span className="font-semibold">{cart.totalQty}</span>
          <span className="text-sm">items</span>
          <span className="font-medium">•</span>
          <span className="font-semibold">Rs {cart.totalPrice}</span>
        </button>
      </div>

      {/* Drawer */}
      {cart.open && (
        <div className="fixed inset-0 z-30 flex">
          <div className="ml-auto w-full max-w-md bg-white h-full p-6 overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Your Cart</h3>

            {cart.items.length === 0 ? (
              <p className="text-gray-500">No items in cart.</p>
            ) : (
              <div className="space-y-4">
                {cart.items.map((it) => (
                  <div
                    key={it._id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{it.name}</p>
                      <p className="text-sm text-gray-500">Rs {it.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-1 border rounded"
                        onClick={() => dispatch(decreaseQty(it._id))}
                      >
                        −
                      </button>
                      <span>{it.qty}</span>
                      <button
                        className="px-2 py-1 border rounded"
                        onClick={() => dispatch(increaseQty(it._id))}
                      >
                        +
                      </button>
                      <button
                        className="ml-2 text-sm text-red-600"
                        onClick={() => dispatch(removeItem(it._id))}
                      >
                        remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <p className="font-medium">Total: Rs {cart.totalPrice}</p>
                </div>

                <div className="mt-4">
                  <input
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Table number"
                    className="w-full border rounded p-2 mb-3"
                  />
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    className="w-full border rounded p-2 mb-3"
                  />
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Your phone"
                    className="w-full border rounded p-2 mb-3"
                  />
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full"
                  >
                    {placing ? "Placing..." : "Place Order"}
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
                className="text-sm cursor-pointer text-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
