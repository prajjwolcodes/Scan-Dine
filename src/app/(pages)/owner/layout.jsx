"use client";

import { logout } from "@/app/store/authSlice";
import OwnerRoute from "@/components/ownerRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";
import { useDispatch } from "react-redux";

export default function RootLayout({ children }) {
  const dispatch = useDispatch();
  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <OwnerRoute>
        <button onClick={() => dispatch(logout())}>Logout</button>
        {children}
      </OwnerRoute>
    </ProtectedRoute>
  );
}
