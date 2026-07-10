"use client";

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import * as XLSX from "xlsx";

interface OverviewData {
  total_views: number;
  total_searches: number;
  total_impressions: number;
  total_clicks: number;
  overall_ctr: number;
  new_listings: number;
  new_users: number;
  new_reviews: number;
}

interface TrafficTrend {
  date: string;
  views: number;
  searches: number;
  clicks: number;
}

interface UserTrend {
  date: string;
  new_users: number;
  new_listings: number;
}

interface AdTrend {
  date: string;
  impressions: number;
  clicks: number;
}

interface SearchTerm {
  search_query: string;
  search_count: number;
}

interface TopListing {
  id: number;
  business_name: string;
  views: number;
  category: string;
}

interface TopAd {
  id: number;
  title: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

export default function AdminAnalyticsPage() {
  const { user } = useContext(AuthContext);
  const [period, setPeriod] = useState<string>("30");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trafficTrend, setTrafficTrend] = useState<TrafficTrend[]>([]);
  const [userTrend, setUserTrend] = useState<UserTrend[]>([]);
  const [adTrend, setAdTrend] = useState<AdTrend[]>([]);
  const [topSearches, setTopSearches] = useState<SearchTerm[]>([]);
  const [topListings, setTopListings] = useState<TopListing[]>([]);
  const [topAds, setTopAds] = useState<TopAd[]>([]);

  const userRole = user?.role || "";
  const allowedRoles = ["super_admin", "admin", "moderator", "content_manager", "seo_manager", "support"];
  const isAuthorized = allowedRoles.includes(userRole);

  const fetchAnalyticsData = async () => {
    if (!isAuthorized) return;
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      let queryParams = `?days=${period}`;
      if (period === "custom" && customStart && customEnd) {
        queryParams = `?start_date=${customStart}&end_date=${customEnd}`;
      }

      // Fetch overview
      const overviewRes = await fetch(`${baseUrl}/api/v1/analytics/overview/${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!overviewRes.ok) throw new Error("Failed to fetch overview metrics");
      const overviewJson = await overviewRes.json();
      setOverview(overviewJson);

      // Fetch traffic trends
      const trafficRes = await fetch(`${baseUrl}/api/v1/analytics/traffic/${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!trafficRes.ok) throw new Error("Failed to fetch traffic metrics");
      const trafficJson = await trafficRes.json();
      setTrafficTrend(trafficJson.daily_trend || []);

      // Fetch user growth
      const userRes = await fetch(`${baseUrl}/api/v1/analytics/user-growth/${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) throw new Error("Failed to fetch user growth metrics");
      const userJson = await userRes.json();
      setUserTrend(userJson.daily_trend || []);

      // Fetch ads overview
      const adsRes = await fetch(`${baseUrl}/api/v1/analytics/ads-overview/${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!adsRes.ok) throw new Error("Failed to fetch ads metrics");
      const adsJson = await adsRes.json();
      setAdTrend(adsJson.daily_trend || []);
      setTopAds(adsJson.top_ads || []);

      // Fetch top searches
      const searchRes = await fetch(`${baseUrl}/api/v1/analytics/top-searches/${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!searchRes.ok) throw new Error("Failed to fetch top searches");
      const searchJson = await searchRes.json();
      setTopSearches(searchJson.top_searches || []);

      // Fetch top listings
      const listingRes = await fetch(`${baseUrl}/api/v1/analytics/top-listings/${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!listingRes.ok) throw new Error("Failed to fetch top listings");
      const listingJson = await listingRes.json();
      setTopListings(listingJson.top_listings || []);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, isAuthorized]);

  const handleCustomRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      fetchAnalyticsData();
    }
  };

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Overview
      if (overview) {
        const overviewSheet = XLSX.utils.json_to_sheet([
          {
            "Total Views": overview.total_views,
            "Search Queries": overview.total_searches,
            "Ad Impressions": overview.total_impressions,
            "Ad Clicks": overview.total_clicks,
            "Overall CTR (%)": overview.overall_ctr,
            "New Listings": overview.new_listings,
            "New User Signups": overview.new_users,
            "New Reviews": overview.new_reviews
          }
        ]);
        XLSX.utils.book_append_sheet(wb, overviewSheet, "Overview");
      }

      // Sheet 2: Traffic Trend
      if (trafficTrend.length > 0) {
        const trafficSheet = XLSX.utils.json_to_sheet(trafficTrend);
        XLSX.utils.book_append_sheet(wb, trafficSheet, "Daily Traffic");
      }

      // Sheet 3: User Growth
      if (userTrend.length > 0) {
        const userSheet = XLSX.utils.json_to_sheet(userTrend);
        XLSX.utils.book_append_sheet(wb, userSheet, "User Growth");
      }

      // Sheet 4: Ads Performance
      if (adTrend.length > 0) {
        const adsSheet = XLSX.utils.json_to_sheet(adTrend);
        XLSX.utils.book_append_sheet(wb, adsSheet, "Ad Campaign Performance");
      }

      // Sheet 5: Top Searches
      if (topSearches.length > 0) {
        const searchSheet = XLSX.utils.json_to_sheet(topSearches);
        XLSX.utils.book_append_sheet(wb, searchSheet, "Top Searches");
      }

      // Sheet 6: Top Listings
      if (topListings.length > 0) {
        const listingSheet = XLSX.utils.json_to_sheet(topListings);
        XLSX.utils.book_append_sheet(wb, listingSheet, "Top Listings");
      }

