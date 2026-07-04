"use client";

import { useEffect, useState } from "react";

import type { DashboardResponse, MarketQuote } from "@/lib/dashboard-types";

const emptyDashboard: DashboardResponse = {
  configured: false,
  marketConfigured: false,
  weatherConfigured: false,
  market: [],
  weather: null,
  updatedAt: "",
};

const marketPlaceholders = [
  { id: "gold", label: "Gold" },
  { id: "silver", label: "Silver" },
  { id: "crude-oil", label: "Crude Oil (WTI)" },
];

function formatMarketValue(quote?: MarketQuote) {
  if (!quote) return "--";
  const value = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(quote.value);
  return quote.currency === "INR" ? `₹${value}` : quote.currency === "USD" ? `$${value}` : `${value} ${quote.currency}`;
}

function TickerItems({ dashboard, loading }: { dashboard: DashboardResponse; loading: boolean }) {
  const marketById = new Map(dashboard.market.map((quote) => [quote.id, quote]));
  const weather = dashboard.weather;
  const bhusawalWeather = dashboard.bhusawalWeather;

  return (
    <div className="flex shrink-0 items-center gap-xxl pr-xxl">
      <div className="flex items-center gap-xs font-extrabold text-ink-deep">
        <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">trending_up</span>
        <span>Market Watch</span>
        <span className={`h-1.5 w-1.5 rounded-full ${dashboard.market.length ? "bg-emerald-500" : "bg-outline-variant"}`} />
      </div>

      {marketPlaceholders.map((item) => {
        const quote = marketById.get(item.id);
        const change = quote?.percentChange;
        const isDown = change !== undefined && change < 0;

        return (
          <div key={item.id} className="flex items-center gap-xs whitespace-nowrap">
            <span className="text-secondary">{item.label}</span>
            <strong className="text-ink-deep">{formatMarketValue(quote)}</strong>
            <span className="text-[10px] font-bold uppercase text-primary">{quote?.unit || ""}</span>
            {change !== undefined && (
              <span className={`flex items-center text-xs font-extrabold ${isDown ? "text-rose-600" : "text-emerald-600"}`}>
                <span className="material-symbols-outlined text-sm" aria-hidden="true">{isDown ? "south_east" : "north_east"}</span>
                {change >= 0 ? "+" : ""}{change.toFixed(2)}%
              </span>
            )}
          </div>
        );
      })}

      <span className="h-5 w-px bg-hairline-soft" aria-hidden="true" />

      <div className="flex items-center gap-xs whitespace-nowrap">
        <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">rainy</span>
        <strong className="text-ink-deep">Jalgaon Weather</strong>
        <span className="text-xl font-black text-primary">{weather ? `${Math.round(weather.tempC)}°C` : "--°C"}</span>
        <span className="text-secondary">{weather?.condition || (loading ? "Loading" : "Unavailable")}</span>
      </div>

      <div className="flex items-center gap-xs whitespace-nowrap text-secondary">
        <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">humidity_percentage</span>
        <span>Jalgaon Humidity <strong className="text-ink-deep">{weather ? `${weather.humidity}%` : "--"}</strong></span>
      </div>

      <div className="flex items-center gap-xs whitespace-nowrap text-secondary">
        <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">air</span>
        <span>Jalgaon Wind <strong className="text-ink-deep">{weather ? `${Math.round(weather.windKph)} km/h` : "--"}</strong></span>
      </div>

      <span className="h-5 w-px bg-hairline-soft" aria-hidden="true" />

      <div className="flex items-center gap-xs whitespace-nowrap">
        <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">sunny</span>
        <strong className="text-ink-deep">Bhusawal Weather</strong>
        <span className="text-xl font-black text-primary">{bhusawalWeather ? `${Math.round(bhusawalWeather.tempC)}°C` : "--°C"}</span>
        <span className="text-secondary">{bhusawalWeather?.condition || (loading ? "Loading" : "Unavailable")}</span>
      </div>

      <div className="flex items-center gap-xs whitespace-nowrap text-secondary">
        <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">humidity_percentage</span>
        <span>Bhusawal Humidity <strong className="text-ink-deep">{bhusawalWeather ? `${bhusawalWeather.humidity}%` : "--"}</strong></span>
      </div>

      <div className="flex items-center gap-xs whitespace-nowrap text-secondary">
        <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">air</span>
        <span>Bhusawal Wind <strong className="text-ink-deep">{bhusawalWeather ? `${Math.round(bhusawalWeather.windKph)} km/h` : "--"}</strong></span>
      </div>
    </div>
  );
}

export default function MarketWeatherDashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse>(emptyDashboard);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        if (!response.ok) throw new Error("Dashboard request failed");
        const payload = (await response.json()) as DashboardResponse;
        if (active) setDashboard(payload);
      } catch {
        // Keep the ticker compact and show unavailable values until the next refresh.
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadDashboard();
    const refreshTimer = window.setInterval(loadDashboard, 60_000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  return (
    <section className="border-b border-hairline-soft bg-white" aria-label="Live market and Jalgaon weather">
      <div className="market-ticker mx-auto flex h-12 max-w-[100vw] items-center overflow-hidden text-xs sm:text-sm">
        <div className="market-ticker-track flex w-max items-center">
          <TickerItems dashboard={dashboard} loading={loading} />
          <div aria-hidden="true">
            <TickerItems dashboard={dashboard} loading={loading} />
          </div>
        </div>
      </div>
    </section>
  );
}
