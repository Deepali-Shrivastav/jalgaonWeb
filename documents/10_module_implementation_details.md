# Jalgaon.com — Module Implementation Details (Phase-Wise)

> **Source:** Synthesized from PRD v1.0, Functional Requirements, New Modules Specification, Phase-Wise Plan, and Restructuring Plan.
> **Purpose:** A comprehensive reference document for all 22 modules, categorized by Phase and ordered by Difficulty (highest to lowest). It contains full PRD details, functional requirements, and architecture locations.

---

## Overview

The Jalgaon.com backend is structured around a 22-module Django architecture located within the `apps/` directory. Each module manages a specific domain.

**Difficulty Scale:**
- **Critical/Very High (4+ weeks)**: Foundational modules required for the entire system to function.
- **High (3-4 weeks)**: High complexity, critical business logic, external integrations (Payments, SMS), complex DB operations.
- **Medium (2-3 weeks)**: Moderate complexity, integrations required, or multiple data relations.
- **Low (1-2 weeks)**: Straightforward CRUD operations, low inter-dependency.

---

## Phase 1: Foundation (Months 1–2)
*Core infrastructure, authentication, directory MVP, and admin foundations.*

### 1. Admin Dashboard (`apps/admin_panel/`)
- **Difficulty:** Critical/Very High | **Effort:** 4-5 weeks
- **Features (MOD-10):** 
  - Centralized moderation queue for all incoming user data.
  - Full CRUD operations across User, Listing, Ad, Category, Content management.
  - Role/Permission management assignments.
- **Role:** The control center integrating backend Admin APIs.

### 2. Search Engine (`apps/search/`)
- **Difficulty:** Very High | **Effort:** 1-2 weeks per phase
- **Features (FR-SRCH-01 to 09):** 
  - *Phase 1:* PostgreSQL full-text search.
  - *Phase 2:* PostGIS geolocation search (configurable radius). Autocomplete & fuzzy search.
  - *Phase 4:* Elasticsearch integration for scale.
  - Synonyms, category filters, sorting (Relevance, Rating, Distance).
- **Key Location:** `apps/search/views.py`.

### 3. Authentication & Users (`apps/accounts/`)
- **Difficulty:** High | **Effort:** 2 weeks
- **Features (FR-AUTH-01 to 11):** 
  - OTP login via mobile number (Twilio SMS gateway).
  - JWT-based authentication (RS256 asymmetric signing).
  - Rate limiting (max 5 requests/hr) and Google reCAPTCHA v3.
  - Device/Session management (Logout all devices).
  - RBAC middleware, 11 roles, and 15 permissions.
- **Key Models:** `User`, `UserManager` (preserving `app_user` DB table).
- **Frontend Impact:** Login forms, Navbar, UserContext.

### 4. Business Directory (`apps/directory/`)
- **Difficulty:** High | **Effort:** 3-4 weeks (Spans into Phase 2 for rich profiles)
- **Features (FR-DIR-01 to 12):** 
  - Business profiles with photos (max 10), location, and contacts.
  - Multi-tier Category and Subcategory system.
  - "Claim Business" workflow, moderation queue (approved/rejected/pending).
  - Saved/Favorite listings logic.
  - LocalBusiness Schema.org JSON-LD generation.
- **Key Models:** `MainCategory`, `SubCategory`, `ShopListing`, `LikedShops`.

### 5. Finance (`apps/finance/`)
- **Difficulty:** Low | **Effort:** < 1 week
- **Features:** 
  - Migration of existing stock/finance ticker functionality.
- **Key Models:** `FinanceData` (preserving `app_financedata`).

---

## Phase 2: Core Modules (Months 3–4)
*Rich profiles, news, user dashboards, ad monetization, and payment integrations.*

### 6. Advertisement System (`apps/ads/`)
- **Difficulty:** High | **Effort:** 3-4 weeks
- **Features (MOD-07, FR-ADV-01 to 07):** 
  - Self-serve ad request with creative upload and scheduling.
  - Ad placements (Hero banner, Category banner, sidebar, listing interstitial).
  - Tracking metrics: Impressions, Clicks, CTR analytics.
- **Key Models:** `HomeCrouselAds`, `BannerAds`, `AdsListing`.

### 7. Payment & Subscription (`apps/payments/`)
- **Difficulty:** High | **Effort:** 3-4 weeks
- **Features (MOD-06):** 
  - Razorpay Integration (UPI, Cards, Wallets).
  - Webhook processing for async payment confirmations.
  - Powers Revenue Streams: Trending Listings, Ads, Job Posting Fees.
- **Key Models:** `Payment`, `Subscription`, `Invoice`, `Package`.

### 8. User Dashboard (`apps/dashboard/`)
- **Difficulty:** Medium | **Effort:** 3 weeks
- **Features (MOD-09, FR-DASH-01 to 09):** 
  - Aggregate dashboard for managing personal listings, job applications, events, and ad requests.
  - Notifications hub, Profile settings, Activity logs.
  - Subscription & payment invoice views.
- **Role:** Primarily aggregates APIs from other apps for a unified user interface.

