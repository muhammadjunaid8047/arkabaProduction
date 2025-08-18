"use client";

import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

export default function AdminLayout({ children }) {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </ProtectedAdminRoute>
  );
}
