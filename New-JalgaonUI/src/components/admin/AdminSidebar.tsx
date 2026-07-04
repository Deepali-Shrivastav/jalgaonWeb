"use client";

import React, { useContext, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

interface AdminSidebarProps {
  isCollapsed: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed }) => {
  const { user } = useContext(AuthContext);
  const pathname = usePathname();

  const [isNewsExpanded, setIsNewsExpanded] = useState(false);
  const [isJobsExpanded, setIsJobsExpanded] = useState(false);

  const userRole = user?.role || "";
  const isAdmin = ["super_admin", "admin"].includes(userRole);

  // Visibility logic based on RBAC matrix (same as old frontend)
  const canSeeUsers = isAdmin;
  const canSeeListings = isAdmin || ["content_manager", "moderator"].includes(userRole);
  const canSeeCategories = isAdmin || userRole === "content_manager";
  const canSeeModeration = isAdmin || ["moderator", "content_manager"].includes(userRole);
  const canSeeNews = isAdmin || ["content_manager", "news_editor"].includes(userRole);
  const canSeeNewsComments = isAdmin || ["content_manager", "moderator", "news_editor"].includes(userRole);
  const canSeeEvents = isAdmin || ["content_manager", "moderator"].includes(userRole);
  const canSeeJobs = isAdmin || ["content_manager", "moderator"].includes(userRole);

  const navLinkClass = (path: string, exact = false) => {
    const isActive = exact ? pathname === path : pathname?.startsWith(path);
    return `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? "bg-primary text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  };

  return (
    <aside
      className={`bg-white border-r border-slate-200 h-screen overflow-y-auto flex-shrink-0 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="h-16 flex items-center justify-center border-b border-slate-200 px-4 sticky top-0 bg-white z-10">
        <h2 className="font-bold text-xl text-ink-deep truncate">
          {isCollapsed ? "J" : "Jalgaon Admin"}
        </h2>
      </div>

      <nav className="p-4 space-y-1">
        {/* Dashboard */}
        <Link href="/admin" className={navLinkClass("/admin", true)}>
          <span className="material-symbols-outlined">dashboard</span>
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        {/* Users */}
        {canSeeUsers && (
          <Link href="/admin/users" className={navLinkClass("/admin/users")}>
            <span className="material-symbols-outlined">group</span>
            {!isCollapsed && <span>Users</span>}
          </Link>
        )}

        {/* Listings */}
        {canSeeListings && (
          <Link href="/admin/listings" className={navLinkClass("/admin/listings")}>
            <span className="material-symbols-outlined">storefront</span>
            {!isCollapsed && <span>Listings</span>}
          </Link>
        )}

        {/* Trending */}
        {canSeeListings && (
          <Link href="/admin/trending" className={navLinkClass("/admin/trending")}>
            <span className="material-symbols-outlined">star</span>
            {!isCollapsed && <span>Trending</span>}
          </Link>
        )}

        {/* Ads Moderation */}
        {canSeeListings && (
          <Link href="/admin/ads" className={navLinkClass("/admin/ads")}>
            <span className="material-symbols-outlined">campaign</span>
            {!isCollapsed && <span>Ads Moderation</span>}
          </Link>
        )}

        {/* Categories */}
        {canSeeCategories && (
          <Link href="/admin/categories" className={navLinkClass("/admin/categories")}>
            <span className="material-symbols-outlined">category</span>
            {!isCollapsed && <span>Categories</span>}
          </Link>
        )}

        {/* News Module (dropdown) */}
        {canSeeNews && (
          <div className="space-y-1">
            <button
              onClick={() => setIsNewsExpanded(!isNewsExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">article</span>
                {!isCollapsed && <span>News Module</span>}
              </div>
              {!isCollapsed && (
                <span className="material-symbols-outlined text-sm">
                  {isNewsExpanded ? "expand_less" : "expand_more"}
                </span>
              )}
            </button>
            {isNewsExpanded && !isCollapsed && (
              <div className="pl-11 space-y-1">
                <Link href="/admin/news" className={navLinkClass("/admin/news", true)}>
                  Articles
                </Link>
                <Link href="/admin/news/categories" className={navLinkClass("/admin/news/categories")}>
                  Categories
                </Link>
                {canSeeNewsComments && (
                  <Link href="/admin/news/comments" className={navLinkClass("/admin/news/comments")}>
                    Comments
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Job Portal (dropdown) */}
        {canSeeJobs && (
          <div className="space-y-1">
            <button
              onClick={() => setIsJobsExpanded(!isJobsExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">work</span>
                {!isCollapsed && <span>Job Portal</span>}
              </div>
              {!isCollapsed && (
                <span className="material-symbols-outlined text-sm">
                  {isJobsExpanded ? "expand_less" : "expand_more"}
                </span>
              )}
            </button>
            {isJobsExpanded && !isCollapsed && (
              <div className="pl-11 space-y-1">
                <Link href="/admin/jobs" className={navLinkClass("/admin/jobs", true)}>
                  Job Listings
                </Link>
                <Link href="/admin/jobs/applications" className={navLinkClass("/admin/jobs/applications")}>
                  Applications
                </Link>
                <Link href="/admin/jobs/categories" className={navLinkClass("/admin/jobs/categories")}>
                  Categories
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Events */}
        {canSeeEvents && (
          <Link href="/admin/events" className={navLinkClass("/admin/events")}>
            <span className="material-symbols-outlined">event</span>
            {!isCollapsed && <span>Events</span>}
          </Link>
        )}

        {/* Moderation */}
        {canSeeModeration && (
          <Link href="/admin/moderation" className={navLinkClass("/admin/moderation")}>
            <span className="material-symbols-outlined">gavel</span>
            {!isCollapsed && <span>Moderation</span>}
          </Link>
        )}

        {/* Business Claims */}
        {canSeeModeration && (
          <Link href="/admin/claims" className={navLinkClass("/admin/claims")}>
            <span className="material-symbols-outlined">verified_user</span>
            {!isCollapsed && <span>Business Claims</span>}
          </Link>
        )}

        {/* Business Reports */}
        {canSeeModeration && (
          <Link href="/admin/reports" className={navLinkClass("/admin/reports")}>
            <span className="material-symbols-outlined">flag</span>
            {!isCollapsed && <span>Business Reports</span>}
          </Link>
        )}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
