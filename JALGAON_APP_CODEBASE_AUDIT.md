# JALGAON.COM CODEBASE AUDIT & TECHNICAL INVENTORY

**Project Name:** Jalgaon.com City Digital Ecosystem Platform  
**Audit Purpose:** Factual Discovery and Audit for Flutter Mobile Application Architecture  
**Audit Scope:** Repository Structure, Frontends (`New-JalgaonUI`, `jalgaonUi`), Backend (`jalgaonApi`), Database Schema, APIs, RBAC, Admin Panel, Business Logic, and Mobile App Mapping.  
**Execution Date:** October 2026  

---

## 1. PROJECT OVERVIEW

Jalgaon.com is a city-scale digital ecosystem platform serving Jalgaon city and surrounding regions. The repository contains a full-stack digital directory, local news & media portal, job portal, event ticketing engine, startup & NGO directory, tourism guide, and business management system.

### Tech Stack Breakdown
* **Primary Frontend Application (`New-JalgaonUI`):** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React / Material Symbols, Leaflet / React-Leaflet, Recharts.
* **Legacy / Secondary Frontend Application (`jalgaonUi`):** Vite 8, React 18, React Router v6, Axios, Capacitor 6 (Android native shell configuration).
* **Backend Framework (`jalgaonApi`):** Django 5.0, Django REST Framework (DRF), SimpleJWT (JSON Web Token authentication with refresh token rotation), `drf-spectacular` (OpenAPI 3.0 / Swagger schema generation).
* **Database Engine:** SQLite (Local Development default: `db.sqlite3`), PostgreSQL (`django.db.backends.postgresql_psycopg2` for Production).
* **Authentication & Security:** Custom User Model (`apps.accounts.User`) with `phone_number` as the primary `USERNAME_FIELD`, OTP verification state, JWT bearer tokens, DRF Rate Throttling (100 req/min anon, 500 req/min user), LoginAttempt lockout logic (5 failed attempts per 15 min window).
* **Payment & Ticketing Engine:** Razorpay payment integration, 2D Canvas seat selection, seat lock/hold timers (6 minutes default), HMAC-SHA256 signed QR code ticket verification.
* **Integrations:** YouTube Data API v3 (Jalgaon Glimpse video channel), Razorpay API, SMTP Email Gateway, Capacitor Android bridge.

---

## 2. REPOSITORY STRUCTURE

```
d:\simplesphere\jalgaonWeb\
├── .agents/                      # Agent customizations & local hooks
├── deploy/                       # Nginx & Gunicorn deployment scripts
│   └── nginx/
│       └── jalgaon-api.conf      # Reverse proxy & SSL termination configuration
├── documents/                    # Project requirement documents & specifications
├── jalgaonApi/                   # Django REST Framework Backend Root
│   ├── api/                      # Legacy API router and v1 endpoints
│   ├── apps/                     # 25 Modular Django Applications
│   │   ├── accounts/             # Custom User model, Auth, OTP, Login Attempts
│   │   ├── admin_panel/          # Platform Admin API views & stats
│   │   ├── ads/                  # Banners, Slot Ads, Floating Video Ads
│   │   ├── analytics/            # Analytics events & daily reporting
│   │   ├── audit/                # Action audit logging
│   │   ├── blog/                 # Editorial Blog posts, tags, comments
│   │   ├── clubs/                # Local clubs, activities, member rosters
│   │   ├── cms/                  # Static content & site pages
│   │   ├── dashboard/            # User/Business dashboard endpoints
│   │   ├── directory/            # Shop listings, categories, claims, reports
│   │   ├── events/               # Public events & festival calendar
│   │   ├── finance/              # Local business financial metrics/APIs
│   │   ├── jalgaon_glimpse/      # YouTube API video stream service
│   │   ├── jobs/                 # Job listings, job applications, saved jobs
│   │   ├── media_lib/            # Media library & SEO Image alt tags
│   │   ├── news/                 # News articles, breaking news, news comments
│   │   ├── ngo/                  # NGO profiles & social service categories
│   │   ├── notifications/        # User in-app notifications
│   │   ├── payments/             # Gateway transaction logs
│   │   ├── reviews/              # Shop ratings and text reviews
│   │   ├── search/               # Multi-entity search & autocomplete
│   │   ├── startups/             # Local startup profiles & founder rosters
│   │   ├── ticketing/            # Venues, Seat Maps, Show Seats, QR Tickets
│   │   └── tourism/              # Tourist spots & historical landmarks
│   ├── core/                     # Core RBAC permissions & global utilities
│   ├── jalgaonApi/               # Django project settings (`settings.py`, `urls.py`)
│   ├── db.sqlite3                # Local SQLite database instance
│   └── manage.py                 # Django CLI entrypoint
├── jalgaonUi/                    # Legacy React + Vite App (Capacitor Android build)
│   ├── src/
│   │   ├── components/           # UI components & forms
│   │   ├── pages/                # React Router v6 pages (39 pages + admin)
│   │   └── main.jsx              # App router entry point
│   ├── package.json
│   └── vite.config.js
├── New-JalgaonUI/                # Active Next.js 16 App Router Web Application
│   ├── src/
│   │   ├── app/                  # Next.js App Router (97 page & API route folders)
│   │   │   ├── admin/            # Admin Panel dashboard & submodules
│   │   │   ├── account/          # User account & dashboard views
│   │   │   ├── category/         # Directory browsing pages
│   │   │   ├── events/           # Events & seat selection checkout
│   │   │   ├── jobs/             # Job portal pages
│   │   │   ├── news/             # News portal pages
│   │   │   ├── startups/         # Startup directory pages
│   │   │   ├── clubs/            # Clubs portal pages
│   │   │   ├── ngo/              # NGO directory pages
│   │   │   ├── tourism/          # Tourism guide
│   │   │   ├── jalgaon-glimpse/  # YouTube video gallery
│   │   │   ├── tickets/          # QR ticket pass view
│   │   │   └── [...]             # Spam handler routes (HTTP 410 Gone)
│   │   ├── components/           # Shared UI components, admin sidebar, ticketing
│   │   ├── context/              # AuthContext & state providers
│   │   └── lib/                  # API client, search utils, spam handler
│   └── package.json
├── stitch_screens/               # UI design mockups & reference screenshots
├── api_audit_report.md           # API connection checklist
├── implementation_plan.md        # UI hero implementation specification
└── JALGAON_APP_CODEBASE_AUDIT.md # THIS AUDIT DOCUMENT
```

---

## 3. COMPLETE WEBSITE PAGE INVENTORY

Every user-facing page implemented across `New-JalgaonUI` and `jalgaonUi`:

