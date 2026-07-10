"use client";

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface AdAnalyticsClientProps {
  id: number;
}

interface DailyTrend {
  date: string;
  impressions: number;
  clicks: number;
}

export default function AdAnalyticsClient({ id }: AdAnalyticsClientProps) {
  const { isLogin } = useContext(AuthContext);
  const [period, setPeriod] = useState<string>("30");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [title, setTitle] = useState<string>("");
  const [trend, setTrend] = useState<DailyTrend[]>([]);
  const [summary, setSummary] = useState({
    impressions: 0,
    clicks: 0,
    ctr: 0.0
  });

  const fetchAdAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${baseUrl}/api/v1/analytics/my-ads/${id}/chart/?days=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("You do not own this ad campaign or are not authorized.");
        }
        throw new Error("Failed to load ad campaign analytics.");
      }

      const json = await res.json();
      setTitle(json.ad_title || "Ad Campaign");
      const dailyTrend = json.daily_trend || [];
      setTrend(dailyTrend);

      // Compute total metrics for period
      const totalImpressions = dailyTrend.reduce((sum: number, curr: DailyTrend) => sum + curr.impressions, 0);
      const totalClicks = dailyTrend.reduce((sum: number, curr: DailyTrend) => sum + curr.clicks, 0);
      const calculatedCtr = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0.0;

      setSummary({
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: calculatedCtr
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLogin) {
      fetchAdAnalytics();
    }
  }, [isLogin, period]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/account/ads"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              "{title}" Performance
            </h2>
            <p className="text-slate-500 text-sm">
              Detailed tracking of banner/carousel ad performance.
            </p>
          </div>
        </div>

        {/* Period selection */}
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

      {/* Stats summary */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Impressions</span>
              <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                visibility
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{summary.impressions.toLocaleString()}</h3>
            <p className="text-slate-400 text-xs mt-1">Times ad was viewed</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clicks</span>
              <span className="material-symbols-outlined text-emerald-500 bg-emerald-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                ads_click
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{summary.clicks.toLocaleString()}</h3>
            <p className="text-slate-400 text-xs mt-1">Taps leading to destination</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Click-Through Rate (CTR)</span>
              <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                percent
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{summary.ctr}%</h3>
            <p className="text-slate-400 text-xs mt-1">Conversion efficiency</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-20 flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">
            progress_activity
          </span>
          <p className="text-slate-500 font-medium">Fetching ad metrics...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Daily Engagement Trend</h3>
          <div className="h-96 w-full">
            {trend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">No logs recorded for this campaign in this period</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="#f59e0b" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="impressions" name="Impressions" stroke="#f59e0b" fillOpacity={1} fill="url(#colorImpressions)" strokeWidth={2.5} />
                  <Area yAxisId="right" type="monotone" dataKey="clicks" name="Clicks" stroke="#10b981" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
