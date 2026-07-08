# Commodity and weather API setup

The homepage dashboard uses several server-side providers:

- [Alpha Vantage](https://www.alphavantage.co/documentation/) for gold, silver, crude oil, and USD-to-INR conversion.
- [Yahoo Finance](https://finance.yahoo.com/) as a no-key fallback for gold and silver futures when Alpha Vantage is rate-limited.
- [Frankfurter](https://frankfurter.dev/) for the USD-to-INR reference exchange rate (no API key required).
- [WeatherAPI.com](https://www.weatherapi.com/docs/) for Jalgaon weather and the three-day forecast.

## 1. Create the environment file

Create a file named `.env.local` in this directory:

```text
D:\jalgaonWeb\New-JalgaonUI\.env.local
```

Add your keys:

```dotenv
ALPHA_VANTAGE_API_KEY=replace_with_your_alpha_vantage_api_key
WEATHERAPI_KEY=replace_with_your_weatherapi_key
```

Do not prefix these variables with `NEXT_PUBLIC_`. They are read only by the server route and must not be exposed in browser JavaScript. `.env.local` is covered by the repository's `.env*` ignore rule.

## 2. Restart Next.js

Environment changes are loaded when the development server starts:

```powershell
cd D:\jalgaonWeb\New-JalgaonUI
npm run dev
```

Open `http://localhost:3000`. You can also inspect the normalized data returned to the widget at `http://localhost:3000/api/dashboard`; API keys are never included in that response.

## 3. Market symbols and trends

The dashboard requests `GOLD_SILVER_SPOT` for gold and silver, `WTI` for crude oil, and USD to INR conversion. Gold and silver are converted from troy ounces to INR per gram, and crude oil is shown in INR per barrel. If Alpha Vantage rate-limits gold or silver, the route falls back to Yahoo Finance futures symbols `GC=F` and `SI=F`. Where a provider returns change data, green means up and red means down.

## Refresh behavior

- The browser checks the local dashboard route every 60 seconds.
- Market responses are paced server-side and cached for 5 minutes to avoid exhausting Alpha Vantage's free-tier limits.
- Weather provider responses are revalidated every 10 minutes.
- When a key is missing or a provider is unavailable, the UI shows placeholders instead of invented live values.