| Page Name | Path / Route | Frontend File | Purpose | Auth Required | Role Required | APIs Used |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **Homepage** | `/` | `New-JalgaonUI/src/app/page.tsx` | Main portal landing, search bar, banner carousel, categories, news snippet, trending listings, glimpses | NO | Guest / Public | `/api/v1/banners/active/`, `/api/v1/ads/by-slot/`, `/api/v1/listings/trending/`, `/api/v1/news/trending/` |
| **Category Listings** | `/category/[categorySlug]` | `New-JalgaonUI/src/app/category/[categorySlug]/page.tsx` | Filtered list of businesses under a main category | NO | Guest / Public | `/api/v1/listings/?category=...` |
| **Business Detail** | `/category/[categorySlug]/[slug]` | `New-JalgaonUI/src/app/category/[categorySlug]/[slug]/page.tsx` | Complete business profile, photos, contact numbers, map, reviews, claim button | NO | Guest / Public | `/api/v1/listings/{slug}/`, `/api/v1/listings/{slug}/reviews/` |
| **Add Listing** | `/add-listing` | `New-JalgaonUI/src/app/add-listing/page.tsx` | Submission form for business owners to list a business | YES | Registered User | `/api/v1/listings/create/` |
| **Edit Listing** | `/edit-listing/[slug]` | `New-JalgaonUI/src/app/edit-listing/[slug]/page.tsx` | Business owner update interface for their listing | YES | Business Owner / Admin | `/api/v1/listings/{slug}/update/` |
| **Global Search** | `/search` | `New-JalgaonUI/src/app/search/page.tsx` | Search results page for directory, news, events, jobs | NO | Guest / Public | `/api/v1/search/` |
| **News Portal** | `/news` | `New-JalgaonUI/src/app/news/page.tsx` | News portal feed with breaking news ticker & categories | NO | Guest / Public | `/api/v1/news/`, `/api/v1/news/breaking/`, `/api/v1/news/trending/` |
| **News Article Detail** | `/news/[slug]` | `New-JalgaonUI/src/app/news/[slug]/page.tsx` | News article reader, share links, comments section | NO | Guest / Public | `/api/v1/news/{slug}/`, `/api/v1/news/{slug}/comments/` |
| **Events Portal** | `/events` | `New-JalgaonUI/src/app/events/page.tsx` | Upcoming city events, cultural shows, booking links | NO | Guest / Public | `/api/v1/events/` |
| **Event Detail** | `/events/[slug]` | `New-JalgaonUI/src/app/events/[slug]/page.tsx` | Detailed event page with showtimes & venue info | NO | Guest / Public | `/api/v1/events/{slug}/` |
| **Seat Selection** | `/events/[slug]/seat-selection` | `New-JalgaonUI/src/app/events/[slug]/seat-selection/page.tsx` | Interactive 2D venue seat map picker & price tier calculation | YES | Registered User | `/api/v1/tickets/shows/{id}/seat-map/`, `/api/v1/tickets/hold-seats/` |
| **Checkout** | `/checkout` | `New-JalgaonUI/src/app/checkout/page.tsx` | Seat hold countdown timer, recipient form, Razorpay trigger | YES | Registered User | `/api/v1/tickets/bookings/create/`, `/api/v1/tickets/payments/verify/` |
| **Booking Confirmed**| `/booking/confirmed` | `New-JalgaonUI/src/app/booking/confirmed/page.tsx` | Order summary & ticket download/view pass button | YES | Registered User | `/api/v1/tickets/bookings/{id}/` |
| **Digital Pass / Ticket**| `/tickets/[ticket_code]`| `New-JalgaonUI/src/app/tickets/[ticket_code]/page.tsx` | Cryptographic QR code ticket pass for gate scanning | YES | Registered User | `/api/v1/tickets/pass/{ticket_code}/` |
| **Jobs Portal** | `/jobs` | `New-JalgaonUI/src/app/jobs/page.tsx` | Job board with salary filter, experience, categories | NO | Guest / Public | `/api/v1/jobs/` |
| **Job Detail** | `/jobs/[slug]` | `New-JalgaonUI/src/app/jobs/[slug]/page.tsx` | Full job description, company details, apply modal | NO | Guest / Public | `/api/v1/jobs/{slug}/` |
| **Add Job** | `/add-job` | `New-JalgaonUI/src/app/add-job/page.tsx` | Form for employers to post job vacancies | YES | Registered User | `/api/v1/jobs/submit/` |
| **Startups Directory** | `/startups` | `New-JalgaonUI/src/app/startups/page.tsx` | Showcase of local startups & incubation details | NO | Guest / Public | `/api/v1/startups/` |
| **Startup Detail** | `/startups/[slug]` | `New-JalgaonUI/src/app/startups/[slug]/page.tsx` | Startup story, founders, funding status, link | NO | Guest / Public | `/api/v1/startups/{slug}/` |
| **Add Startup** | `/add-startup` | `New-JalgaonUI/src/app/add-startup/page.tsx` | Startup submission form | YES | Registered User | `/api/v1/startups/` |
| **Clubs Directory** | `/clubs` | `New-JalgaonUI/src/app/clubs/page.tsx` | Social, sports & business clubs directory | NO | Guest / Public | `/api/v1/clubs/` |
| **Club Detail** | `/clubs/[slug]` | `New-JalgaonUI/src/app/clubs/[slug]/page.tsx` | Club details, member roster, activities | NO | Guest / Public | `/api/v1/clubs/{slug}/` |
| **Add Club** | `/add-club` | `New-JalgaonUI/src/app/add-club/page.tsx` | Club registration form | YES | Registered User | `/api/v1/clubs/` |
| **NGO Directory** | `/ngo` | `New-JalgaonUI/src/app/ngo/page.tsx` | Non-profit organizations & cause directory | NO | Guest / Public | `/api/v1/ngo/` |
| **Add NGO** | `/add-ngo` | `New-JalgaonUI/src/app/add-ngo/page.tsx` | NGO submission form | YES | Registered User | `/api/v1/ngo/submit/` |
| **Tourism Guide** | `/tourism` | `New-JalgaonUI/src/app/tourism/page.tsx` | Tourist spots, historical places, Ajanta gateway info | NO | Guest / Public | `/api/v1/tourism/` (Static/CMS) |
| **Jalgaon Glimpse** | `/jalgaon-glimpse` | `New-JalgaonUI/src/app/jalgaon-glimpse/page.tsx` | Video gallery fed dynamically by YouTube Data API v3 | NO | Guest / Public | `/api/v1/jalgaon-glimpse/videos/`, `/api/v1/jalgaon-glimpse/channel/` |
| **Glimpse Video Player**| `/jalgaon-glimpse/[id]`| `New-JalgaonUI/src/app/jalgaon-glimpse/[id]/page.tsx` | Embedded video player page | NO | Guest / Public | `/api/v1/jalgaon-glimpse/videos/{id}/` |
| **Blog Feed** | `/blog` | `New-JalgaonUI/src/app/blog/page.tsx` | Official blog articles feed | NO | Guest / Public | `/api/v1/blog/` |
| **Blog Post Reader** | `/blog/[slug]` | `New-JalgaonUI/src/app/blog/[slug]/page.tsx` | Blog reading view with comment section | NO | Guest / Public | `/api/v1/blog/{slug}/` |
| **Advertise Info** | `/advertise` | `New-JalgaonUI/src/app/advertise/page.tsx` | Advertising plans, banner slot pricing, inquiry form | NO | Guest / Public | `/api/v1/ads/by-slot/` |
| **User Account** | `/account` | `New-JalgaonUI/src/app/account/page.tsx` | User profile dashboard (Overview, My Listings, My Events, My Jobs, My Clubs, My NGOs, Applications, Saved Items, Notifications, Settings) | YES | Registered User | `/api/v1/auth/user/`, `/api/v1/listings/user/my-listings/`, etc. |
| **Login / Register Modal**| Global Modal | `New-JalgaonUI/src/components/LoginSignup.tsx` | Auth modal with Phone + Password login and OTP verification step | NO | Guest / Public | `/api/v1/auth/login/`, `/api/v1/auth/register/` |
| **Forgot Password** | `/forgot-password` | `New-JalgaonUI/src/app/forgot-password/page.tsx` | Phone number OTP password recovery request | NO | Guest / Public | `/api/v1/auth/forgot-password/` |
| **Reset Password** | `/reset-password` | `New-JalgaonUI/src/app/reset-password/page.tsx` | New password creation page after OTP verification | NO | Guest / Public | `/api/v1/auth/reset-password/` |
| **Admin Dashboard** | `/admin` | `New-JalgaonUI/src/app/admin/page.tsx` | Main platform administration portal & stats widgets | YES | Admin / Staff | `/api/v1/admin-panel/stats/` |
| **Privacy Policy** | `/privacy` | `New-JalgaonUI/src/app/privacy/page.tsx` | Legal privacy terms | NO | Guest / Public | Static |
| **Terms of Service** | `/terms` | `New-JalgaonUI/src/app/terms/page.tsx` | Legal platform usage terms | NO | Guest / Public | Static |

