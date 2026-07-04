# Frontend Hardcoded Data Audit Report

This audit details all hardcoded/mock data currently stored in the frontend components and pages across the `jalgaonWeb` workspace. This includes both the modern Next.js project (**`New-JalgaonUI`**) and the legacy React project (**`jalgaonUi`**).

---

## 1. Modern Frontend: `New-JalgaonUI`
This project contains the majority of the active pages and components. Almost all sections (aside from live weather and metal rates in the weather ticker) currently render hardcoded mock data.

### Components Directory (`New-JalgaonUI/src/components/`)

| File / Component | Target Array / Variable | Item Count | Data Description / Fields |
| :--- | :--- | :--- | :--- |
| [`BusinessListings.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/BusinessListings.tsx#L22) | `mockListings` | 3 items | Mock hospital, dental, and pharmacy directory listings (Name, Category, Rating, Address, Phone, etc.). |
| [`IndustryGrids.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/IndustryGrids.tsx#L5) | `industries` | 22 categories | Massive listing of local industry categories (Automotive, Agriculture, Real Estate, Beauty, Education, Retail, etc.) with nested sub-category icons (approx. 200 nested items total). |
| [`LatestNews.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/LatestNews.tsx#L21-L32) | `featuredStory` & `newsStories` | 5 stories total | Mock news items (Gold market trends, Monsoon festival, Civic digital portals, agricultural rain forecasts). |
| [`TrendingListings.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/TrendingListings.tsx#L3) | `listings` | 4 items | Popular local hotspots (Spicy Tadka, Royal Heritage hotel, Zen Wellness spa, Elite Motors). |
| [`UpcomingEvents.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/UpcomingEvents.tsx#L1) | `events` | 4 items | Local upcoming events (Food Festival, Agri-Tech Expo, Business Summit). |
| [`LocalWonders.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/LocalWonders.tsx#L19) | `wonders` | 4 items | Tourist destinations (Ajanta Caves, Padalsare Dam, Mehrun Lake, Patnadevi Temple) with distance labels. |
| [`JobOpenings.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/JobOpenings.tsx#L1) | `jobs` | 3 items | Job listings (Software Developer, Sales Executive, Accountant) with companies and salaries. |
| [`BlogSection.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/BlogSection.tsx#L16) | `posts` | 3 items | Local stories / blog guides (Guide to growing local business, Mehrun lake walk guide, Travel heritage guide). |
| [`NgoSpotlight.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/NgoSpotlight.tsx#L1) | `organisations` | 3 items | Spotlighted local NGOs (Green Jalgaon Foundation, Vidya Peeth Trust, Health First Initiative). |
| [`Header.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/Header.tsx#L7) | `navLinks` | 6 items | Static site navigation links. |
| [`MarketWeatherDashboard.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/MarketWeatherDashboard.tsx#L16) | `marketPlaceholders` | 3 items | Placeholder ids/labels for the ticker market instruments (Gold, Silver, WTI Crude). |

### Portal Pages (`New-JalgaonUI/src/app/`)

| File / Component | Target Array / Variable | Item Count | Data Description / Fields |
| :--- | :--- | :--- | :--- |
| [`news/NewsPortal.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/news/NewsPortal.tsx#L8) | `newsArticles` | 3 items | Featured and regular news articles (Start-up Hub MIDC, Cultural Fest at Gandhi Garden, Gold Market sales). |
| [`jobs/JobsPortal.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/jobs/JobsPortal.tsx#L14) | `jobListings` | 4 items | Mock full job listing cards (TechSol, Mahalakshmi Engineering, Silver Bells School, HDFC office) with inline logos. |
| [`events/EventsPortal.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/events/EventsPortal.tsx#L9-L51) | `featuredEvents` & `upcomingEvents` | 6 items total | Detailed event listings (Tapovan Heritage Fest, Tech Summit Jain Hills, Cricket League, classical music, farmers market). |

### API Routes Configuration (`New-JalgaonUI/src/app/api/`)
- **[`dashboard/route.ts`](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/api/dashboard/route.ts#L40)**: Uses a hardcoded `marketInstruments` array to determine which commodity API symbols to query (`XAU` for Gold, `XAG` for Silver, and `WTIOIL-SPOT` for Crude Oil).

---

## 2. Legacy Frontend: `jalgaonUi`
The legacy Vite + React project has a similar layout and structure but features slightly fewer mock items.

| File / Component | Target Array / Variable | Item Count | Data Description / Fields |
| :--- | :--- | :--- | :--- |
| [`Home.jsx`](file:///d:/jalgaonWeb/jalgaonUi/src/pages/Home.jsx#L6-L36) | `trending`, `industries`, `news`, `events`, `jobs` | ~25 items total | Legacy landing page mock cards containing placeholder hotels, industries, static news summaries, cricket events, and job titles. |
| [`AddAdvertiseForm.jsx`](file:///d:/jalgaonWeb/jalgaonUi/src/components/AllForms/AddAdvertiseForm.jsx#L6) | `adTypeOptions` | 4 items | Form option configurations (Banner, Sidebar, Popup, Sponsored). |

---

## Summary of Audit Findings
1. **Directory and Category Structures**: The industry taxonomy in [`IndustryGrids.tsx`](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/IndustryGrids.tsx) is entirely static. If categories are updated on the backend database, they must currently be manually synced in the React code.
2. **Mocking Level**: Over **95%** of the visible user directory content (individual businesses, specific job postings, news stories, and event items) is stored in inline JavaScript arrays rather than being queried from a backend database or CMS.
3. **Dynamic Integrations**: The only page sections that are connected to dynamic APIs are:
   - Weather API (Jalgaon & Bhusawal forecast).
   - Commodity price feeds (Gold, Silver, Crude Oil via Frankfurter and CommodityPriceAPI).
