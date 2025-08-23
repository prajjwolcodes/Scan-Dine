"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import Loading from "@/components/Loading"; // Assuming you have a loading component

export default function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for the Redux store to be hydrated
    if (token === undefined || user === undefined) {
      // Still initializing from localStorage, so wait
      return;
    }

    if (!token) {
      router.replace("/auth/login");
    } else if (!allowedRoles.includes(user?.role)) {
      router.replace("/unauthorized");
    } else {
      setLoading(false); // Authentication check passed, stop loading
    }
  }, [user, token, router, allowedRoles]);

  if (loading) {
    // Show a loading state or nothing while checking auth
    return <div>Loading...</div>;
  }

  // Only render children if the authentication check passed
  return <>{children}</>;
}