      XLSX.writeFile(wb, `JalgaonWeb_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      alert("Failed to export analytics to Excel: " + err);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <span className="material-symbols-outlined text-red-500 text-5xl mb-4">gavel</span>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h3>
        <p className="text-slate-500">You do not have permission to view administrative analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white rounded-xl shadow-sm border border-slate-200 p-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">analytics</span>
            System Analytics & Insights
          </h2>
          <p className="text-slate-500">
            Real-time server logs and nightly aggregates for platform health and performance.
          </p>
        </div>

        {/* Date Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setPeriod("7")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                period === "7" ? "bg-white text-primary shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setPeriod("30")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                period === "30" ? "bg-white text-primary shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setPeriod("90")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                period === "90" ? "bg-white text-primary shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setPeriod("custom")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                period === "custom" ? "bg-white text-primary shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Custom
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export Excel
          </button>
        </div>
      </div>

      {/* Custom Range Picker */}
      {period === "custom" && (
        <form
          onSubmit={handleCustomRangeSubmit}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-end gap-4 animate-fadeIn"
        >
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="block w-full rounded-lg border-slate-200 text-sm focus:border-primary focus:ring-primary bg-slate-50 p-2"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="block w-full rounded-lg border-slate-200 text-sm focus:border-primary focus:ring-primary bg-slate-50 p-2"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
          >
            Apply Range
          </button>
        </form>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">error</span>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Traffic</span>
              <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                visibility
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{(overview.total_views ?? 0).toLocaleString()}</h3>
            <p className="text-slate-400 text-xs mt-1">Page & Listing Views</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Volume</span>
              <span className="material-symbols-outlined text-indigo-500 bg-indigo-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                search
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{(overview.total_searches ?? 0).toLocaleString()}</h3>
            <p className="text-slate-400 text-xs mt-1">Total search queries</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ads Performance</span>
              <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                ads_click
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {(overview.total_clicks ?? 0).toLocaleString()}
            </h3>
            <p className="text-slate-400 text-xs mt-1">CTR: {overview.overall_ctr ?? 0}% ({(overview.total_impressions ?? 0).toLocaleString()} imp)</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registrations</span>
              <span className="material-symbols-outlined text-emerald-500 bg-emerald-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                person_add
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{(overview.new_users ?? 0).toLocaleString()}</h3>
            <p className="text-slate-400 text-xs mt-1">+{overview.new_listings ?? 0} listings, +{overview.new_reviews ?? 0} reviews</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === "overview"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Overview Charts
          </button>
          <button
            onClick={() => setActiveTab("search-listings")}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === "search-listings"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Traffic & Searches
          </button>
          <button
            onClick={() => setActiveTab("ads")}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === "ads"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Advertising
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === "users"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Growth & Engagement
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-20 flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">
            progress_activity
          </span>
          <p className="text-slate-500 font-medium">Crunching aggregates...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW CHARTS */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Platform Traffic Trend</h3>
                <div className="h-80 w-full">
                  {trafficTrend.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-400">No traffic logs for this period</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trafficTrend}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="views" name="Page Views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
                        <Area type="monotone" dataKey="searches" name="Searches" stroke="#6366f1" fillOpacity={0} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* User Signups & Listings Bar */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Content & User Growth</h3>
                <div className="h-80 w-full">
                  {userTrend.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-400">No signups recorded for this period</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="new_users" name="New Signups" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="new_listings" name="New Listings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRAFFIC & SEARCHES */}
          {activeTab === "search-listings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Search Terms */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Top Search Queries</h3>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold">Volume</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Search Term</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Query Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topSearches.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-8 text-center text-slate-400 text-sm">No search data found</td>
                        </tr>
                      ) : (
                        topSearches.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <span className="text-slate-300 font-mono text-xs">{idx + 1}.</span>
                              {item.search_query}
                            </td>
                            <td className="px-4 py-3 text-sm font-black text-right text-slate-900">{item.search_count}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Listings */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Most Viewed Directory Listings</h3>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">Views</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Listing Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Total Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topListings.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-sm">No listing views found</td>
                        </tr>
                      ) : (
                        topListings.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <span className="text-slate-300 font-mono text-xs">{idx + 1}.</span>
                              {item.business_name}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500">{item.category}</td>
                            <td className="px-4 py-3 text-sm font-black text-right text-slate-900">{item.views}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADS PERFORMANCE */}
          {activeTab === "ads" && (
            <div className="space-y-6">
              {/* Daily Impressions vs Clicks Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Ad Engagement (Impressions vs Clicks)</h3>
                <div className="h-80 w-full">
                  {adTrend.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-400">No ad records for this period</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={adTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" orientation="left" stroke="#f59e0b" />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="impressions" name="Impressions" stroke="#f59e0b" strokeWidth={2.5} activeDot={{ r: 8 }} />
                        <Line yAxisId="right" type="monotone" dataKey="clicks" name="Clicks" stroke="#10b981" strokeWidth={2.5} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Top Ads List */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Top Performing Campaigns by CTR</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Ad Details</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Impressions</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Clicks</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">CTR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topAds.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">No active ad data found</td>
                        </tr>
                      ) : (
                        topAds.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <span className="text-slate-300 font-mono text-xs">{idx + 1}.</span>
                              {item.title}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-right text-slate-600">{item.impressions}</td>
                            <td className="px-4 py-3 text-sm font-medium text-right text-slate-600">{item.clicks}</td>
                            <td className="px-4 py-3 text-sm font-black text-right text-emerald-600">{item.ctr}%</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GROWTH & ENGAGEMENT */}
          {activeTab === "users" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Signups */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">User Signups</h3>
                <div className="h-80 w-full">
                  {userTrend.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-400">No user signups data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={userTrend}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="new_users" name="New Users" stroke="#10b981" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Daily Listing Creation */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">New Directory Listings Added</h3>
                <div className="h-80 w-full">
                  {userTrend.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-400">No listing data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={userTrend}>
                        <defs>
                          <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="new_listings" name="New Listings" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorListings)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
