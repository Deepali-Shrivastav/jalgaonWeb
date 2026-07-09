"use client";

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface ListingAnalyticsClientProps {
  slug: string;
}

interface OverviewData {
  business_name: string;
  total_views: number;
  total_contact_clicks: number;
  total_reviews: number;
  conversion_rate: number;
}

interface DailyTrend {
  date: string;
  views: number;
  contact_clicks: number;
  new_reviews: number;
}

export default function ListingAnalyticsClient({ slug }: ListingAnalyticsClientProps) {
  const { isLogin } = useContext(AuthContext);
  const [period, setPeriod] = useState<string>("30");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trend, setTrend] = useState<DailyTrend[]>([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // 1. Fetch overview
      const overviewRes = await fetch(`${baseUrl}/api/v1/analytics/my-listing/${slug}/?days=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!overviewRes.ok) {
        if (overviewRes.status === 403) {
          throw new Error("You do not own this listing or are not authorized.");
        }
        throw new Error("Failed to load listing analytics summary.");
      }
      const overviewJson = await overviewRes.json();
      setOverview(overviewJson);

      // 2. Fetch chart/trend data
      const chartRes = await fetch(`${baseUrl}/api/v1/analytics/my-listing/${slug}/chart/?days=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!chartRes.ok) throw new Error("Failed to load listing traffic charts.");
      const chartJson = await chartRes.json();
      setTrend(chartJson.daily_trend || []);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLogin) {
      fetchAnalytics();
    }
  }, [isLogin, period]);

  return (
    <div className="space-y-6">
      {/* Header and navigation back */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/account/my-listings"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {overview?.business_name || "Business"} Analytics
            </h2>
            <p className="text-slate-500 text-sm">
              Track customer traffic, click-through rate, and lead interactions.
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto">
          {["7", "30", "90"].map((d) => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                period === d ? "bg-white text-primary shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">error</span>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Views</span>
              <span className="material-symbols-outlined text-violet-500 bg-violet-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                visibility
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{(overview.total_views ?? 0).toLocaleString()}</h3>
            <p className="text-slate-400 text-xs mt-1">Profile visits</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Clicks</span>
              <span className="material-symbols-outlined text-emerald-500 bg-emerald-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                call
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{(overview.total_contact_clicks ?? 0).toLocaleString()}</h3>
            <p className="text-slate-400 text-xs mt-1">Phone / WhatsApp taps</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Reviews</span>
              <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                rate_review
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{(overview.total_reviews ?? 0).toLocaleString()}</h3>
            <p className="text-slate-400 text-xs mt-1">Submitted ratings</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion Rate</span>
              <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                ads_click
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{overview.conversion_rate ?? 0}%</h3>
            <p className="text-slate-400 text-xs mt-1">Interactions / Views</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-20 flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">
            progress_activity
          </span>
          <p className="text-slate-500 font-medium">Loading traffic trends...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Profile Traffic Trend</h3>
            <div className="h-80 w-full">
              {trend.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">No views logged in this period</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="colorListingViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="views" name="Profile Views" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorListingViews)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Customer Leads (Contact Clicks & Reviews) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Customer Interactions</h3>
            <div className="h-80 w-full">
              {trend.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">No clicks logged in this period</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="contact_clicks" name="Contact Clicks" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="new_reviews" name="Submitted Reviews" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
