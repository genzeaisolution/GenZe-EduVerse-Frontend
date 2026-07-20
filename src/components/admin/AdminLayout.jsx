import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar.jsx";

/**
 * Shared shell for all /admin/* pages: sidebar + mobile topbar + routed content.
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-[#0b0b14] dark:via-[#0b0b14] dark:to-[#12121f] p-0 lg:p-4 lg:gap-4">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden flex items-center justify-between p-4 glass-strong sticky top-0 z-30">
          <span className="font-bold">GenZe Admin</span>
          <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="p-2">
            <Menu size={20} />
          </button>
        </div>

        <main className="flex-1 p-4 lg:p-0 lg:pr-4 lg:py-4 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
