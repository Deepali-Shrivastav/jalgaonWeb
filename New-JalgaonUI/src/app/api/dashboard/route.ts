import type { DashboardResponse, MarketQuote, WeatherSnapshot } from "@/lib/dashboard-types";

export const dynamic = "force-dynamic";

type AlphaVantageCommodityResponse = {
  data?: Array<{ date?: string; value?: string | number }>;
  price?: string | number;
  value?: string | number;
  "Error Message"?: string;
  Note?: string;
  Information?: string;
  [key: string]: unknown;
};

type AlphaVantageExchangeResponse = {
  "Realtime Currency Exchange Rate"?: {
    "5. Exchange Rate"?: string;
  };
  "Error Message"?: string;
  Note?: string;
  Information?: string;
};

type FrankfurterRateResponse = {
  rate?: number;
};

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        currency?: string;
      };
    }>;
  };
};

type WeatherApiResponse = {
  location?: { name?: string; region?: string; localtime?: string };
  current?: {
    temp_c?: number;
    condition?: { text?: string };
    humidity?: number;
    wind_kph?: number;
  };  
  forecast?: {
    forecastday?: Array<{
      date?: string;
      day?: { maxtemp_c?: number; condition?: { text?: string } };
    }>;
  };
  error?: { message?: string };
};

const commodityInstruments = [
  {
    id: "gold",
    label: "Gold",
    symbol: "GOLD",
    fallbackSymbol: "GC=F",
    unit: "per gram",
    unitMultiplier: 1 / 31.1034768,
  },
  {
    id: "silver",
    label: "Silver",
    symbol: "SILVER",
    fallbackSymbol: "SI=F",
    unit: "per gram",
    unitMultiplier: 1 / 31.1034768,
  },
] as const;

const marketCacheMs = 5 * 60 * 1000;
const alphaRequestSpacingMs = 1_200;
const requiredMarketIds = new Set(["gold", "silver", "crude-oil"]);
let marketCache: { data: MarketQuote[]; expiresAt: number } | null = null;
let lastAlphaRequestAt = 0;

async function fetchMarket(key: string): Promise<MarketQuote[]> {
  const now = Date.now();
  if (marketCache && marketCache.expiresAt > now) return marketCache.data;

  const quotes: MarketQuote[] = [];
  let lastError: Error | undefined;

  const usdToInr = await fetchUsdToInr(key).catch((error) => {
    lastError = error instanceof Error
      ? error
      : new Error("USD to INR conversion is unavailable");
    return null;
  });

  if (usdToInr) {
    for (const instrument of commodityInstruments) {
      try {
        const quote = await fetchMetalQuote(instrument, key, usdToInr);
        if (quote) quotes.push(quote);
      } catch (error) {
        lastError = error instanceof Error
          ? error
          : new Error("Alpha Vantage metal prices are unavailable");
      }
    }

    try {
      const quote = await fetchWtiQuote(key, usdToInr);
      if (quote) quotes.push(quote);
    } catch (error) {
      lastError = error instanceof Error
        ? error
        : new Error("Alpha Vantage crude oil prices are unavailable");
    }
  }

  if (quotes.length === 0 && lastError) {
    throw lastError;
  }

  if (hasRequiredMarketQuotes(quotes)) {
    marketCache = { data: quotes, expiresAt: now + marketCacheMs };
  }

  return quotes;
}

function hasRequiredMarketQuotes(quotes: MarketQuote[]) {
  const quoteIds = new Set(quotes.map((quote) => quote.id));
  return [...requiredMarketIds].every((id) => quoteIds.has(id));
}

async function fetchUsdToInr(key: string): Promise<number> {
  const fallbackRate = await fetchFrankfurterUsdToInr().catch(() => null);
  if (fallbackRate) return fallbackRate;

  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "CURRENCY_EXCHANGE_RATE");
  url.searchParams.set("from_currency", "USD");
  url.searchParams.set("to_currency", "INR");
  url.searchParams.set("apikey", key);

  const response = await fetchAlphaVantage(url, 3600);
  const payload = (await response.json()) as AlphaVantageExchangeResponse;
  const providerMessage = payload["Error Message"] || payload.Note || payload.Information;
  const rate = Number(payload["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"]);

  if (!response.ok || providerMessage || !Number.isFinite(rate)) {
    throw new Error(providerMessage || "USD to INR conversion is unavailable");
  }

  return rate;
}

