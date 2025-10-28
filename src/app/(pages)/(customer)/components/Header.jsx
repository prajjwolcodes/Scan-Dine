"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Grid, List, User } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import api from "@/lib/axios";
import {
  getGuestOrder,
  isGuestOrderActiveForRestaurant,
  cleanupExpiredGuestOrder,
  markGuestOrderCompleted,
  getGuestOrderCompletedAt,
  saveGuestOrder,
} from "@/lib/guestOrder";
import { getSocket } from "@/utils/getSocket";

export const Header = ({
  restaurant,
  query,
  setQuery,
  categories,
  activeCat,
  handleTabClick,
  view,
  setView,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [hasGuestOrder, setHasGuestOrder] = useState(false); // 👈 new state
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const userRef = useRef(null);
  const tabsRef = useRef(null);

  // ✅ Detect click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !searchRef.current?.contains(e.target) &&
        !userRef.current?.contains(e.target)
      ) {
        setSearchOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Check for active guestOrder in localStorage
  useEffect(() => {
    const checkGuestOrder = () => {
      // Clean up if any expired completed order
      cleanupExpiredGuestOrder();
      // Only show for the current restaurant
      if (!restaurant?._id) {
        setHasGuestOrder(false);
        return;
      }
      setHasGuestOrder(isGuestOrderActiveForRestaurant(restaurant._id));
    };

    // Run once on mount
    checkGuestOrder();

    // 👇 Recheck every 10 seconds (in case of expiration)
    const interval = setInterval(checkGuestOrder, 10000);
    return () => clearInterval(interval);
  }, [restaurant?._id]);

  // 🔌 Listen to order status updates for the current guest order (if any)
  useEffect(() => {
    const current = getGuestOrder();
    if (!current?.id) return;
    const socket = getSocket();
    try {
      socket.emit("joinOrder", { orderId: current.id });
    } catch (_) {}

    const onUpdate = (updatedOrder) => {
      if (!updatedOrder || updatedOrder._id !== current.id) return;

      // keep local guest order status in sync
      saveGuestOrder({
        id: current.id,
        restaurantId: current.restaurantId || updatedOrder.restaurant?._id,
        status: updatedOrder.status,
      });

      if (updatedOrder.status === "completed" && !getGuestOrderCompletedAt()) {
        markGuestOrderCompleted(current.id);
      }

      // Refresh header visibility logic
      setHasGuestOrder(isGuestOrderActiveForRestaurant(restaurant?._id));
    };

    socket.on("order:update", onUpdate);
    return () => {
      try {
        socket.off("order:update", onUpdate);
      } catch (_) {}
    };
  }, [restaurant?._id]);

  // 🔁 One-time server sync in case socket was missed while away
  useEffect(() => {
    const o = getGuestOrder();
    if (!o?.id) return;
    (async () => {
      try {
        const res = await api.get(`/orders/order/${o.id}`);
        const srv = res?.data?.order;
        if (!srv) return;
        saveGuestOrder({
          id: o.id,
          restaurantId: o.restaurantId || srv.restaurant?._id,
          status: srv.status,
        });
        if (srv.status === "completed" && !getGuestOrderCompletedAt()) {
          markGuestOrderCompleted(o.id);
        }
        setHasGuestOrder(isGuestOrderActiveForRestaurant(restaurant?._id));
      } catch (_) {}
    })();
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3 relative">
        {/* Logo */}
        <Image
          src={restaurant?.logo || "/logo.png"}
          alt={restaurant?.name || "Restaurant"}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border"
          width={48}
          height={48}
        />

        {/* Name + Address */}
        <div className="flex-1">
          <h1 className="text-base sm:text-lg font-semibold">
            {restaurant?.name || "Restaurant Menu"}
          </h1>
          <p className="text-xs text-gray-500">{restaurant?.address || ""}</p>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2 relative">
          {/* Search Icon */}
          <div ref={searchRef} className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchOpen(!searchOpen);
                setUserOpen(false);
              }}
            >
              <SearchIcon className="w-7 h-7 text-gray-600" />
            </Button>

            {/* Floating Search Box */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-10 bg-white border shadow-md rounded-lg p-2"
                >
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-56 h-9 text-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ✅ Show User Icon only when guestOrder exists */}
          {hasGuestOrder && (
            <div ref={userRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setUserOpen(!userOpen);
                  setSearchOpen(false);
                }}
              >
                <User className="w-5 h-5 text-gray-600" />
              </Button>

              {/* Dropdown */}
              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-10 bg-white border shadow-md rounded-lg w-40 py-2"
                  >
                    <button
                      onClick={() => {
                        const o = getGuestOrder();
                        if (o?.id)
                          window.location.href = `/orderSuccess/${o.id}`;
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      View your order
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Tabs + View Toggle remain same */}
      <div className="border-t">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-3 items-center">
          <div
            ref={tabsRef}
            className="flex gap-2 overflow-x-auto no-scrollbar py-1 flex-1"
          >
            {categories.map((cat) => {
              const isActive = activeCat === cat._id;
              return (
                <button
                  key={cat._id}
                  onClick={() => handleTabClick(cat._id)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition ${
                    isActive
                      ? "bg-black text-gray-100 shadow-sm"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1 shrink-0">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setView("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