---

## 4. ROUTE INVENTORY

### A. Next.js App Router Routes (`New-JalgaonUI`)

| # | Route | Page Component | Public/Auth | Role | Purpose | API Used |
|---|:---|:---|:---:|:---|:---|:---|
| 1 | `/` | `src/app/page.tsx` | Public | Guest | Homepage landing | Banners, Ads, Trending |
| 2 | `/category/[categorySlug]` | `src/app/category/[categorySlug]/page.tsx` | Public | Guest | Category business list | `/api/v1/listings/` |
| 3 | `/category/[categorySlug]/[slug]` | `src/app/category/.../[slug]/page.tsx` | Public | Guest | Business detail profile | `/api/v1/listings/{slug}/` |
| 4 | `/add-listing` | `src/app/add-listing/page.tsx` | Auth | Registered User | Submit new shop listing | `/api/v1/listings/create/` |
| 5 | `/edit-listing/[slug]` | `src/app/edit-listing/[slug]/page.tsx` | Auth | Owner / Admin | Modify shop listing | `/api/v1/listings/{slug}/update/` |
| 6 | `/search` | `src/app/search/page.tsx` | Public | Guest | Platform global search | `/api/v1/search/` |
| 7 | `/news` | `src/app/news/page.tsx` | Public | Guest | News listing portal | `/api/v1/news/` |
| 8 | `/news/[slug]` | `src/app/news/[slug]/page.tsx` | Public | Guest | News article reader | `/api/v1/news/{slug}/` |
| 9 | `/events` | `src/app/events/page.tsx` | Public | Guest | Event portal feed | `/api/v1/events/` |
| 10 | `/events/[slug]` | `src/app/events/[slug]/page.tsx` | Public | Guest | Event detail overview | `/api/v1/events/{slug}/` |
| 11 | `/events/[slug]/seat-selection` | `src/app/events/.../seat-selection/page.tsx` | Auth | Registered User | 2D seat map selection | `/api/v1/tickets/shows/{id}/seat-map/` |
| 12 | `/checkout` | `src/app/checkout/page.tsx` | Auth | Registered User | Ticket checkout & payment | `/api/v1/tickets/bookings/create/` |
| 13 | `/booking/confirmed` | `src/app/booking/confirmed/page.tsx` | Auth | Registered User | Order confirmation screen | `/api/v1/tickets/bookings/{id}/` |
| 14 | `/tickets/[ticket_code]` | `src/app/tickets/[ticket_code]/page.tsx` | Auth | Registered User | Digital ticket QR pass | `/api/v1/tickets/pass/{ticket_code}/` |
| 15 | `/jobs` | `src/app/jobs/page.tsx` | Public | Guest | Job vacancy listings | `/api/v1/jobs/` |
| 16 | `/jobs/[slug]` | `src/app/jobs/[slug]/page.tsx` | Public | Guest | Job detail overview | `/api/v1/jobs/{slug}/` |
| 17 | `/add-job` | `src/app/add-job/page.tsx` | Auth | Employer | Submit job posting | `/api/v1/jobs/submit/` |
| 18 | `/startups` | `src/app/startups/page.tsx` | Public | Guest | Startup ecosystem directory | `/api/v1/startups/` |
| 19 | `/startups/[slug]` | `src/app/startups/[slug]/page.tsx` | Public | Guest | Startup profile reader | `/api/v1/startups/{slug}/` |
| 20 | `/add-startup` | `src/app/add-startup/page.tsx` | Auth | Registered User | Register startup profile | `/api/v1/startups/` |
| 21 | `/clubs` | `src/app/clubs/page.tsx` | Public | Guest | Local clubs directory | `/api/v1/clubs/` |
| 22 | `/clubs/[slug]` | `src/app/clubs/[slug]/page.tsx` | Public | Guest | Club details & roster | `/api/v1/clubs/{slug}/` |
| 23 | `/add-club` | `src/app/add-club/page.tsx` | Auth | Registered User | Register local club | `/api/v1/clubs/` |
| 24 | `/ngo` | `src/app/ngo/page.tsx` | Public | Guest | NGO non-profit directory | `/api/v1/ngo/` |
| 25 | `/add-ngo` | `src/app/add-ngo/page.tsx` | Auth | Registered User | Submit NGO profile | `/api/v1/ngo/submit/` |
| 26 | `/tourism` | `src/app/tourism/page.tsx` | Public | Guest | Tourism & landmarks | `/api/v1/tourism/` |
| 27 | `/jalgaon-glimpse` | `src/app/jalgaon-glimpse/page.tsx` | Public | Guest | YouTube video channel gallery | `/api/v1/jalgaon-glimpse/videos/` |
| 28 | `/jalgaon-glimpse/[id]` | `src/app/jalgaon-glimpse/[id]/page.tsx` | Public | Guest | YouTube video player | `/api/v1/jalgaon-glimpse/videos/{id}/` |
| 29 | `/blog` | `src/app/blog/page.tsx` | Public | Guest | Blog post feed | `/api/v1/blog/` |
| 30 | `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | Public | Guest | Blog post reader | `/api/v1/blog/{slug}/` |
| 31 | `/advertise` | `src/app/advertise/page.tsx` | Public | Guest | Advertising plans info | `/api/v1/ads/by-slot/` |
| 32 | `/account/*` | `src/app/account/layout.tsx` | Auth | Registered User | User dashboard views | `/api/v1/auth/user/`, etc. |
| 33 | `/admin/*` | `src/app/admin/layout.tsx` | Auth | Staff / Admin | Platform admin panel | `/api/v1/admin-panel/*` |
| 34 | `/forgot-password` | `src/app/forgot-password/page.tsx` | Public | Guest | Account recovery OTP | `/api/v1/auth/forgot-password/` |
| 35 | `/reset-password` | `src/app/reset-password/page.tsx` | Public | Guest | Reset password form | `/api/v1/auth/reset-password/` |
| 36 | `/privacy` | `src/app/privacy/page.tsx` | Public | Guest | Privacy Policy | Static |
| 37 | `/terms` | `src/app/terms/page.tsx` | Public | Guest | Terms of Service | Static |

### B. Legacy Spam & Catch-All Routes (HTTP 410 Gone Handler)
The repository contains 60+ route directories (e.g., `/188bet`, `/1xbet`, `/baccarat`, `/bet365`, `/casino`, `/slot`, `/sportsbook`, `/ufabet`, `/w88`, etc.) that export a custom Next.js handler (`gone()` in `src/lib/spam-handler.ts`). These return an HTTP 410 Gone response to clear legacy SEO spam indexing requests.

---

## 5. FEATURE INVENTORY

### 1. Business Directory & Profiles
* **Purpose:** List local Jalgaon businesses categorized by industry with complete contact details, maps, hours, and photos.
* **Frontend Component:** `BusinessListings.tsx`, `BusinessProfile.tsx`.
* **Backend Models:** `ShopListing`, `MainCategory`, `SubCategory`, `BusinessPhoto`.
* **API Endpoints:** `GET /api/v1/listings/`, `GET /api/v1/listings/{slug}/`, `POST /api/v1/listings/create/`.
* **Business Rules:** Listings created by users require admin/moderator approval (`status='pending'` $\rightarrow$ `status='approved'`).

### 2. Search & Autocomplete
* **Purpose:** Instant search across shop titles, keywords, categories, news, and jobs with typewriter animated hero search bar.
* **Frontend Component:** `SearchBar.tsx`, `HomeSearchSection.tsx`.
* **Backend Models:** `SearchQuery`, `SearchSynonym`.
* **API Endpoints:** `GET /api/v1/search/`, `GET /api/v1/search/autocomplete/`.
* **Business Rules:** Log user search queries for analytics; handle search synonyms dynamically.

### 3. Event Ticketing System
* **Purpose:** End-to-end ticketing for local events, dramas, and concerts with 2D venue seat map selection, seat holds, checkout, and QR pass creation.
* **Frontend Components:** `SeatMapCanvas2D.tsx`, `HoldCountdownTimer.tsx`, `OrderSummaryCard.tsx`, `CryptographicQrContainer.tsx`.
* **Backend Models:** `Venue`, `VenueSection`, `VenueRow`, `VenueSeat`, `EventShow`, `TicketCategory`, `ShowSeat`, `Booking`, `Payment`, `Ticket`, `TicketScanLog`.
* **API Endpoints:** `GET /api/v1/tickets/shows/{id}/seat-map/`, `POST /api/v1/tickets/hold-seats/`, `POST /api/v1/tickets/bookings/create/`, `POST /api/v1/tickets/payments/verify/`, `GET /api/v1/tickets/pass/{ticket_code}/`, `POST /api/v1/tickets/scan/`.
* **Business Rules:** Seat holds automatically expire after 6 minutes (`SEAT_HOLD_MINUTES = 6`). Ticket QR payloads are signed with HMAC-SHA256 secret (`TICKET_QR_SECRET`). Gate staff users (`role='gate_staff'`) can scan QR passes.

### 4. News Portal & Breaking News
* **Purpose:** Local news feed with breaking news ticker, categories, and reader comments.
* **Frontend Components:** `BreakingNews.tsx`, `LatestNews.tsx`.
* **Backend Models:** `NewsArticle`, `NewsCategory`, `NewsComment`.
* **API Endpoints:** `GET /api/v1/news/`, `GET /api/v1/news/breaking/`, `GET /api/v1/news/trending/`, `GET /api/v1/news/{slug}/`.

### 5. Job Portal
* **Purpose:** Employer job postings and job seeker application submissions.
* **Frontend Component:** `JobOpenings.tsx`, `JobApplyModal.tsx`.
* **Backend Models:** `Job`, `JobCategory`, `JobApplication`, `SavedJob`.
* **API Endpoints:** `GET /api/v1/jobs/`, `POST /api/v1/jobs/submit/`, `POST /api/v1/jobs/{slug}/apply/`.

### 6. Startups & Incubation Directory
* **Purpose:** Display local startups, founder bios, industry classification, and incubation details.
* **Frontend Component:** `FeaturedStartups.tsx`, `IndustryGrids.tsx`.
* **Backend Models:** `Startup`, `StartupIndustry`, `Founder`.
* **API Endpoints:** `GET /api/v1/startups/`, `POST /api/v1/startups/`.

### 7. Local Clubs & NGOs Directories
* **Purpose:** Showcase community clubs, rotary/lion activities, member rosters, and non-profit social organizations.
* **Frontend Components:** `NgoSpotlight.tsx`, `LocalWonders.tsx`.
* **Backend Models:** `Club`, `ClubCategory`, `ClubActivity`, `ClubMember`, `NGO`, `NGOCategory`.
* **API Endpoints:** `GET /api/v1/clubs/`, `GET /api/v1/ngo/`.

### 8. Jalgaon Glimpse (YouTube API Service)
* **Purpose:** Embedded video gallery streaming high-definition videos from Jalgaon.com's official YouTube channel.
* **Frontend Component:** `JalgaonGlimpse.tsx`, `GlimpsePortal.tsx`.
* **Backend Service:** `apps.jalgaon_glimpse.services.YouTubeService` with LocMemCache (30-min TTL).
* **API Endpoints:** `GET /api/v1/jalgaon-glimpse/videos/`, `GET /api/v1/jalgaon-glimpse/videos/{id}/`, `GET /api/v1/jalgaon-glimpse/channel/`.

### 9. Banners, Carousel Ads & Floating Video Ads
* **Purpose:** Monetization ad slots across hero banner, side banners, listing pages, and persistent floating video player.
* **Frontend Components:** `BannerCarousel.tsx`, `CarouselAds.tsx`, `FloatingVideoAd.tsx`.
* **Backend Models:** `HomeCrouselAds`, `BannerAds`, `AdSlot`, `AdsListing`, `FloatingVideoAdvertisement`, `Banner`.
* **API Endpoints:** `GET /api/v1/banners/active/`, `GET /api/v1/ads/by-slot/`, `POST /api/v1/ads/{ad_id}/track-impression/`, `POST /api/v1/ads/{ad_id}/track-click/`.

### 10. Business Claims & Moderation Reports
* **Purpose:** Allow real business owners to claim an existing listing and public users to report inappropriate/incorrect listings.
* **Frontend Components:** `BusinessClaimModal.tsx`, `BusinessReportModal.tsx`.
* **Backend Models:** `BusinessClaim`, `BusinessReport`.
* **API Endpoints:** `POST /api/v1/listings/{slug}/claim/`, `POST /api/v1/listings/{slug}/report/`.

---

## 6. USER ROLES & PERMISSION MATRIX

### Defined Roles in `apps.accounts.models.User`

The system defines **13 distinct user roles**:

1. `super_admin`: Platform owner with unrestricted access (`is_staff=True`, `is_superuser=True`).
2. `admin`: Administrator managing platform operations (`is_staff=True`).
3. `content_manager`: Manages categories, directory listings, articles, blogs (`is_staff=True`).
4. `news_editor`: Creates and publishes news articles & blogs (`is_staff=True`).
5. `seo_manager`: Manages SEO meta image alts & view analytics (`is_staff=True`).
6. `moderator`: Reviews submitted listings, reviews, claims, and reports (`is_staff=True`).
7. `support`: Support executive viewing user queries and feedback (`is_staff=True`).
8. `advertiser`: Business advertiser managing banner slots (`is_staff=False`).
9. `business_owner`: Owner managing their owned shop listings (`is_staff=False`).
10. `event_manager`: Event organizer managing event shows, ticket categories, and pricing (`is_staff=True`).
11. `gate_staff`: Venue entrance ticket scanner (`is_staff=False`).
12. `registered_user`: Standard authenticated end user (`is_staff=False`).
13. `guest`: Unauthenticated visitor (`is_staff=False`).

### DRF Permission Classes (`core/permissions.py`)

* `IsSuperAdmin`: Only `super_admin` or `is_superuser=True`.
* `IsAdminRole`: Roles `super_admin`, `admin`.
* `IsContentManager`: Roles `super_admin`, `admin`, `content_manager`.
* `IsModerator`: Roles `super_admin`, `admin`, `content_manager`, `moderator`.
* `IsNewsEditor`: Roles `super_admin`, `admin`, `content_manager`, `news_editor`.
* `IsStaffRole`: Any staff-level role (`super_admin`, `admin`, `content_manager`, `news_editor`, `seo_manager`, `moderator`, `support`).
* `IsBusinessOwnerOrAdmin`: Roles `super_admin`, `admin`, `content_manager`, `moderator`, `business_owner`.
* `CanSubmitJob`: Roles `super_admin`, `admin`, `content_manager`, `news_editor`, `business_owner`, `registered_user`.
* `CanManageJobs`: Roles `super_admin`, `admin`, `content_manager`, `moderator`.

---

## 7. ADMIN PANEL INVENTORY

The platform features an extensive multi-module Admin Panel accessed via `/admin` in Next.js. Access is enforced on both frontend (`AdminSidebar.tsx` visibility filters) and backend (DRF permission classes).

| Module Name | Route | Authorized Roles | CRUD Operations | Primary Backend Endpoint |
|:---|:---|:---|:---|:---|
| **Admin Dashboard** | `/admin` | Admin, Staff | View metrics & summary cards | `GET /api/v1/admin-panel/stats/` |
| **User Management** | `/admin/users` | Super Admin, Admin | View users, change user roles, deactivate users | `GET/PATCH /api/v1/admin-panel/users/` |
| **Listings Management** | `/admin/listings` | Admin, Content Mgr, Moderator | View, approve, reject, feature listings | `GET/PATCH /api/v1/admin-panel/listings/` |
| **Trending Listings** | `/admin/trending` | Admin, Content Mgr, Moderator | Manage featured/trending shops | `POST /api/v1/admin-panel/listings/{id}/trending/` |
| **Ads Moderation** | `/admin/ads` | Admin, Content Mgr, Moderator | Moderate user ad submissions | `GET/PATCH /api/v1/admin-panel/ads/` |
| **Banner Management** | `/admin/banners` | Super Admin, Admin | Create, edit, activate banner carousels | `GET/POST /api/v1/banners/` |
| **Floating Video Ad** | `/admin/floating-video-ad` | Super Admin, Admin | Manage persistent floating video ads | `GET/POST /api/v1/ads/floating/` |
| **Categories** | `/admin/categories` | Admin, Content Mgr | Add, edit, reorder main & sub-categories | `GET/POST/PATCH /api/v1/admin-panel/categories/` |
| **News Module** | `/admin/news` | Admin, Content Mgr, News Editor | Create, edit, publish news articles & categories | `GET/POST/PATCH /api/v1/news/admin/articles/` |
| **News Comments** | `/admin/news/comments` | Admin, Content Mgr, Moderator | Moderate and delete user news comments | `GET/DELETE /api/v1/news/admin/comments/` |
| **Blog Module** | `/admin/blog` | Admin, Content Mgr, News Editor | Create, edit, publish blog posts & categories | `GET/POST/PATCH /api/v1/blog/` |
| **Job Portal** | `/admin/jobs` | Admin, Content Mgr, Moderator | Manage job postings, applications & categories | `GET/PATCH /api/v1/jobs/admin/jobs/` |
| **Events Management** | `/admin/events` | Admin, Content Mgr, Moderator | Approve event submissions, feature events | `GET/PATCH /api/v1/events/admin/events/` |
| **NGO Management** | `/admin/ngos` | Admin, Content Mgr, Moderator | Manage NGO directory submissions | `GET/PATCH /api/v1/ngo/admin/ngos/` |
| **Startups Portal** | `/admin/startups` | Admin, Content Mgr, Moderator | Manage startup directory & industries | `GET/POST/PATCH /api/v1/startups/` |
| **Clubs Portal** | `/admin/clubs` | Admin, Content Mgr, Moderator | Manage club directory & categories | `GET/POST/PATCH /api/v1/clubs/` |
| **Moderation Queue** | `/admin/moderation` | Admin, Moderator, Content Mgr | Review pending user content | `GET/POST /api/v1/admin-panel/moderation/` |
| **Business Claims** | `/admin/claims` | Admin, Moderator | Approve or reject owner claim requests | `GET/POST /api/v1/admin-panel/business-claims/` |
| **Business Reports** | `/admin/reports` | Admin, Moderator | Resolve reported listing violations | `GET/POST /api/v1/admin-panel/business-reports/` |
| **Analytics Dashboard**| `/admin/analytics` | Admin, Content Mgr, SEO, Support | View platform visit counts, impressions, clicks | `GET /api/v1/analytics/` |

---

## 8. BACKEND APPS INVENTORY

Summary of the 25 Django apps residing in `jalgaonApi/apps/`:

1. `accounts`: User authentication, JWT serializers, OTP verification, user profile, login lockout tracker.
2. `admin_panel`: Admin API views, aggregated stats, user role switching.
3. `ads`: Banners, ad slot management, floating video advertisement model and click/impression tracking.
4. `analytics`: Track analytics events (`AnalyticsEvent`) and aggregate `DailyReport`.
5. `audit`: Platform action audit logging (`AuditLog`).
6. `blog`: Editorial blog posts (`BlogPost`), categories (`BlogCategory`), tags (`BlogTag`), comments (`BlogComment`).
7. `clubs`: Local clubs (`Club`), club categories (`ClubCategory`), activities (`ClubActivity`), member roster (`ClubMember`).
8. `cms`: Static site pages & content blocks.
9. `dashboard`: Dashboard overview data endpoints for registered users & business owners.
10. `directory`: Main category (`MainCategory`), sub-category (`SubCategory`), shop listings (`ShopListing`), business photos (`BusinessPhoto`), business claims (`BusinessClaim`), business reports (`BusinessReport`).
11. `events`: Public events (`Event`), event categories (`EventCategory`), show schedules.
12. `finance`: Local financial data metrics.
13. `jalgaon_glimpse`: YouTube Data API v3 service layer (`YouTubeService`), caching helper, channel and video list views.
14. `jobs`: Job vacancies (`Job`), job categories (`JobCategory`), application submissions (`JobApplication`), saved jobs (`SavedJob`).
15. `media_lib`: Media library & SEO image alt tags (`SEOImageAlt`).
16. `news`: News articles (`NewsArticle`), categories (`NewsCategory`), tags (`NewsTag`), breaking news (`ActiveArticle`), news comments (`NewsComment`).
17. `ngo`: NGO directory (`NGO`), NGO categories (`NGOCategory`).
18. `notifications`: In-app notification center (`Notification`).
19. `payments`: Payment gateway transaction logs and Razorpay webhooks.
20. `reviews`: Business reviews and ratings (`ShopReview`).
21. `search`: Search query tracking (`SearchQuery`), search synonyms (`SearchSynonym`), multi-model search view.
22. `startups`: Startup directory (`Startup`), startup industries (`StartupIndustry`), founders (`Founder`).
23. `ticketing`: Physical venues (`Venue`, `VenueSection`, `VenueRow`, `VenueSeat`), event show inventory (`EventShow`, `TicketCategory`, `ShowSeat`), checkout booking (`Booking`, `BookingItem`, `Payment`), ticket generation (`Ticket`), QR gate scanning (`TicketScanLog`), marketing holds (`MarketingHold`).
24. `tourism`: Tourist places directory endpoints.
25. `core` & `api`: Base permission definitions, custom middleware, OpenAPI schema configuration.

---

## 9. API ENDPOINT INVENTORY

Core API endpoints organized by domain:

### Authentication (`/api/v1/auth/`)
* `POST /api/v1/auth/register/` - Phone number + password registration (triggers OTP).
* `POST /api/v1/auth/verify-otp/` - Verify 6-digit OTP code to set `is_verified=True`.
* `POST /api/v1/auth/login/` - Login with phone number & password. Returns JWT access & refresh tokens.
* `POST /api/v1/auth/token/refresh/` - Rotate refresh token to obtain a new access token.
* `GET /api/v1/auth/user/` - Fetch current authenticated user profile & role.
* `POST /api/v1/auth/logout/` - Blacklist current refresh token.
* `POST /api/v1/auth/forgot-password/` - Trigger OTP for password reset.
* `POST /api/v1/auth/reset-password/` - Set new password with verified OTP reset token.

### Directory & Listings (`/api/v1/listings/`)
* `GET /api/v1/listings/` - Search/filter directory listings by category, query, or city area.
* `GET /api/v1/listings/categories/` - Retrieve nested list of main categories & sub-categories.
* `GET /api/v1/listings/trending/` - Fetch featured / trending business listings.
* `GET /api/v1/listings/{slug}/` - Complete business detail view.
* `POST /api/v1/listings/create/` - Create a new business listing (requires authentication).
* `PATCH /api/v1/listings/{slug}/update/` - Update existing business listing.
* `POST /api/v1/listings/{slug}/claim/` - Submit business ownership claim request.
* `POST /api/v1/listings/{slug}/report/` - Submit listing violation report.
* `GET /api/v1/listings/user/my-listings/` - Fetch listings created by current logged-in user.
* `POST /api/v1/listings/user/favorites/` - Add/remove business listing from user bookmarks.

### Reviews & Ratings (`/api/v1/reviews/`)
* `GET /api/v1/listings/{slug}/reviews/` - Get customer reviews for a business.
* `POST /api/v1/listings/{slug}/reviews/create/` - Post a new rating & text review.

### News & Media (`/api/v1/news/`)
* `GET /api/v1/news/` - News articles list with category filter.
* `GET /api/v1/news/breaking/` - Active breaking news ticker headlines.
* `GET /api/v1/news/trending/` - Top read news articles.
* `GET /api/v1/news/{slug}/` - Single news article detail.
* `POST /api/v1/news/{slug}/comments/` - Add comment on a news article.

### Events & Ticketing (`/api/v1/events/` & `/api/v1/tickets/`)
* `GET /api/v1/events/` - Public events list.
* `GET /api/v1/events/{slug}/` - Event detail overview.
* `GET /api/v1/tickets/shows/{show_id}/seat-map/` - Interactive 2D seat map grid status (`AVAILABLE`, `HELD`, `BOOKED`, `BLOCKED`).
* `POST /api/v1/tickets/hold-seats/` - Temporary 6-minute lock on selected seats for current user session.
* `POST /api/v1/tickets/bookings/create/` - Create pending booking order and Razorpay order ID.
* `POST /api/v1/tickets/payments/verify/` - Verify Razorpay signature, confirm booking, generate cryptographic QR tickets.
* `GET /api/v1/tickets/pass/{ticket_code}/` - Fetch digital ticket pass payload & signed QR string.
* `POST /api/v1/tickets/scan/` - Gate staff scanner endpoint to validate QR ticket code at venue entry.

### Job Portal (`/api/v1/jobs/`)
* `GET /api/v1/jobs/` - Filter job postings.
* `GET /api/v1/jobs/{slug}/` - View job opening.
* `POST /api/v1/jobs/submit/` - Post a new job vacancy.
* `POST /api/v1/jobs/{slug}/apply/` - Submit job application with resume file.
* `GET /api/v1/jobs/my-applications/` - View user's submitted job applications.

### Banners & Ads (`/api/v1/banners/` & `/api/v1/ads/`)
* `GET /api/v1/banners/active/` - Main hero carousel active banners.
* `GET /api/v1/ads/by-slot/` - Ad banners filtered by placement slot (`hero_right`, `sidebar`, `footer`).
* `POST /api/v1/ads/{ad_id}/track-impression/` - Log ad view impression.
* `POST /api/v1/ads/{ad_id}/track-click/` - Log ad click-through.

### YouTube Glimpse (`/api/v1/jalgaon-glimpse/`)
* `GET /api/v1/jalgaon-glimpse/videos/` - Fetch channel videos with pagination.
* `GET /api/v1/jalgaon-glimpse/videos/{id}/` - Fetch video detail.
* `GET /api/v1/jalgaon-glimpse/channel/` - Channel profile subscriber stats.

---

## 10. DATABASE MODEL INVENTORY

### Core Models Relationship Diagram

```
User (apps.accounts)
 ├── ShopListing (owner_id FK)
 │    ├── BusinessPhoto (shop_id FK)
 │    ├── ShopReview (shop_id FK, user_id FK)
 │    ├── BusinessClaim (shop_id FK, claimant_id FK)
 │    └── BusinessReport (shop_id FK, reporter_id FK)
 ├── Event (created_by FK)
 │    └── EventShow (event_id FK, venue_id FK)
 │         ├── ShowSeat (show_id FK, venue_seat_id FK)
 │         └── Booking (show_id FK, user_id FK)
 │              ├── BookingItem (booking_id FK, show_seat_id FK)
 │              ├── Payment (booking_id FK)
 │              └── Ticket (booking_id FK)
 │                   └── TicketScanLog (ticket_id FK, scanned_by FK)
 ├── Job (posted_by FK)
 │    ├── JobApplication (job_id FK, applicant_id FK)
 │    └── SavedJob (job_id FK, user_id FK)
 ├── Startup (submitted_by FK)
 │    └── Founder (startup_id FK)
 ├── Club (created_by FK)
 │    ├── ClubActivity (club_id FK)
 │    └── ClubMember (club_id FK, user_id FK)
 └── NGO (submitted_by FK)
```

---

## 11. AUTHENTICATION FLOW

### Registration & Login Architecture

```
User Registration:
  Phone Number + Password Form Submission
  │
  ▼
  POST /api/v1/auth/register/
  │ ──> Creates User record with role='registered_user', is_verified=False
  │ ──> Sends 6-digit OTP SMS to phone number
  │
  ▼
  POST /api/v1/auth/verify-otp/ (payload: phone_number, otp_code)
  │ ──> Validates OTP match
  └──> Updates is_verified = True

User Authentication & JWT Tokens:
  POST /api/v1/auth/login/ (payload: phone_number, password)
  │
  ├── Failure check: LoginAttempt.is_locked(phone_number)
  │    └── If >= 5 failed attempts in 15 mins ──> HTTP 429 Locked
  │
  ├── Credentials check: User.check_password(password)
  │    ├── If invalid ──> Creates LoginAttempt(was_successful=False)
  │    └── If valid ──> Creates LoginAttempt(was_successful=True)
  │
  ▼
  Returns JWT Payload:
  {
    "access": "<JWT Access Token - 1 day TTL>",
    "refresh": "<JWT Refresh Token - 7 days TTL>",
    "user": {
      "id": 1,
      "phone_number": "+919876543210",
      "role": "business_owner",
      "is_verified": true
    }
  }
```

---

## 12. THIRD-PARTY SERVICES INTEGRATION AUDIT

1. **Razorpay Payment Gateway:**
   - **Usage:** Checkout for event ticket purchases (`apps/ticketing`).
   - **Credentials Configured:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
   - **Mobile Reuse:** Flutter can integrate official `razorpay_flutter` plugin using the exact same backend payment creation (`/api/v1/tickets/bookings/create/`) & verification (`/api/v1/tickets/payments/verify/`) APIs.

2. **YouTube Data API v3:**
   - **Usage:** Dynamic video stream for `/jalgaon-glimpse`.
   - **Credentials Configured:** `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`.
   - **Mobile Reuse:** Flutter app consumes backend `/api/v1/jalgaon-glimpse/videos/` endpoints directly without needing YouTube API keys in the app.

3. **OpenStreetMap / Leaflet:**
   - **Usage:** Business map location picker and address geotagging (`LocationMapPicker.tsx`).
   - **Mobile Integration:** Recommended Flutter `flutter_map` or Google Maps SDK plugin for mobile native mapping.

4. **SMTP Email Backend:**
   - **Usage:** Account password recovery notifications (`EMAIL_HOST`, `EMAIL_PORT`).

---

## 13. IMPORTANT BUSINESS RULES TO PRESERVE IN FLUTTER APP

1. **Phone Number as Primary Identifier:**
   - All user accounts are indexed and logged in via `phone_number` (not email/username).

2. **Seat Map Hold Timeout:**
   - Selected seats are temporarily locked for **6 minutes** (`SEAT_HOLD_MINUTES = 6`). If checkout is not completed within 6 minutes, the hold expires automatically and seats return to `AVAILABLE` status.

3. **HMAC QR Ticket Validation:**
   - Ticket QR code strings are generated using HMAC-SHA256 signature calculated from `ticket_code` + `TICKET_QR_SECRET`. Mobile gate scanner must pass scanned code to `/api/v1/tickets/scan/` endpoint.

4. **Rate Throttling:**
   - Unauthenticated API calls are throttled at **100 requests/minute per IP**. Authenticated users get **500 requests/minute**.

5. **Listing Approval Workflow:**
   - Listings submitted by non-admin users remain in `pending` state until reviewed by an admin or moderator.

---

## 14. WEBSITE → FLUTTER APP MAPPING

Detailed mapping of existing website pages to proposed Flutter screens:

| Website Page | Recommended Flutter Screen | Proposed Route | Existing API Endpoint | Reusable Directly? | Notes |
|:---|:---|:---|:---|:---:|:---|
| Homepage (`/`) | **HomeScreen** | `/home` | `/api/v1/banners/active/`, `/api/v1/listings/trending/` | YES | Native Carousel, Search pill bar, Quick Grid categories |
| Global Search (`/search`) | **SearchScreen** | `/search` | `/api/v1/search/`, `/api/v1/search/autocomplete/` | YES | Debounced auto-complete search bar |
| Category List (`/category/[slug]`) | **CategoryListingsScreen** | `/category-listings` | `/api/v1/listings/?category=...` | YES | Infinite scroll list with filters |
| Business Detail (`/category/.../[slug]`) | **BusinessDetailScreen** | `/business-detail` | `/api/v1/listings/{slug}/` | YES | Direct call buttons, Map view, Reviews |
| Add Listing (`/add-listing`) | **AddListingScreen** | `/add-listing` | `/api/v1/listings/create/` | YES | Native image picker + form |
| News Portal (`/news`) | **NewsPortalScreen** | `/news` | `/api/v1/news/`, `/api/v1/news/breaking/` | YES | Breaking news ticker & news cards |
| News Article Reader (`/news/[slug]`) | **NewsDetailScreen** | `/news-detail` | `/api/v1/news/{slug}/` | YES | Native article view + comments |
| Events Portal (`/events`) | **EventsPortalScreen** | `/events` | `/api/v1/events/` | YES | Featured events calendar |
| Event Detail (`/events/[slug]`) | **EventDetailScreen** | `/event-detail` | `/api/v1/events/{slug}/` | YES | Showtimes & venue info |
| Seat Picker (`/events/.../seat-selection`) | **InteractiveSeatPickerScreen** | `/seat-selection` | `/api/v1/tickets/shows/{id}/seat-map/` | YES | Native CustomPainter 2D seat map grid |
| Checkout (`/checkout`) | **TicketCheckoutScreen** | `/ticket-checkout` | `/api/v1/tickets/hold-seats/`, `/create-booking/` | YES | 6-min timer widget + Razorpay Flutter plugin |
| Ticket Pass (`/tickets/[code]`) | **DigitalTicketPassScreen** | `/ticket-pass` | `/api/v1/tickets/pass/{ticket_code}/` | YES | Native QR Code renderer with offline caching |
| Gate Scanner (N/A website route) | **GateStaffScannerScreen** | `/gate-scanner` | `/api/v1/tickets/scan/` | YES | Camera barcode scanner for `gate_staff` role |
| Job Board (`/jobs`) | **JobsBoardScreen** | `/jobs` | `/api/v1/jobs/` | YES | Salary & category filter chips |
| Job Detail (`/jobs/[slug]`) | **JobDetailScreen** | `/job-detail` | `/api/v1/jobs/{slug}/` | YES | Resume upload modal |
| Startups (`/startups`) | **StartupsDirectoryScreen** | `/startups` | `/api/v1/startups/` | YES | Startup showcase grid |
| Clubs (`/clubs`) | **ClubsDirectoryScreen** | `/clubs` | `/api/v1/clubs/` | YES | Member roster & activities |
| NGOs (`/ngo`) | **NgoDirectoryScreen** | `/ngo` | `/api/v1/ngo/` | YES | Social cause directory |
| Jalgaon Glimpse (`/jalgaon-glimpse`) | **VideoGalleryScreen** | `/glimpse` | `/api/v1/jalgaon-glimpse/videos/` | YES | `youtube_player_flutter` player |
| Tourism (`/tourism`) | **TourismGuideScreen** | `/tourism` | `/api/v1/tourism/` | YES | Scenic photo cards & landmarks map |
| User Profile (`/account`) | **UserProfileScreen** | `/profile` | `/api/v1/auth/user/` | YES | Bookmarks, My Listings, My Tickets |
| Auth Modal (Global) | **AuthLoginScreen** & **OTPVerifyScreen** | `/login`, `/verify-otp` | `/api/v1/auth/login/`, `/verify-otp/` | YES | Native phone input & 6-digit OTP fields |

---

## 15. MOBILE APP SCREEN INVENTORY RECOMMENDATION

### A. MUST HAVE (Phase 1 MVP)
1. **Splash & Onboarding Screen**
2. **AuthLoginScreen** (Phone + Password) & **OTPVerifyScreen** (6-digit OTP)
3. **HomeScreen** (Hero banner carousel, animated search bar, main categories, trending listings, breaking news)
4. **CategoryListingsScreen** & **BusinessDetailScreen** (Direct phone call action, WhatsApp redirect, Google Maps navigation)
5. **AddListingScreen** (Business listing submission with mobile camera/gallery upload)
6. **SearchScreen** (Instant debounced multi-entity search)
7. **EventsPortalScreen** & **EventDetailScreen**
8. **InteractiveSeatPickerScreen** (2D seat grid with zoom & pan)
9. **TicketCheckoutScreen** & **DigitalTicketPassScreen** (Razorpay integration & QR pass display)
10. **UserProfileScreen** & **MyTicketsScreen**

### B. SHOULD HAVE (Phase 2 Expansion)
11. **NewsPortalScreen** & **NewsDetailScreen** (With audio reader / breaking ticker)
12. **JobsBoardScreen**, **JobDetailScreen**, & **JobApplyScreen**
13. **GateStaffScannerScreen** (Dedicated camera scanner mode for users with `role='gate_staff'`)
14. **VideoGalleryScreen** (YouTube API player integration)
15. **NotificationsScreen** (Push notifications & in-app alerts center)

### C. OPTIONAL / FUTURE (Phase 3)
16. **StartupsDirectoryScreen** & **StartupDetailScreen**
17. **ClubsDirectoryScreen** & **NgoDirectoryScreen**
18. **TourismGuideScreen**
19. **Mobile Admin Dashboard** (Simplified management view for admins)

---

## 16. USER JOURNEYS & FLOWS

### 1. Guest Visitor Journey
```
Splash Screen
 └──> Home Screen
       ├──> Tap Search ──> Search Screen ──> Business Detail ──> Call / WhatsApp / Map
       ├──> Tap Category ──> Category Listings ──> Business Detail
       ├──> Tap Event ──> Event Detail ──> (Prompts Login to book seats)
       └──> Tap News ──> News Article Detail
```

### 2. Registered User Journey
```
Login Screen (Phone + Password)
 └──> OTP Verification (if unverified)
       └──> Home Screen (Authenticated Header)
             ├──> Tap "List Your Business" ──> Add Listing Screen ──> (Submitted for Admin Review)
             ├──> Tap Event ──> Seat Selection ──> Hold Seats (6-min timer)
             │      └──> Checkout ──> Razorpay Payment ──> Ticket Confirmed ──> Digital Ticket Pass (QR)
             └──> Tap Profile ──> Account Dashboard (My Listings, My Bookings, Saved Items)
```

### 3. Business Owner Journey
```
Login Screen
 └──> Account Dashboard
       ├──> My Listings Tab ──> View Listed Shops & Status (Approved / Pending)
       ├──> Edit Listing ──> Update Phone, Hours, Photos
       └──> View Customer Reviews & Ratings
```

### 4. Gate Staff Ticket Scanner Journey
```
Login Screen (User with role = 'gate_staff')
 └──> Gate Staff Mode Launcher
       └──> Open Camera Scanner
             └──> Scan Attendee QR Code Pass
                   └──> Calls POST /api/v1/tickets/scan/
                         ├── Valid Ticket ──> Green Banner ("ENTRY ALLOWED: John Doe - Seat A12")
                         └── Invalid / Used ──> Red Alert ("ALREADY SCANNED AT 18:42")
```

---

## 17. AUDIT SUMMARY FINDINGS

### VERIFIED (Directly confirmed from repository code)
* Django REST Framework backend (`jalgaonApi`) contains 25 apps and 40+ database models.
* Active Next.js 16 frontend (`New-JalgaonUI`) uses App Router with comprehensive components for Directory, Ticketing, News, Jobs, Startups, Clubs, NGOs, and Admin Panel.
* User roles are explicitly defined in `apps.accounts.models.User.ROLE_CHOICES` (13 distinct roles).
* The ticketing subsystem implements physical venue seat mapping (`Venue` $\rightarrow$ `VenueSection` $\rightarrow$ `VenueRow` $\rightarrow$ `VenueSeat`), 6-minute seat hold expiration (`SEAT_HOLD_MINUTES = 6`), Razorpay signature verification, and HMAC-SHA256 QR pass signing.
* Phone number (`phone_number`) is the unique account identifier (`USERNAME_FIELD = 'phone_number'`).

### INFERRED (Highly probable based on codebase artifacts)
* Legacy spam routes in `New-JalgaonUI/src/app/[...spam]` were generated to return HTTP 410 Gone to clean up historical SEO spam links that targeted an earlier version of the site.
* The Vite/React application in `jalgaonUi/` represents an earlier version of the frontend web application that was wrapped with Capacitor (`capacitor.config.json`) for Android deployment testing before Next.js 16 (`New-JalgaonUI`) was built.

### NOT FOUND (Searched for but not present in code)
* Native Firebase Cloud Messaging (FCM) push notification SDK configuration in the frontend (in-app notifications model `Notification` exists in backend, but FCM push token registration API is not yet created).
* Dedicated SMS Gateway API vendor client SDK (OTP code generation logic exists in `apps.accounts`, but SMS provider sending functions rely on console/email backend fallback in development).

### QUESTIONS FOR FLUTTER IMPLEMENTATION ALIGNMENT
1. **Authentication Mode:** Should the Flutter mobile app support direct SMS OTP auto-fill verification upon registration/login, or strictly keep Phone + Password with OTP verification?
2. **Payment Gateway SDK:** Should we use native Razorpay SDK (`razorpay_flutter`) for seamless in-app sheet checkout?
3. **Gate Staff Scanner:** Should the mobile app include the Gate Staff Scanner interface into the main single Flutter app (gated by user role), or build a lightweight separate Gate Scanner app?
