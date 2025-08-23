"use client";

import OwnerRoute from "@/components/ownerRoute";

export default function DashboardPage() {
  return (
    <OwnerRoute>
      <div className="p-6">
        <h1 className="text-xl font-bold">Owner Dashboard</h1>
        <p>Only owners can see this page.</p>
      </div>
    </OwnerRoute>
  );
}
