"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublicRoute({ children, redirectTo = "/" }) {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (token && user) {
      router.replace(redirectTo);
    }
  }, [token, user, hydrated, router, redirectTo]);

  if (!hydrated || (token && user)) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}
