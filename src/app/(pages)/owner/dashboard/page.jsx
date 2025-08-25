"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Owner Dashboard</h1>
      <p>Only owners can see this page.</p>
    </div>
  );
}
