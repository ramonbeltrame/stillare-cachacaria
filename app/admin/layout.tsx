"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
      <div className="flex">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
