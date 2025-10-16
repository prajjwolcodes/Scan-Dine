"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublicRoute({ children, redirectTo = "/" }) {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);
  const [hydrated, setHydrated] = useState(false);

  // Wait for Redux hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // Wait until Redux is ready

    if (token && user) {
      // If already logged in, redirect away from public pages
      if (user.role === "owner") {
        router.replace("/owner/dashboard");
        return;
      }
      if (user.role === "chef") {
        router.replace("/chef/dashboard");
        return;
      } else {
        router.replace("/");
      }
    }
  }, [hydrated, token, user, router, redirectTo]);

  if (!hydrated) {
    return <></>;
  }

  // If not logged in, allow access
  return <>{!token && !user ? children : <></>}</>;
}
