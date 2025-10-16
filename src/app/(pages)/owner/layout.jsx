import OwnerRoute from "@/components/ownerRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

export default function RootLayout({ children }) {
  return (
    <div className="pt-8 px-10  ">
      <ProtectedRoute allowedRoles={["owner"]}>
        <OwnerRoute>{children}</OwnerRoute>
      </ProtectedRoute>
    </div>
  );
}
