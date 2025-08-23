"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OwnerRoute({ children }) {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for the Redux store to be hydrated
    if (token === undefined || user === undefined) {
      // Still initializing from localStorage, so wait
      return;
    }

    if (!token || user?.role !== "owner") {
      router.replace("/auth/login");
      return;
    }

    // 🚦 Redirect based on progress
    if (user?.role === "owner") {
      if (!user?.hasRestaurant) {
        router.replace("/owner/restaurant-details");
        return;
      }
      if (!user?.hasCategories) {
        router.replace("/owner/categories");
        return;
      }
      if (!user?.hasMenu) {
        router.replace("/owner/menu");
        return;
      }
    }
    setLoading(false);
  }, [loading, token, user, router]);

  if (loading) return <div>Loading...</div>;

  return <>{children}</>;
}
