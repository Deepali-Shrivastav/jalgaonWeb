"use client";

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import StatsCard from "@/components/admin/StatsCard";
import Link from "next/link";

interface DashboardStats {
  total_users: number;
  total_listings: number;
  approved_listings: number;
  pending_listings: number;
  total_categories: number;
  pending_moderation: number;
}

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userRole = user?.role || "";
  const isAdmin = ["super_admin", "admin"].includes(userRole);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        
        const response = await fetch(`${baseUrl}/api/v1/admin-panel/stats/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("refresh_token");
          window.location.href = "/";
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        console.error("Failed to fetch dashboard stats", err);
        setError("Failed to load dashboard statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            progress_activity
          </span>
          <p className="text-slate-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Welcome back, {user?.first_name || "Admin"}!
        </h2>
        <p className="text-slate-500 text-lg">
          Here's what's happening in Jalgaon today.
        </p>
      </div>

      {isAdmin && error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">error</span>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {isAdmin && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard 
            title="Total Users" 
            value={stats.total_users} 
            icon="group" 
            color="blue" 
          />
          <StatsCard 
            title="Total Listings" 
            value={stats.total_listings} 
            icon="storefront" 
            color="purple" 
          />
          <StatsCard 
            title="Approved Listings" 
            value={stats.approved_listings} 
            icon="check_circle" 
            color="green" 
          />
          <StatsCard 
            title="Pending Listings" 
            value={stats.pending_listings} 
            icon="pending_actions" 
            color="yellow" 
          />
          <StatsCard 
            title="Categories" 
            value={stats.total_categories} 
            icon="category" 
            color="blue" 
          />
          <StatsCard 
            title="Pending Moderation" 
            value={stats.pending_moderation} 
            icon="gavel" 
            color="red" 
          />
        </div>
      )}

      {!isAdmin && userRole === "news_editor" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">News Editor Dashboard</h2>
          <p className="text-slate-600 mb-6">
            From here you can manage all news articles, organize categories, and moderate reader comments.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/admin/news/create" 
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined">edit_document</span>
              Write New Article
            </Link>
            <Link 
              href="/admin/news/comments" 
              className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <span className="material-symbols-outlined">forum</span>
              Review Comments
            </Link>
          </div>
        </div>
      )}

      {!isAdmin && userRole !== "news_editor" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Staff Panel</h3>
          <p className="text-slate-500">
            Use the sidebar navigation to access your authorized management tools.
          </p>
        </div>
      )}
    </div>
  );
}
