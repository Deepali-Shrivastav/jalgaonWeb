# Commodity and weather API setup

The homepage dashboard uses three server-side providers:

- [CommodityPriceAPI](https://www.commoditypriceapi.com/) for gold, silver, and WTI crude oil prices.
- [Frankfurter](https://frankfurter.dev/) for the USD-to-INR reference exchange rate (no API key required).
- [WeatherAPI.com](https://www.weatherapi.com/docs/) for Jalgaon weather and the three-day forecast.

## 1. Create the environment file

Create a file named `.env.local` in this directory:

```text
D:\jalgaonWeb\New-JalgaonUI\.env.local
```

Add your keys:

```dotenv
COMMODITY_PRICE_API_KEY=replace_with_your_commodity_price_api_key
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

## 3. Commodity price units and trends

The dashboard requests only `XAU` (gold), `XAG` (silver), and `WTIOIL-SPOT` (WTI crude oil). Native USD commodity prices are converted with the USD-to-INR reference rate. Gold and silver are also converted from troy ounces to grams using `1 troy ounce = 31.1034768 grams`; crude oil remains priced per barrel. The small bars and percentage use the commodity provider's one-day fluctuation data—green means up and red means down.

## Refresh behavior

- The browser checks the local dashboard route every 60 seconds.
- Market provider responses are revalidated every 60 seconds.
- The USD-to-INR reference rate is revalidated every hour.
- Weather provider responses are revalidated every 10 minutes.
- When a key is missing or a provider is unavailable, the UI shows placeholders instead of invented live values.
