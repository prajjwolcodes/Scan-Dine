import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

export default function RootLayout({ children }) {
  return <ProtectedRoute allowedRoles={["owner"]}>{children}</ProtectedRoute>;
}