async function fetchFrankfurterUsdToInr(): Promise<number> {
  const response = await fetch("https://api.frankfurter.dev/v2/rate/USD/INR", {
    next: { revalidate: 3600 },
  });
  const payload = (await response.json()) as FrankfurterRateResponse;
  const rate = Number(payload.rate);

  if (!response.ok || !Number.isFinite(rate)) {
    throw new Error("USD to INR conversion is unavailable");
  }

  return rate;
}

async function fetchMetalQuote(
  instrument: (typeof commodityInstruments)[number],
  key: string,
  usdToInr: number,
): Promise<MarketQuote | null> {
  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "GOLD_SILVER_SPOT");
  url.searchParams.set("symbol", instrument.symbol);
  url.searchParams.set("apikey", key);

  const response = await fetchAlphaVantage(url, 300);
  const payload = (await response.json()) as AlphaVantageCommodityResponse;
  const providerMessage = payload["Error Message"] || payload.Note || payload.Information;
  let usdValue = extractLatestCommodityValue(payload, ["price", "value", "spot"]);

  if (providerMessage || !Number.isFinite(usdValue)) {
    usdValue = await fetchYahooCommodityPrice(instrument.fallbackSymbol);
  }

  if (!response.ok && !Number.isFinite(usdValue)) {
    throw new Error(providerMessage || "Metal prices are unavailable");
  }

  return {
    id: instrument.id,
    label: instrument.label,
    value: usdValue * usdToInr * instrument.unitMultiplier,
    currency: "INR",
    unit: instrument.unit,
    note: Number.isFinite(extractLatestCommodityValue(payload, ["price", "value", "spot"]))
      ? instrument.symbol
      : instrument.fallbackSymbol,
  };
}

async function fetchYahooCommodityPrice(symbol: string): Promise<number> {
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
  url.searchParams.set("range", "1d");
  url.searchParams.set("interval", "1d");

  const response = await fetch(url, { next: { revalidate: 300 } });
  const payload = (await response.json()) as YahooChartResponse;
  const value = Number(payload.chart?.result?.[0]?.meta?.regularMarketPrice);

  if (!response.ok || !Number.isFinite(value)) {
    throw new Error("Fallback metal prices are unavailable");
  }

  return value;
}

async function fetchWtiQuote(key: string, usdToInr: number): Promise<MarketQuote | null> {
  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "WTI");
  url.searchParams.set("interval", "daily");
  url.searchParams.set("apikey", key);

  const response = await fetchAlphaVantage(url, 300);
  const payload = (await response.json()) as AlphaVantageCommodityResponse;
  const providerMessage = payload["Error Message"] || payload.Note || payload.Information;
  const latest = payload.data?.find((point) => Number.isFinite(Number(point.value)));
  const previous = payload.data?.find((point) => {
    const value = Number(point.value);
    return latest && point.date !== latest.date && Number.isFinite(value);
  });
  let usdValue = Number(latest?.value);
  let note = "WTI";

  if (providerMessage || !Number.isFinite(usdValue)) {
    try {
      usdValue = await fetchYahooCommodityPrice("CL=F");
      note = "CL=F";
    } catch (e) {
      // ignore fallback error
    }
  }

  if (!response.ok && !Number.isFinite(usdValue)) {
    throw new Error(providerMessage || "Alpha Vantage crude oil prices are unavailable");
  }

  return {
    id: "crude-oil",
    label: "Crude Oil (WTI)",
    value: usdValue * usdToInr,
    currency: "INR",
    unit: "per barrel",
    percentChange: calculatePercentChange(usdValue, Number(previous?.value)),
    note,
  };
}