### 9. News Portal (`apps/news/`)
- **Difficulty:** Medium | **Effort:** 2 weeks
- **Features (FR-NEWS-01 to 11):** 
  - News articles with categories, tags, and scheduled publishing (via Celery).
  - Breaking News ticker and Trending section.
  - Comments (moderated), social sharing, AMP-ready templates.
  - Publishing workflow: Draft → Editor Review → Published.
- **Key Models:** `ArticleModel`, `ActiveArticle`.

### 10. Notification System (`apps/notifications/`)
- **Difficulty:** Medium | **Effort:** 2-3 weeks
- **Features (MOD-05):** 
  - Multi-channel delivery: In-App, Email (SendGrid/SES), SMS (Twilio).
  - Real-time/async dispatching via Celery for events like `listing_approved`, `job_application`, `payment_success`.
- **Key Models:** `Notification`, `NotificationTemplate`.

### 11. Media Library (`apps/media_lib/`)
- **Difficulty:** Medium | **Effort:** 2 weeks
- **Features (MOD-11):** 
  - Auto WebP conversion, AWS S3/R2 storage, CDN delivery.
  - Bulk upload endpoints, folder organization, 5MB max constraints.
- **Key Models:** `MediaFile`, `MediaFolder`.

### 12. Reviews & Ratings (`apps/reviews/`)
- **Difficulty:** Medium | **Effort:** 1 week
- **Features:** 
  - 1-5 star ratings and text reviews for business listings.
  - Moderation queue integration.
- **Key Models:** `ShopReview` (preserving `app_shopreview`).

### 13. Audit Logs (`apps/audit/`)
- **Difficulty:** Low | **Effort:** 1 week
- **Features (MOD-12):** 
  - Immutable backend logging for all admin actions.
  - Searchable, CSV exportable, 1-year retention policy.
- **Key Models:** `AuditLog`.

---

## Phase 3: Extended Modules (Months 5–6)
*Community engagement, job portal, events, and niche directories.*

### 14. Job Portal (`apps/jobs/`)
- **Difficulty:** High | **Effort:** 3-4 weeks
- **Features (MOD-01, FR-JOB-01 to 08):** 
  - Job posting (salary, location, requirements, deadlines).
  - Admin approval workflow before posting.
  - In-platform applications (resume upload).
  - Auto-archival upon expiration and poster notifications.
- **Key Models:** `Job`, `JobApplication`, `JobCategory`.

### 15. Blog Module (`apps/blog/`)
- **Difficulty:** Medium | **Effort:** 2-3 weeks
- **Features (MOD-02):** 
  - Rich text editor with auto-generated Table of Contents.
  - Tag taxonomy, author profiles, related posts.
  - Scheduled publishing (Draft → Review → Published).
- **Key Models:** `BlogPost`, `BlogCategory`, `BlogTag`.

### 16. Event Module (`apps/events/`)
- **Difficulty:** Medium | **Effort:** 2 weeks
- **Features (FR-EVT-01 to 08):** 
  - Event submission, admin moderation.
  - Calendar view, Maps embed, social sharing.
  - Event Schema JSON-LD formatting.
- **Key Models:** `Event`, `EventCategory`.

### 17. Startup Ecosystem (`apps/startups/`)
- **Difficulty:** Medium | **Effort:** 2 weeks
- **Features (MOD-03):** 
  - Dedicated startup profiles (founders, industry, founding year).
  - Stage/Industry filtering.
- **Key Models:** `Startup`, `Founder`.

### 18. Tourism Module (`apps/tourism/`)
- **Difficulty:** Medium | **Effort:** 1-2 weeks
- **Features:** 
  - Tourist places, maps integration, galleries, and specialized reviews.
- **Key Models:** `TouristPlace`, `TouristReview`.

### 19. Club Activities (`apps/clubs/`)
- **Difficulty:** Low | **Effort:** 2 weeks
- **Features (MOD-04):** 
  - Club profile (name, category), member listings.
  - Activity/event specific to clubs, photo gallery.
- **Key Models:** `Club`, `ClubActivity`.

### 20. City Information (CMS) (`apps/cms/`)
- **Difficulty:** Low | **Effort:** 1-2 weeks
- **Features (MOD-08):** 
  - Managed static pages (Culture & Heritage, Education Directory, Emergency Contacts).
- **Key Models:** `Page`, `PageCategory`.

### 21. NGO Directory (`apps/ngo/`)
- **Difficulty:** Low | **Effort:** 1 week
- **Features:** 
  - Specific filters and categories for NGOs in the region.
- **Key Models:** `NGO`, `NGOCategory`.

---

## Phase 4: Optimization & Scale (Month 7+)
*High-scale performance enhancements, analytics, and platform tuning.*

### 22. Analytics Dashboard (`apps/analytics/`)
- **Difficulty:** Medium | **Effort:** 2-3 weeks
- **Features (MOD-13):** 
  - GA4 server-side integration.
  - Traffic, revenue, and listing engagement reports.
- **Key Models:** `AnalyticsEvent`, `Report`.

---
*Document Version: 2.0 | Restructured: Phase-wise and Difficulty-wise distribution.*
