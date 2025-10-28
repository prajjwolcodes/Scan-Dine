"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderCard from "./OrderCard";
import { BellRing, Flame, CheckCircle2, XCircle } from "lucide-react";

const STATUSES = ["pending", "accepted", "completed", "cancelled"];

const STATUS_CONFIG = {
  pending: { color: "amber", icon: BellRing, label: "Pending" },
  accepted: { color: "red", icon: Flame, label: "Cooking" },
  completed: { color: "green", icon: CheckCircle2, label: "Completed" },
  cancelled: { color: "gray", icon: XCircle, label: "Cancelled" },
};

export default function OrderTabs({
  orders = [],
  onAccept,
  onComplete,
  highlightedOrders = new Set(),
}) {
  const grouped = useMemo(() => {
    const map = {};
    for (const s of STATUSES) map[s] = [];
    orders.forEach((o) => {
      if (!map[o.status]) map[o.status] = [];
      map[o.status].push(o);
    });
    return map;
  }, [orders]);

  return (
    <div className="w-full">
      <Tabs
        defaultValue="pending"
        className="bg-white rounded-2xl sm:border sm:shadow-sm overflow-hidden"
      >
        {/* ------------------ TAB BAR ------------------ */}
        <TabsList className="w-full flex justify-between sm:justify-start overflow-x-auto border-b bg-gray-50 rounded-t-2xl no-scrollbar">
          {STATUSES.map((s) => {
            const Icon = STATUS_CONFIG[s].icon;
            const { label } = STATUS_CONFIG[s];

            return (
              <TabsTrigger
                key={s}
                value={s}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold capitalize
          border border-transparent rounded-full
          data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100
          hover:bg-gray-200
          transition`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ------------------ TAB CONTENT ------------------ */}
        <div className="sm:px-4">
          {STATUSES.map((s) => (
            <TabsContent key={s} value={s} className="focus:outline-none">
              {grouped[s].length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm sm:text-base">
                  No {STATUS_CONFIG[s].label.toLowerCase()} orders.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {grouped[s].map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      highlighted={highlightedOrders.has(order._id)}
                      onAccept={() => onAccept && onAccept(order._id)}
                      onComplete={() => onComplete && onComplete(order._id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
