"use client";

import React, { useContext, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

interface AdminSidebarProps {
  isCollapsed: boolean;
  toggleSidebar?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const pathname = usePathname();

  const [isNewsExpanded, setIsNewsExpanded] = useState(false);
  const [isBlogExpanded, setIsBlogExpanded] = useState(false);
  const [isJobsExpanded, setIsJobsExpanded] = useState(false);
  const [isEventsExpanded, setIsEventsExpanded] = useState(false);
  const [isStartupsExpanded, setIsStartupsExpanded] = useState(false);

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
  const canSeeStartups = isAdmin || ["content_manager", "moderator"].includes(userRole);

  const navLinkClass = (path: string, exact = false) => {
    const isActive = exact ? pathname === path : pathname?.startsWith(path);
    return `flex items-center ${
      isCollapsed ? "justify-center w-12 h-12 mx-auto" : "gap-3 px-4 py-3"
    } text-sm font-medium rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-primary text-white shadow-md shadow-primary/20"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  };

  return (
    <aside
      className={`bg-white border-r border-slate-200 h-screen overflow-y-auto flex-shrink-0 transition-all duration-300 absolute md:relative z-50 ${
        isCollapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "translate-x-0 w-64"
      }`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {/* Scrollbar hide style */}
      <style jsx global>{`
        aside::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="h-16 flex items-center justify-between border-b border-slate-200 px-4 sticky top-0 bg-white z-10">
        <div className="flex justify-center w-full">
          {isCollapsed ? (
            <img src="/title-logo.png" alt="Logo" className="h-8 w-auto object-contain hidden md:block" />
          ) : (
            <img src="/main-logo.png" alt="Jalgaon Admin" className="h-9 w-auto object-contain" />
          )}
        </div>
        {/* Mobile close button inside sidebar */}
        {!isCollapsed && (
          <button onClick={toggleSidebar} className="md:hidden text-slate-500 p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      <nav className={`p-4 ${isCollapsed ? "space-y-3" : "space-y-1"}`}>
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
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center w-12 h-12 mx-auto" : "justify-between px-4 py-3"
              } text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-100 transition-all duration-200`}
            >
              <div className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}>
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

        {/* Blog Module (dropdown) */}
        {canSeeNews && (
          <div className="space-y-1">
            <button
              onClick={() => setIsBlogExpanded(!isBlogExpanded)}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center w-12 h-12 mx-auto" : "justify-between px-4 py-3"
              } text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-100 transition-all duration-200`}
            >
              <div className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}>
                <span className="material-symbols-outlined">book</span>
                {!isCollapsed && <span>Blog Module</span>}
              </div>
              {!isCollapsed && (
                <span className="material-symbols-outlined text-sm">
                  {isBlogExpanded ? "expand_less" : "expand_more"}
                </span>
              )}
            </button>
            {isBlogExpanded && !isCollapsed && (
              <div className="pl-11 space-y-1">
                <Link href="/admin/blog" className={navLinkClass("/admin/blog", true)}>
                  Articles
                </Link>
                <Link href="/admin/blog/categories" className={navLinkClass("/admin/blog/categories")}>
                  Categories
                </Link>
                {canSeeNewsComments && (
                  <Link href="/admin/blog/comments" className={navLinkClass("/admin/blog/comments")}>
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
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center w-12 h-12 mx-auto" : "justify-between px-4 py-3"
              } text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-100 transition-all duration-200`}
            >
              <div className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}>
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

        {/* Events (dropdown) */}
        {canSeeEvents && (
          <div className="space-y-1">
            <button
              onClick={() => setIsEventsExpanded(!isEventsExpanded)}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center w-12 h-12 mx-auto" : "justify-between px-4 py-3"
              } text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-100 transition-all duration-200`}
            >
              <div className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}>
                <span className="material-symbols-outlined">event</span>
                {!isCollapsed && <span>Events</span>}
              </div>
              {!isCollapsed && (
                <span className="material-symbols-outlined text-sm">
                  {isEventsExpanded ? "expand_less" : "expand_more"}
                </span>
              )}
            </button>
            {isEventsExpanded && !isCollapsed && (
              <div className="pl-11 space-y-1">
                <Link href="/admin/events" className={navLinkClass("/admin/events", true)}>
                  Event Listings
                </Link>
                <Link href="/admin/events/categories" className={navLinkClass("/admin/events/categories")}>
                  Categories
                </Link>
              </div>
            )}
          </div>
        )}

        {/* NGOs */}
        {canSeeEvents && (
          <div className="space-y-1">
            <Link href="/admin/ngos" className={navLinkClass("/admin/ngos")}>
              <span className="material-symbols-outlined">volunteer_activism</span>
              {!isCollapsed && <span>NGOs</span>}
            </Link>
          </div>
        )}

        {/* Startups */}
        {canSeeStartups && (
          <div className="space-y-1">
            <button
              onClick={() => setIsStartupsExpanded(!isStartupsExpanded)}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center w-12 h-12 mx-auto" : "justify-between px-4 py-3"
              } text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-100 transition-all duration-200`}
            >
              <div className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}>
                <span className="material-symbols-outlined">rocket_launch</span>
                {!isCollapsed && <span>Startups</span>}
              </div>
              {!isCollapsed && (
                <span className="material-symbols-outlined text-sm">
                  {isStartupsExpanded ? "expand_less" : "expand_more"}
                </span>
              )}
            </button>
            {isStartupsExpanded && !isCollapsed && (
              <div className="pl-11 space-y-1">
                <Link href="/admin/startups" className={navLinkClass("/admin/startups", true)}>
                  Startups List
                </Link>
                <Link href="/admin/startups/industries" className={navLinkClass("/admin/startups/industries")}>
                  Industries
                </Link>
              </div>
            )}
          </div>
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
