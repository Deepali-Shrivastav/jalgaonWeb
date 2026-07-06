# Project Audit Report — Jalgaon.com

**Audit Date:** 5 July 2026  
**Auditor:** Antigravity AI  
**Project:** Jalgaon.com – City Digital Ecosystem Platform

---

## 1. Project Overview

Jalgaon.com is a **city-centric digital ecosystem** for the Jalgaon district (North Maharashtra). It contains:

### Technology Stack
| Layer | Technology |
|---|---|
| Frontend (Active) | **Next.js 16** (React 19, TypeScript, Tailwind CSS 4) — `New-JalgaonUI/` |
| Frontend (Legacy) | **Vite + React (JSX)** with Capacitor for Android — `jalgaonUi/` |
| Backend | **Django 5 + DRF** with SimpleJWT — `jalgaonApi/` |
| Database | SQLite (dev), PostgreSQL (prod-ready) |
| API Docs | drf-spectacular (Swagger at `/api/docs/`) |

### Main Modules
| Module | Backend App | Frontend Pages |
|---|---|---|
| Authentication | `apps.accounts` | `LoginSignup.tsx` modal, `AuthContext.tsx` |
| Business Directory | `apps.directory` | Homepage, `/directory/[slug]`, `/add-listing`, `/edit-listing/[slug]`, `/search`, `/category/[slug]` |
| News | `apps.news` | `/news`, `/news/[slug]` |
| Events | `apps.events` | `/events`, `/events/[slug]`, `/add-event` |
| Jobs | `apps.jobs` | `/jobs`, `/jobs/[slug]`, `/add-job`, `/jobs/submit` |
| NGOs | `apps.ngo` | `/ngo`, `/add-ngo` |
| Advertisements | `apps.ads` | `CarouselAds.tsx`, `/advertise` |
| Tourism | `apps.tourism` | `/tourism` |
| Admin Panel | `apps.admin_panel` | `/admin/*` (12 sub-pages) |
| User Dashboard | — | `/account/*` (9 sub-sections) |
| Market/Weather | — | `MarketWeatherDashboard.tsx`, `/api/dashboard` |
| Reviews | `apps.reviews` | Inline in `BusinessProfile.tsx` |
| Finance | `apps.finance` | Commodity ticker data |
| SEO | — | `sitemap.ts`, `robots.ts`, structured data |

### Inactive / Shell Backend Apps (registered in `INSTALLED_APPS` but contain only boilerplate `models.py = # Create your models here.`)
`blog`, `payments`, `notifications`, `dashboard`, `cms`, `media_lib`, `analytics`, `startups`, `clubs`, `tourism`

---

## 2. Completed Work

