"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import Loading from "@/components/Loading"; // Assuming you have a loading component

export default function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // This ensures Redux state is available after hydration
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // Wait for hydration

    // If no token -> redirect to login
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // If token exists but user role not allowed
    if (user && !allowedRoles.includes(user.role)) {
      router.replace("/unauthorized");
      return;
    }
  }, [hydrated, token, user, allowedRoles, router]);

  if (!hydrated || !token || !user) {
    // Optional: replace with your <Loading /> component
    return <></>;
  }

  return <>{children}</>;
}
