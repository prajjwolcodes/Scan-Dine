"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function ChefPage({ children }) {
  return <ProtectedRoute allowedRoles={["chef"]}>{children}</ProtectedRoute>;
}
