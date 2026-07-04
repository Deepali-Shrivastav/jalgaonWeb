import type { DashboardResponse, MarketQuote, WeatherSnapshot } from "@/lib/dashboard-types";

export const dynamic = "force-dynamic";

type CommodityPriceResponse = {
  success?: boolean;
  rates?: Record<string, number>;
  error?: string;
  message?: string;
};

type CommodityFluctuationResponse = {
  success?: boolean;
  rates?: Record<string, { changePercent?: number }>;
};

type ExchangeRateResponse = {
  base?: string;
  quote?: string;
  rate?: number;
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

const marketInstruments = [
  {
    id: "gold",
    label: "Gold",
    symbol: "XAU",
    unit: "per gram",
    unitMultiplier: 1 / 31.1034768,
  },
  {
    id: "silver",
    label: "Silver",
    symbol: "XAG",
    unit: "per gram",
    unitMultiplier: 1 / 31.1034768,
  },
  {
    id: "crude-oil",
    label: "Crude Oil (WTI)",
    symbol: "WTIOIL-SPOT",
    unit: "per barrel",
    unitMultiplier: 1,
  },
];

async function fetchMarket(key: string): Promise<MarketQuote[]> {
  const symbols = marketInstruments.map(({ symbol }) => symbol).join(",");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  const latestUrl = new URL("https://api.commoditypriceapi.com/v2/rates/latest");
  latestUrl.searchParams.set("symbols", symbols);

  const fluctuationUrl = new URL("https://api.commoditypriceapi.com/v2/rates/fluctuation");
  fluctuationUrl.searchParams.set("symbols", symbols);
  fluctuationUrl.searchParams.set("startDate", formatDate(yesterday));
  fluctuationUrl.searchParams.set("endDate", formatDate(today));

  const requestOptions = {
    headers: { "x-api-key": key },
    next: { revalidate: 60 },
  } as const;
  const [latestResponse, fluctuationResult, exchangeRateResponse] = await Promise.all([
    fetch(latestUrl, requestOptions),
    fetch(fluctuationUrl, requestOptions)
      .then(async (response) => response.ok ? await response.json() as CommodityFluctuationResponse : null)
      .catch(() => null),
    fetch("https://api.frankfurter.dev/v2/rate/USD/INR", { next: { revalidate: 3600 } }),
  ]);
  const payload = (await latestResponse.json()) as CommodityPriceResponse;
  const exchangeRatePayload = (await exchangeRateResponse.json()) as ExchangeRateResponse;
  const usdToInr = Number(exchangeRatePayload.rate);

  if (!latestResponse.ok || payload.success === false || !payload.rates) {
    throw new Error(payload.message || payload.error || "Commodity prices are unavailable");
  }
  if (!exchangeRateResponse.ok || !Number.isFinite(usdToInr)) {
    throw new Error("USD to INR conversion is unavailable");
  }

  return marketInstruments.flatMap((instrument): MarketQuote[] => {
    const value = Number(payload.rates?.[instrument.symbol]);
    if (!Number.isFinite(value)) return [];

    return [{
      id: instrument.id,
      label: instrument.label,
      value: value * usdToInr * instrument.unitMultiplier,
      currency: "INR",
      unit: instrument.unit,
      percentChange: Number.isFinite(fluctuationResult?.rates?.[instrument.symbol]?.changePercent)
        ? Number(fluctuationResult?.rates?.[instrument.symbol]?.changePercent)
        : undefined,
    }];
  });
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
  const marketKey = process.env.COMMODITY_PRICE_API_KEY;
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
      : "Add COMMODITY_PRICE_API_KEY and WEATHERAPI_KEY to .env.local, then restart Next.js.",
  };

  return Response.json(body, {
    headers: { "Cache-Control": "private, max-age=0, must-revalidate" },
  });
}
