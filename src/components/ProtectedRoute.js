"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (token === null && user === null) {
      // still initializing from localStorage, so wait
      return;
    }
    if (!token) {
    } else if (!allowedRoles.includes(user?.role)) {
      router.replace("/unauthorized"); // or home
    }
    setIsChecking(false);
  }, [user, token, router, allowedRoles]);

  if (isChecking || (token && user)) {
    return <div>Authorizing...</div>;
  }

  return <>{children}</>;
}
