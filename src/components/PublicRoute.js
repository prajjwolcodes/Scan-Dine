"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublicRoute({ children, redirectTo = "/" }) {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for the Redux store to be hydrated
    if (token === undefined || user === undefined) {
      // Still initializing from localStorage, so wait
      return;
    }

    if (token && user) {
      router.replace(redirectTo);
    } else if (!token && !user) {
      setLoading(false); // No user or token, stop loading
    }
  }, [token, user, loading, router, redirectTo]);

  if (loading || (token && user)) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}