function extractLatestCommodityValue(payload: Record<string, unknown>, preferredKeys: string[]): number {
  const data = payload.data;
  if (Array.isArray(data)) {
    const latestPoint = data.find((point) => {
      if (!point || typeof point !== "object") return false;
      return Number.isFinite(Number((point as { value?: unknown }).value));
    });
    const latestValue = Number((latestPoint as { value?: unknown } | undefined)?.value);
    if (Number.isFinite(latestValue)) return latestValue;
  }

  for (const key of preferredKeys) {
    const value = Number(payload[key]);
    if (Number.isFinite(value)) return value;
  }

  for (const value of Object.values(payload)) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[$,%]/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
    if (value && typeof value === "object") {
      const nestedValue: number = extractLatestCommodityValue(value as Record<string, unknown>, preferredKeys);
      if (Number.isFinite(nestedValue)) return nestedValue;
    }
  }

  return Number.NaN;
}

function calculatePercentChange(current: number, previous: number) {
  if (!Number.isFinite(previous) || previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

async function fetchAlphaVantage(url: URL, revalidate: number) {
  const now = Date.now();
  const waitMs = Math.max(0, alphaRequestSpacingMs - (now - lastAlphaRequestAt));
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  lastAlphaRequestAt = Date.now();
  return fetch(url, { next: { revalidate } });
}

async function fetchWeather(key: string, query: string, defaultLocation: string): Promise<WeatherSnapshot> {
  const url = new URL("https://api.weatherapi.com/v1/forecast.json");
  url.searchParams.set("key", key);
  url.searchParams.set("q", query);
  // WeatherAPI includes today in its forecast, so request today plus the next three days.
  url.searchParams.set("days", "4");
  url.searchParams.set("aqi", "no");
  url.searchParams.set("alerts", "no");

  const response = await fetch(url, { next: { revalidate: 600 } });
  const payload = (await response.json()) as WeatherApiResponse;

  if (!response.ok || payload.error || !payload.current) {
    throw new Error("Weather data is unavailable");
  }

  const forecastDays = payload.forecast?.forecastday || [];
  const currentDate = payload.location?.localtime?.slice(0, 10)
    || forecastDays[0]?.date
    || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

  return {
    location: payload.location?.name || defaultLocation,
    region: payload.location?.region || "Maharashtra",
    currentDate,
    tempC: Number(payload.current.temp_c ?? 0),
    condition: payload.current.condition?.text || "Current conditions",
    humidity: Number(payload.current.humidity ?? 0),
    windKph: Number(payload.current.wind_kph ?? 0),
    forecast: forecastDays.filter((day) => day.date && day.date > currentDate).slice(0, 3).map((day) => ({
      date: day.date || "",
      maxTempC: Number(day.day?.maxtemp_c ?? 0),
      condition: day.day?.condition?.text || "Forecast",
    })),
  };
}

export async function GET() {
  const marketKey = process.env.ALPHA_VANTAGE_API_KEY;
  const weatherKey = process.env.WEATHERAPI_KEY;

  const [marketResult, weatherResult, bhusawalWeatherResult] = await Promise.allSettled([
    marketKey ? fetchMarket(marketKey) : Promise.resolve([]),
    weatherKey ? fetchWeather(weatherKey, "Jalgaon, Maharashtra, India", "Jalgaon") : Promise.resolve(null),
    weatherKey ? fetchWeather(weatherKey, "Bhusawal, Maharashtra, India", "Bhusawal") : Promise.resolve(null),
  ]);

  const market = marketResult.status === "fulfilled" ? marketResult.value : [];
  const weather = weatherResult.status === "fulfilled" ? weatherResult.value : null;
  const bhusawalWeather = bhusawalWeatherResult.status === "fulfilled" ? bhusawalWeatherResult.value : null;
  const configured = Boolean(marketKey && weatherKey);

  const body: DashboardResponse = {
    configured,
    marketConfigured: Boolean(marketKey),
    weatherConfigured: Boolean(weatherKey),
    market,
    weather,
    bhusawalWeather,
    updatedAt: new Date().toISOString(),
    message: configured
      ? market.length > 0 || weather || bhusawalWeather
        ? undefined
        : "The providers returned no data. Check the API keys and configured symbols."
      : "Add ALPHA_VANTAGE_API_KEY and WEATHERAPI_KEY to .env.local, then restart Next.js.",
  };

  return Response.json(body, {
    headers: { "Cache-Control": "private, max-age=0, must-revalidate" },
  });
}