| Feature / Module | Status | Related Files | Notes |
|---|---|---|---|
| **User Auth (Login/Register)** | ✅ Complete | [LoginSignup.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/LoginSignup.tsx), [AuthContext.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/context/AuthContext.tsx), [accounts/views.py](file:///d:/jalgaonWeb/jalgaonApi/apps/accounts/views.py) | Phone+password login, JWT tokens, CSRF, role redirect, logout |
| **User Registration** | ✅ Complete | Same as above | Auto-login after register |
| **RBAC (Core Permissions)** | ✅ Complete | [core/permissions.py](file:///d:/jalgaonWeb/jalgaonApi/core/permissions.py), [accounts/models.py](file:///d:/jalgaonWeb/jalgaonApi/apps/accounts/models.py) | 11 roles defined, 7 permission classes (IsAdminRole, IsSuperAdmin, IsModerator, etc.) |
| **Admin Layout + Sidebar** | ✅ Complete | [admin/layout.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/layout.tsx), [AdminSidebar.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/admin/AdminSidebar.tsx), [AdminTopbar.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/admin/AdminTopbar.tsx) | Role-guarded, collapsible sidebar, dynamic page titles |
| **Admin Dashboard Stats** | ✅ Complete | [admin/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/page.tsx), [admin_panel/views.py](file:///d:/jalgaonWeb/jalgaonApi/apps/admin_panel/views.py) | Stats cards, role-based dashboards |
| **Admin Listing Management** | ✅ Complete | [admin/listings/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/listings/page.tsx) | CRUD, search, filter, bulk actions, preview modal, trending management |
| **Admin User Management** | ✅ Complete | [admin/users/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/users/page.tsx) | List, search, role filter, toggle active, role assignment |
| **Admin Category Management** | ✅ Complete | [admin/categories/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/categories/page.tsx) | Full CRUD for main categories + subcategories |
| **Admin News Management** | ✅ Complete | [admin/news/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/news/page.tsx), [create](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/news/create/page.tsx), edit, [comments](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/news/comments/page.tsx), [categories](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/news/categories/page.tsx) | List, create, edit, delete, categories, comments moderation |
| **Admin Event Management** | ✅ Complete | [admin/events/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/events/page.tsx), [categories](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/events/categories/page.tsx) | List, approve/reject, delete, categories |
| **Admin Job Management** | ✅ Complete | [admin/jobs/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/jobs/page.tsx), [applications](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/jobs/applications/page.tsx), [categories](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/jobs/categories/page.tsx) | Jobs list, applications, categories |
| **Admin Moderation Queue** | ✅ Complete | [admin/moderation/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/moderation/page.tsx) | Approve/reject items |
| **Admin Claims & Reports** | ✅ Complete | [admin/claims/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/claims/page.tsx), [admin/reports/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/reports/page.tsx) | Business claim approval, report resolution |
| **Admin Ads Moderation** | ✅ Complete | [admin/ads/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/ads/page.tsx) | Approve/reject/revision ads |
| **Admin NGO Management** | ✅ Complete | [admin/ngos/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/ngos/page.tsx) | List, verify, delete NGOs |
| **Admin Trending Management** | ✅ Complete | [admin/trending/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/trending/page.tsx) | Dedicated trending listings page |
| **Business Listing CRUD** | ✅ Complete | [directory/views.py](file:///d:/jalgaonWeb/jalgaonApi/apps/directory/views.py), [AddListingClient.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/add-listing/AddListingClient.tsx) | Create, read, update, delete with image upload |
| **Business Profile Page** | ✅ Complete | [BusinessProfile.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/BusinessProfile.tsx) | Full profile with reviews, map, contact, claim/report |
| **Business Search/Filter** | ✅ Complete | [BusinessListings.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/BusinessListings.tsx), [/search](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/search/page.tsx) | Category filter, search, grid/list views |
| **Homepage Sections** | ✅ Complete | [page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/page.tsx) | Hero, Trending, Industry Grids, News, Events, Jobs, NGO, Blog, CTA, Contact |
| **News Portal** | ✅ Complete | [NewsPortal.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/news/NewsPortal.tsx), [/news/[slug]](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/news/%5Bslug%5D) | List, detail, categories, breaking, trending |
| **Events Portal** | ✅ Complete | [EventsPortal.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/events/EventsPortal.tsx), [/events/[slug]](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/events/%5Bslug%5D) | List, detail, categories, past events |
| **Jobs Portal** | ✅ Complete | [JobsPortal.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/jobs/JobsPortal.tsx), [/jobs/[slug]](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/jobs/%5Bslug%5D), [JobApplyModal.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/JobApplyModal.tsx) | List, detail, apply, categories |
| **NGO Section** | ✅ Complete | [NgoClient.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/ngo/NgoClient.tsx) | List, detail, register |
| **Ad Carousel System** | ✅ Complete | [CarouselAds.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/CarouselAds.tsx), [ads/views.py](file:///d:/jalgaonWeb/jalgaonApi/apps/ads/views.py) | Slot-based ads, impression/click tracking, carousel |
| **Advertise Page** | ✅ Complete | [AdvertiseClient.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/advertise/AdvertiseClient.tsx) | Ad submission form |
| **Market/Weather Dashboard** | ✅ Complete | [MarketWeatherDashboard.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/MarketWeatherDashboard.tsx), [/api/dashboard/route.ts](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/api/dashboard/route.ts) | Gold/Silver/Oil prices, weather for Jalgaon & Bhusawal |
| **SEO (Sitemap, Robots, Meta)** | ✅ Complete | [sitemap.ts](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/sitemap.ts), [robots.ts](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/robots.ts), [layout.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/layout.tsx) | Dynamic sitemap, OpenGraph, Twitter cards, structured data |
| **Terms & Privacy Pages** | ✅ Complete | [terms/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/terms/page.tsx), [privacy/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/privacy/page.tsx) | Static legal pages |
| **User Dashboard** | ✅ Complete | [DashboardClient.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/account/DashboardClient.tsx) | My Listings, Saved, My Jobs, Applications, Events, NGOs, Settings |
| **Audit Logging** | ✅ Complete | [apps/audit/](file:///d:/jalgaonWeb/jalgaonApi/apps/audit/) | All admin actions logged via `log_audit_action()` |
| **Rate Limiting** | ✅ Complete | [settings.py](file:///d:/jalgaonWeb/jalgaonApi/jalgaonApi/settings.py) | Anon 100/min, User 500/min |
| **Swagger API Docs** | ✅ Complete | [settings.py](file:///d:/jalgaonWeb/jalgaonApi/jalgaonApi/settings.py) | Available at `/api/docs/` |
| **Header + Navigation** | ✅ Complete | [Header.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/Header.tsx) | Desktop nav, login/account state, mobile icon |
| **Dual Footer** | ✅ Complete | [Footer.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/Footer.tsx), [ui/footer.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/ui/footer.tsx) | Desktop + mobile footer components |
| **Mobile Bottom Menu** | ✅ Complete | [modern-mobile-menu.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/ui/modern-mobile-menu.tsx) | Interactive mobile dock |

---

## 3. Partially Completed Work

| Feature / Module | What is Done | What is Missing | Related Files | Priority |
|---|---|---|---|---|
| **JWT Token Refresh** | Refresh token is stored in `localStorage`; used in 2 pages | **No automatic token refresh interceptor**. Most pages do NOT refresh expired tokens — only `AddEventClient.tsx` and `admin/events/categories` have manual refresh logic. Every other API call silently fails on 401. | [LoginSignup.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/LoginSignup.tsx), [AuthContext.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/context/AuthContext.tsx) | 🔴 High |
| **Tourism Page** | Frontend page exists with hardcoded data | No backend `tourism` models/views/urls — the app is a shell (empty `models.py`, no `urls.py`, no `serializers.py`). Tourism page uses completely static data. | [tourism/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/tourism/page.tsx), [apps/tourism/](file:///d:/jalgaonWeb/jalgaonApi/apps/tourism/) | 🟡 Medium |
| **Blog Section** | Frontend `BlogSection.tsx` renders on homepage | **Blog data is 100% hardcoded** (no API). Backend `apps.blog` is an empty shell with no models/views. Blog articles are not clickable (no routes). | [BlogSection.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/BlogSection.tsx), [apps/blog/](file:///d:/jalgaonWeb/jalgaonApi/apps/blog/) | 🟡 Medium |
| **NGO Backend** | Model, serializer, views, URLs exist | NGO page partially uses hardcoded JSON (`ngo_data.json`) instead of the real API. Mixed data sources. | [NgoClient.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/ngo/NgoClient.tsx), [ngo_data.json](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/ngo/ngo_data.json) | 🟡 Medium |
| **Business Listings (Next.js API Route)** | Mock API at `/api/businesses` exists | This is a **mock/hardcoded** API returning 4 fake listings — not connected to Django backend. Used only by the legacy `/homepage` page. | [/api/businesses/route.ts](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/api/businesses/route.ts) | 🟢 Low |
| **Pagination (Admin Pages)** | Backend returns paginated data | Most admin pages only render `data.results \|\| data` — no "Next Page" / "Previous Page" controls. Data beyond page 1 is invisible. | All admin pages under `/admin/*` | 🔴 High |
| **User Dashboard Sub-routes** | Directories exist for all tabs | Sub-routes like `/account/my-listings`, `/account/jobs`, etc. exist as directories but are managed via tab state in `DashboardClient.tsx` — NOT as actual navigable pages. Direct URL navigation won't work. | [/account/](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/account/) | 🟡 Medium |
| **Edit Listing** | Directory exists at `/edit-listing/[slug]` | Need to verify the edit form is fully functional and pre-populates correctly. | [/edit-listing/](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/edit-listing/) | 🟡 Medium |
| **Homepage vs. `/homepage`** | Two separate homepages exist | Root `/` uses Next.js routing; `/homepage` is a legacy SPA-style page with state-based navigation. Confusing duplication. | [page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/page.tsx), [homepage/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/homepage/page.tsx) | 🟡 Medium |
| **Contact Form** | Frontend form exists on homepage | Form has no backend endpoint — the submit just shows a local success message without actually sending data. | [ContactForm.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/ContactForm.tsx) | 🟡 Medium |
| **Error Handling (Admin)** | Basic try/catch exists | No consistent error toasts; `catch {}` blocks with empty bodies; no user-friendly error messages on many pages. | All admin pages | 🟡 Medium |

---

## 4. Remaining Work

| Feature / Module | Required Work | Suggested Files to Update/Create | Priority |
|---|---|---|---|
| **Payments System** | Full payment gateway integration (Razorpay/PhonePe) for premium listings, ads, featured placements. Backend `apps.payments` is empty. | `apps/payments/models.py`, `views.py`, `urls.py`, `serializers.py`, new frontend payment pages | 🔴 High |
| **Notifications System** | Push/in-app notifications for claims, approvals, messages. Backend `apps.notifications` is empty. | `apps/notifications/models.py`, `views.py`, `urls.py`, frontend notification bell component | 🔴 High |
| **OTP-based Authentication** | Currently password-based; code comments mention "OTP in next phase". Fast2SMS key field exists but is empty. | `apps/accounts/views.py`, `LoginSignup.tsx` | 🔴 High |
| **Forgot Password / Reset** | No password reset flow exists at all. | `apps/accounts/views.py`, `apps/accounts/urls.py`, new frontend form | 🔴 High |
| **Blog Backend & CMS** | `apps.blog` and `apps.cms` are empty. No blog creation, categories, or content management. | `apps/blog/models.py`, `views.py`, `urls.py`, blog frontend pages | 🟡 Medium |
| **Tourism Backend** | `apps.tourism` has no models. The tourism page is hardcoded HTML. | `apps/tourism/models.py`, `views.py`, `urls.py`, `serializers.py` | 🟡 Medium |
| **Analytics Backend** | `apps.analytics` is empty. No user/listing/ad analytics. | `apps/analytics/models.py`, `views.py` | 🟡 Medium |
| **Startups Module** | `apps.startups` is empty. No startup directory features. | Full backend CRUD + frontend pages | 🟢 Low |
| **Clubs Module** | `apps.clubs` is empty. No clubs features. | Full backend CRUD + frontend pages | 🟢 Low |
| **Media Library** | `apps.media_lib` is empty. No centralized media management for admin. | `apps/media_lib/models.py`, `views.py` | 🟢 Low |
| **Email Integration** | No email sending configured (Django EMAIL settings missing). | `settings.py`, `utils.py` for sending emails | 🟡 Medium |
| **Pagination UI** | Frontend admin tables have no pagination controls. | All `admin/*/page.tsx` files | 🔴 High |
| **Dark Mode** | CSS defines `.dark` variables, but they're identical to light mode and there's no theme toggle. | [globals.css](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/globals.css) | 🟢 Low |
| **User Profile Picture Upload** | Model field exists (`profile_pic`) but no upload UI. | [DashboardClient.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/account/DashboardClient.tsx) | 🟡 Medium |
| **Export/Reports** | `xlsx` package is installed but no export features exist for admin. | Admin pages, utility functions | 🟡 Medium |

---

## 5. Bugs / Issues Found

| Issue | Location / File | Reason | Suggested Fix | Priority |
|---|---|---|---|---|
| **Duplicate Footer rendering** | [layout.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/layout.tsx) + [page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/page.tsx) | Root layout renders `<FooterSection />` (mobile) + individual pages render `<Footer />` (desktop). The root `/` page renders BOTH — a desktop Footer inside `<main>` AND the layout FooterSection. | Remove `<Footer />` from individual page components; let layout handle it, OR conditionally render. | 🔴 High |
| **`BlogSection` not linked** | [BlogSection.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/BlogSection.tsx) | Blog posts have no `href`/`Link` — they appear as articles but are not clickable/navigable. Dead UI. | Either link to `/blog/[slug]` pages or remove section until blog is implemented. | 🟡 Medium |
| **Missing token refresh across app** | All API-calling components | Only 2 of ~30+ components attempt token refresh on 401. Sessions silently fail everywhere else. | Create a shared `fetchWithAuth()` utility that auto-refreshes tokens. | 🔴 High |
| **Admin pagination absent** | All admin pages | Backend returns paginated `{count, next, previous, results}`, but frontend never renders page controls. Only the first 20 items are visible. | Add a `Pagination` component to all admin list pages. | 🔴 High |
| **`catch {}` empty blocks** | [admin/listings/page.tsx L55](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/listings/page.tsx#L55), [L69](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/admin/listings/page.tsx#L69) | Errors are silently swallowed with `catch { /* skip */ }`. No user feedback. | Show error toast or status message on failure. | 🟡 Medium |
| **`BlogSection` imported but not used in `/homepage`** | [homepage/page.tsx L13](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/homepage/page.tsx#L13) | `BlogSection` is imported but never rendered in the JSX of the `/homepage` route. | Remove unused import. | 🟢 Low |
| **`demo.tsx` file** | [demo.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/demo.tsx) | A demo component that only renders `FooterSection`. Dead file. | Delete this file. | 🟢 Low |
| **`mobile-dock-demo.tsx` never imported** | [mobile-dock-demo.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/mobile-dock-demo.tsx) | Not imported by any component. Dead file. | Delete this file. | 🟢 Low |
| **Insecure secret key in `.env`** | [.env](file:///d:/jalgaonWeb/jalgaonApi/.env#L10) | `SECRET_KEY` is the Django insecure default placeholder — same as `settings.py` fallback. Used in committed `.env`. | Generate a proper secret key and add `.env` to `.gitignore`. | 🔴 High |
| **`.env.local` committed** | [.env.local](file:///d:/jalgaonWeb/New-JalgaonUI/.env.local) | Contains API keys for CommodityPrice & WeatherAPI. Should not be in version control. | Add to `.gitignore`, use `.env.example` pattern. | 🔴 High |
| **`next.config.ts` empty** | [next.config.ts](file:///d:/jalgaonWeb/New-JalgaonUI/next.config.ts) | No `images.remotePatterns` configured for external images (Unsplash, backend media). Next.js Image component won't work with remote URLs. | Add `images.remotePatterns` for API domain and Unsplash. | 🟡 Medium |
| **Root page is `'use client'`** | [page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/page.tsx) | The root page is entirely client-side rendered, losing Next.js SSR benefits for the most important page (SEO, LCP). | Extract data-fetching sections to server components. | 🟡 Medium |
| **`NEXT_PUBLIC_ADMIN_URL` points to old Vite UI** | [.env.local L5](file:///d:/jalgaonWeb/New-JalgaonUI/.env.local#L5) | `NEXT_PUBLIC_ADMIN_URL=http://localhost:5173` references the legacy Vite frontend. This variable is defined but appears unused in the New-JalgaonUI codebase. | Remove or update this variable. | 🟢 Low |

---

## 6. UI/UX Improvements

### Layout Improvements
- **Dual homepage confusion**: Root `/` and `/homepage` both render similar content. Keep only one.
- **Footer duplication**: Two footers render — desktop `Footer.tsx` in pages AND mobile `ui/footer.tsx` in root layout. Unify into a single responsive footer.
- **Admin layout on mobile**: Admin sidebar isn't responsive — no hamburger menu or drawer for mobile admin access.

### Sidebar/Navbar Improvements
- **Header lacks mobile navigation**: No hamburger menu/drawer on mobile — only a single account icon. Users can't navigate to News/Events/Jobs on mobile from header.
- **Admin sidebar**: Missing active link highlighting based on current route (only title changes).

### Form Improvements
- **No form validation beyond HTML `required`**: Add-listing, add-event, add-job, add-ngo forms lack client-side validation (e.g., phone format, image size, description length).
- **No loading spinners on some submit buttons**: Inconsistent loading states across forms.
- **Missing "Forgot Password" link** on login form.

### Dashboard Improvements
- **User dashboard overview is sparse**: Only shows 2 static cards. Should show actual counts (listings, jobs, saved items).
- **No success/error toast notifications**: Messages appear as inline text instead of proper toast notifications.

### Table/Card Improvements
- **Admin tables lack pagination**: Critical for data management.
- **Admin tables not sortable**: No column sorting capability.
- **Empty state designs**: Some empty states use generic icons; could be improved with illustrations.

### Mobile Responsiveness
- **Admin panel is NOT mobile-responsive**: Sidebar doesn't collapse; tables overflow on small screens.
- **User dashboard sidebar**: Has basic mobile toggle but navigation is cramped.
- **Tables in admin overflow**: No responsive table wrapper on many admin pages.
- **Desktop Footer is `hidden md:block`**: Desktop footer entirely hidden on mobile — only the minimal mobile footer shows.

### Animation/Interaction Improvements
- **Page transitions**: No route transition animations.
- **Skeleton loading**: Components use only spinners, not skeleton placeholders for better perceived performance.
- **Scroll-to-top**: No scroll-to-top button on long pages.

---

## 7. Backend / API Audit

### Working APIs ✅
| API | Endpoint | Status |
|---|---|---|
| Auth Register | `POST /api/v1/auth/register/` | ✅ Working |
| Auth Login | `POST /api/v1/auth/login/` | ✅ Working |
| Auth Logout | `POST /api/v1/auth/logout/` | ✅ Working |
| Token Refresh | `POST /api/v1/auth/token/refresh/` | ✅ Working |
| User Profile | `GET/PATCH /api/v1/auth/user/` | ✅ Working |
| CSRF Token | `GET /api/v1/auth/csrf-token/` | ✅ Working |
| Listings CRUD | `/api/v1/listings/*` | ✅ Working |
| Categories | `/api/v1/listings/categories/` | ✅ Working |
| Search | `/api/v1/search/` | ✅ Working |
| Reviews | `/api/v1/reviews/*` | ✅ Working |
| News CRUD | `/api/v1/news/*` | ✅ Working |
| Events CRUD | `/api/v1/events/*` | ✅ Working |
| Jobs CRUD | `/api/v1/jobs/*` | ✅ Working |
| NGOs CRUD | `/api/v1/ngo/*` | ✅ Working |
| Ads + Tracking | `/api/v1/ads/*` | ✅ Working |
| Finance | `/api/v1/finance/data/` | ✅ Working |
| Admin Panel (all) | `/api/v1/admin-panel/*` | ✅ Working |

### Missing APIs ❌
| API | Description |
|---|---|
| Password Reset | No reset password endpoint |
| OTP Send/Verify | No OTP endpoints (planned) |
| Blog CRUD | No blog APIs — `apps.blog` is empty |
| Tourism CRUD | No tourism APIs — `apps.tourism` is empty |
| Notifications | No notification APIs — `apps.notifications` is empty |
| Payments | No payment APIs — `apps.payments` is empty |
| Analytics | No analytics APIs — `apps.analytics` is empty |
| Startups | No startup APIs — `apps.startups` is empty |
| Clubs | No club APIs — `apps.clubs` is empty |
| Contact Form | No backend endpoint for contact form submission |
| Media Library | No centralized media API |

### Authentication Issues
- Login lockout logic exists in the model (`LoginAttempt.is_locked()`) but is **NOT called from the login view** — the lockout feature is implemented but never enforced.
- Token refresh is not automatically triggered client-side.

### Validation Issues
- Business listing creation relies heavily on backend serializer validation — frontend sends raw data without pre-validation.
- No file size limits for image uploads in the frontend.

### Database/Model Issues
- 10 backend apps have empty models (`blog`, `payments`, `notifications`, `dashboard`, `cms`, `media_lib`, `analytics`, `startups`, `clubs`, `tourism`) — they consume app registry slots without providing functionality.
- Using SQLite in dev is fine, but production PostgreSQL config has empty `DB_USER` and `DB_PASSWORD` defaults.

### Error Handling Improvements
- Backend error responses are generally well-structured but frontend doesn't consistently handle 4xx/5xx responses with user-friendly messages.
- Several admin views return `Response(serializer.errors)` which produces field-level JSON errors — frontend doesn't always parse these into readable messages.

---

## 8. Frontend Audit

### Pages Completed ✅
| Page | Route | Component |
|---|---|---|
| Home | `/` | [page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/page.tsx) |
| Homepage (Legacy) | `/homepage` | [homepage/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/homepage/page.tsx) |
| Search | `/search` | [search/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/search/page.tsx) |
| Directory Detail | `/directory/[slug]` | Dynamic route page |
| Category | `/category/[slug]` | Dynamic route page |
| News List | `/news` | [news/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/news/page.tsx) |
| News Detail | `/news/[slug]` | Dynamic route page |
| Events List | `/events` | [events/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/events/page.tsx) |
| Event Detail | `/events/[slug]` | Dynamic route page |
| Jobs List | `/jobs` | [jobs/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/jobs/page.tsx) |
| Job Detail | `/jobs/[slug]` | Dynamic route page |
| Job Submit | `/jobs/submit` | Submit job form |
| NGO List | `/ngo` | [ngo/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/ngo/page.tsx) |
| Tourism | `/tourism` | [tourism/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/tourism/page.tsx) |
| Add Listing | `/add-listing` | [AddListingClient.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/add-listing/AddListingClient.tsx) |
| Add Event | `/add-event` | [AddEventClient.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/add-event/AddEventClient.tsx) |
| Add Job | `/add-job` | [AddJobClient.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/add-job/AddJobClient.tsx) |
| Add NGO | `/add-ngo` | [AddNGOClient.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/add-ngo/AddNGOClient.tsx) |
| Edit Listing | `/edit-listing/[slug]` | Dynamic route page |
| Advertise | `/advertise` | [AdvertiseClient.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/advertise/AdvertiseClient.tsx) |
| User Dashboard | `/account` | [DashboardClient.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/account/DashboardClient.tsx) |
| Terms | `/terms` | Static page |
| Privacy | `/privacy` | Static page |
| Admin (12 pages) | `/admin/*` | All complete |

### Pages Missing ❌
| Page | Route |
|---|---|
| Blog List | `/blog` |
| Blog Detail | `/blog/[slug]` |
| Contact Page | `/contact` (standalone) |
| About Page | `/about` |
| Help Center | `/help` |
| User Public Profile | `/user/[id]` |
| Password Reset | `/reset-password` |
| 404 Page | Custom `not-found.tsx` |
| 500 Page | Custom `error.tsx` |

### Components Needing Improvement
- **`IndustryGrids.tsx` (22KB)**: Very large — should be split into smaller components.
- **`BusinessListings.tsx` (24KB)**: Very large — could be decomposed.
- **`BusinessProfile.tsx` (32KB)**: The largest component — needs splitting.
- **`LoginSignup.tsx` (16KB)**: Moderately large — consider separating Login and Signup forms.

### Broken Routes
- `/directory` has no index page — only `/directory/[slug]` exists. Clicking "Business Directory" in footer leads to empty route.

### State Management Issues
- Using React Context for auth only — no global state management. Each page independently fetches data with separate `useState`/`useEffect` patterns.
- No caching strategy: repeated navigation to the same page triggers fresh API calls every time.

---

## 9. Security Audit

| Check | Status | Details |
|---|---|---|
| **Protected admin routes** | ✅ | Admin layout checks `isLogin` + role before rendering. Backend uses permission classes. |
| **Role-based access (backend)** | ✅ | 7 RBAC permission classes with proper role hierarchy. |
| **Role-based access (frontend)** | ⚠️ Partial | Admin layout checks roles, but individual admin pages don't double-check — rely entirely on the layout guard. |
| **Token handling** | ⚠️ Weak | Tokens stored in `localStorage` (XSS-vulnerable). No `httpOnly` cookie option. No auto-refresh. |
| **Exposed environment variables** | 🔴 **FAIL** | `.env` committed with insecure `SECRET_KEY`. `.env.local` committed with API keys (`COMMODITY_PRICE_API_KEY`, `WEATHERAPI_KEY`). |
| **Input validation** | ⚠️ Partial | Backend serializers validate; frontend has minimal validation (HTML `pattern` on phone, `required` attributes). No XSS sanitization on admin-submitted content. |
| **CSRF protection** | ✅ | CSRF token fetched before auth requests. Django CSRF middleware active. |
| **API authorization** | ✅ | All admin endpoints require auth + role permissions. Public endpoints appropriately open. |
| **Account lockout** | ⚠️ Implemented but NOT enforced | `LoginAttempt.is_locked()` exists but login view never calls it. |
| **Security headers (prod)** | ✅ | HSTS, X-Frame-Options DENY, Content-Type nosniff, cookie security — all configured for `DEBUG=False`. |
| **Sensitive data exposure** | ⚠️ | User phone numbers displayed in admin listings. No PII masking. |
| **`dangerouslySetInnerHTML`** | ⚠️ | Used in privacy page and news article rendering. `isomorphic-dompurify` is installed but verify it's used for all HTML rendering. |

---

## 10. Performance Audit

| Check | Status | Details |
|---|---|---|
| **SSR/SSG utilization** | ⚠️ Poor | Root page is `'use client'` — no SSR. Most pages are client-rendered. Only `add-listing` page has proper server-side metadata. |
| **Unnecessary re-rendering** | ⚠️ | `useEffect` with missing/broad dependencies in several components (e.g., `DashboardClient`'s `logout` in dependency array). |
| **Large files/components** | 🔴 | `BusinessProfile.tsx` (32KB), `BusinessListings.tsx` (24KB), `IndustryGrids.tsx` (23KB), `DashboardClient.tsx` (21KB) — all need splitting. |
| **Repeated API calls** | ⚠️ | No caching layer. Every component mount triggers fresh fetches. `MarketWeatherDashboard` fetches on every homepage load. |
| **Lazy loading** | 🔴 Missing | No `React.lazy()` or `next/dynamic` used anywhere. All components load synchronously. All homepage sections load at once (~15 components). |
| **Image optimization** | ⚠️ | Uses `<img>` tags instead of Next.js `<Image>` component. No lazy loading, no `srcset`, no format optimization (WebP/AVIF). |
| **Bundle size** | ⚠️ | External images from Unsplash loaded directly in `BlogSection`. `xlsx` package (108KB gzipped) installed but unused. |
| **Third-party fonts** | ⚠️ | Google Material Symbols loaded via `<link>` in `<head>` (render-blocking). Should use `next/font` or preload. |
| **Market ticker animation** | ✅ | Uses CSS animation with `prefers-reduced-motion` support. |

---

## 11. Code Quality Audit

### Folder Structure
| Assessment | Details |
|---|---|
| ✅ Good | Next.js App Router used correctly with route groups |
| ✅ Good | Backend organized by Django apps with clear boundaries |
| ⚠️ Concern | Old `jalgaonUi/` (Vite) codebase coexists — creates confusion |
| ⚠️ Concern | `components/` is flat — 25 files without subdirectory organization (except `admin/` and `ui/`) |
| ⚠️ Concern | `lib/` has only 1 file. No utils, hooks, or services directories. |

### Naming Consistency
| Assessment | Details |
|---|---|
| ✅ Good | Component names are PascalCase, consistent |
| ✅ Good | Backend follows Django conventions |
| ⚠️ Inconsistent | Mix of `.tsx` suffixes for both pages and components |
| ⚠️ Inconsistent | Some components named `*Client.tsx` while others are just `*.tsx` |

### Duplicate Code
| Issue | Details |
|---|---|
| 🔴 API fetch pattern | Every component has its own `const baseUrl = process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:8000'` + `localStorage.getItem('token')` + `fetch(...)` pattern. Repeated 30+ times. Should be a shared utility. |
| 🔴 Token refresh | Two separate token-refresh implementations in `AddEventClient.tsx` and `admin/events/categories/page.tsx`. Should be centralized. |
| ⚠️ Two footer components | `Footer.tsx` and `ui/footer.tsx` — duplicate purpose. |
| ⚠️ Two homepage pages | Root `/` and `/homepage` render similar content. |

### Unused Files
| File | Status |
|---|---|
| [demo.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/demo.tsx) | Dead code — only renders FooterSection |
| [mobile-dock-demo.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/components/mobile-dock-demo.tsx) | Never imported |
| [homepage/page.tsx](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/homepage/page.tsx) | Legacy page, likely superseded by root `/` |
| [/api/businesses/route.ts](file:///d:/jalgaonWeb/New-JalgaonUI/src/app/api/businesses/route.ts) | Mock API with hardcoded data — unused by main pages |
| [out.json](file:///d:/jalgaonWeb/New-JalgaonUI/out.json), [out.txt](file:///d:/jalgaonWeb/New-JalgaonUI/out.txt) | Debug/temp output files |
| [new_tourism_raw.html](file:///d:/jalgaonWeb/New-JalgaonUI/new_tourism_raw.html) | Raw HTML dump — should not be in source |
| [audit.py](file:///d:/jalgaonWeb/audit.py), [fix.py](file:///d:/jalgaonWeb/fix.py), [test_dashboard.py](file:///d:/jalgaonWeb/test_dashboard.py) | Root-level utility scripts — should be in a `scripts/` directory or removed |
| 10 empty backend apps | `blog`, `payments`, `notifications`, `dashboard`, `cms`, `media_lib`, `analytics`, `startups`, `clubs`, `tourism` |

### Clean Coding Practices
- **TypeScript usage**: Good overall, but `any` type used frequently (e.g., `data: any[]` in DashboardClient).
- **No custom hooks**: All logic inlined in components — should extract hooks like `useAuth()`, `useFetchWithAuth()`, `usePagination()`.
- **No API service layer**: No `services/` or `api/` folder with centralized API functions.

---

## 12. Final Priority Roadmap

### 🔴 High Priority — Must Fix Before Deployment

| # | Task | Effort |
|---|---|---|
| 1 | **Create `fetchWithAuth()` utility** with automatic token refresh + 401 redirect | 4 hours |
| 2 | **Fix exposed secrets**: Rotate API keys, add `.env` and `.env.local` to `.gitignore`, generate proper `SECRET_KEY` | 1 hour |
| 3 | **Add pagination UI** to all admin list pages (users, listings, news, events, jobs, claims, reports, ads, moderation) | 6 hours |
| 4 | **Implement password reset flow** (backend endpoint + frontend form) | 8 hours |
| 5 | **Fix duplicate Footer rendering** — unify Footer into root layout | 2 hours |
| 6 | **Enforce account lockout** — call `LoginAttempt.is_locked()` in login view | 1 hour |
| 7 | **Add custom 404 and error pages** (`not-found.tsx`, `error.tsx`) | 3 hours |
| 8 | **Configure `next.config.ts`** — add `images.remotePatterns` for backend domain | 30 min |

### 🟡 Medium Priority — Important Improvements After Core Fixes

| # | Task | Effort |
|---|---|---|
| 9 | **Add mobile hamburger menu** to Header for navigation | 4 hours |
| 10 | **Make admin panel mobile-responsive** (collapsible sidebar, responsive tables) | 8 hours |
| 11 | **Replace `<img>` with `<Image>`** from Next.js for performance | 6 hours |
| 12 | **Add lazy loading** for homepage sections via `next/dynamic` | 4 hours |
| 13 | **Build notifications system** (backend models + frontend bell icon) | 16 hours |
| 14 | **Implement OTP authentication** (backend + frontend flows) | 12 hours |
| 15 | **Add form validation** (client-side) to all submission forms | 6 hours |
| 16 | **Extract reusable hooks**: `useAuth()`, `usePagination()`, `useDebounce()` | 4 hours |
| 17 | **Create API service layer** in `lib/api.ts` | 4 hours |
| 18 | **Unify homepage** — remove `/homepage` route, keep only root `/` | 2 hours |
| 19 | **Connect NGO page to real API** — remove hardcoded `ngo_data.json` | 4 hours |
| 20 | **Connect Contact Form** to a backend endpoint | 3 hours |
| 21 | **Add skeleton loading** screens for better UX | 6 hours |
| 22 | **Build Tourism backend** (models, serializers, views) | 8 hours |
| 23 | **Move homepage to SSR** — remove `'use client'` from root page, use server components | 6 hours |

### 🟢 Low Priority — Nice-to-Have Improvements

| # | Task | Effort |
|---|---|---|
| 24 | Clean up unused files (demo.tsx, mock API, raw HTML, etc.) | 1 hour |
| 25 | Remove 10 empty backend apps or mark as "planned" | 2 hours |
| 26 | Add admin table sorting | 6 hours |
| 27 | Add dark mode toggle with proper CSS variables | 4 hours |
| 28 | Build Blog module (backend + frontend) | 16 hours |
| 29 | Add Excel export for admin data | 4 hours |
| 30 | Implement scroll-to-top button | 1 hour |
| 31 | Add page transition animations | 3 hours |
| 32 | Split large components (BusinessProfile, BusinessListings, IndustryGrids) | 8 hours |
| 33 | Build Payments integration | 20+ hours |
| 34 | Build Startups/Clubs modules | 20+ hours |

---

## 13. Final Conclusion

### Current Project Completion: **~62%**

| Area | Completion |
|---|---|
| Backend API (core modules) | **~75%** — Auth, Directory, News, Events, Jobs, NGOs, Ads, Admin Panel all working. Missing: Blog, Tourism, Payments, Notifications, Analytics. |
| Frontend Pages | **~70%** — All major public pages + admin panel complete. Missing: Blog, About, Help, 404, error pages. |
| UI/UX Polish | **~55%** — Good design system, but missing mobile navigation, responsive admin, pagination, skeleton loading. |
| Security | **~60%** — RBAC solid, but exposed secrets, no password reset, token handling in localStorage, unforced lockout. |
| Performance | **~40%** — No SSR, no lazy loading, no Image optimization, large components. |
| Code Quality | **~55%** — Well-organized but heavy code duplication in API calls, no service layer, unused files. |

### Readiness Assessment

| Criterion | Ready? | Details |
|---|---|---|
| **Ready for Testing?** | ⚠️ **Partially** | Core flows (login, listings, admin CRUD) are testable. Token refresh issues may cause intermittent failures. |
| **Ready for Staging?** | ⚠️ **After High Priority fixes** | Fix the 8 high-priority items first (secrets, pagination, token refresh, 404 pages). |
| **Ready for Production?** | ❌ **No** | Needs all High + Medium priority fixes, security hardening, password reset, and performance optimization. |

### Recommended Next Steps (In Order)

1. **Immediately**: Rotate exposed API keys and add `.env` files to `.gitignore`
2. **This week**: Build `fetchWithAuth()` utility → add pagination → fix Footer duplication
3. **Next week**: Password reset flow → mobile navigation → form validation
4. **Week 3**: Admin responsiveness → lazy loading → SSR for homepage
5. **Week 4**: Notifications → OTP auth → API service layer
6. **Month 2**: Blog, Tourism, Payments, Analytics backends
