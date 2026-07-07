"use client";

import React, { useState, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, isLogin } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (!isLogin || !user) {
        router.push("/");
        return;
      }

      const role = user?.role || "";
      const allowedRoles = ["super_admin", "admin", "moderator", "content_manager", "news_editor"];

      if (!allowedRoles.includes(role)) {
        router.push("/");
      }
    }
  }, [isMounted, isLogin, user, router]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const getPageTitle = () => {
    if (!pathname) return "Dashboard Overview";
    if (pathname.includes("users")) return "User Management";
    if (pathname.includes("trending")) return "Trending Listings";
    if (pathname.includes("listings")) return "Listing Management";
    if (pathname.includes("ads")) return "Ads Moderation";
    if (pathname.includes("news/categories")) return "News Categories";
    if (pathname.includes("news/comments")) return "News Comment Moderation";
    if (pathname.includes("news/create") || pathname.includes("news/edit")) return "Edit News Article";
    if (pathname.includes("news")) return "News Management";
    if (pathname.includes("blog/categories")) return "Blog Categories";
    if (pathname.includes("blog/create") || pathname.includes("blog/edit")) return "Edit Blog Post";
    if (pathname.includes("blog")) return "Blog Management";
    if (pathname.includes("events")) return "Event Management";
    if (pathname.includes("jobs/applications")) return "Job Applications";
    if (pathname.includes("jobs/categories")) return "Job Categories";
    if (pathname.includes("jobs")) return "Job Management";
    if (pathname.includes("categories")) return "Category Management";
    if (pathname.includes("moderation")) return "Moderation Queue";
    if (pathname.includes("claims")) return "Business Claims";
    if (pathname.includes("reports")) return "Business Reports";
    return "Dashboard Overview";
  };

  if (!isMounted) return null;
  if (!isLogin || !user) return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile overlay for sidebar */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <AdminSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar toggleSidebar={toggleSidebar} title={getPageTitle()} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
