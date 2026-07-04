export type MarketQuote = {
  id: string;
  label: string;
  value: number;
  currency: string;
  percentChange?: number;
  unit?: string;
  note?: string;
};

export type ForecastDay = {
  date: string;
  maxTempC: number;
  condition: string;
};

export type WeatherSnapshot = {
  location: string;
  region: string;
  currentDate: string;
  tempC: number;
  condition: string;
  humidity: number;
  windKph: number;
  forecast: ForecastDay[];
};

export type DashboardResponse = {
  configured: boolean;
  marketConfigured: boolean;
  weatherConfigured: boolean;
  market: MarketQuote[];
  weather: WeatherSnapshot | null;
  bhusawalWeather?: WeatherSnapshot | null;
  updatedAt: string;
  message?: string;
};
