"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function ChefPage() {
  return (
    <ProtectedRoute allowedRoles={["chef"]}>
      <div className="p-6">
        <h1 className="text-xl font-bold">Chef Order Screen</h1>
        <p>Orders will appear here via socket.</p>
      </div>
    </ProtectedRoute>
  );
}
