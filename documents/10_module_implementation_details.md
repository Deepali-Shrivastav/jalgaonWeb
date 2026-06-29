# Jalgaon.com — Module Implementation Details

> **Source:** Synthesized from PRD v1.0, Functional Requirements, New Modules Specification, Phase-Wise Plan, and Restructuring Plan.
> **Purpose:** A comprehensive reference document for all 22 modules containing PRD details, functional requirements, technical locations, and difficulty levels.

---

## Overview

The Jalgaon.com backend is structured around a 22-module Django architecture located within the `apps/` directory. Each module manages a specific domain, providing focused functionality with clearly defined requirements.

Difficulty Scale:
- **Low**: Straightforward CRUD operations, low inter-dependency. (1-2 weeks)
- **Medium**: Moderate complexity, integrations required, or multiple data relations. (2-3 weeks)
- **High**: High complexity, critical business logic, external integrations (Payments, SMS), complex DB operations. (3-4 weeks)
- **Critical/Very High**: Foundational modules required for the entire system to function. (4+ weeks)

---

## 1. Authentication & Users (`apps/accounts/`)
- **Phase:** 1 (Foundation) | **Difficulty:** High | **Effort:** 2 weeks
- **Features (FR-AUTH-01 to 11):** 
  - OTP login via mobile number (Twilio SMS gateway).
  - JWT-based authentication (RS256 asymmetric signing).
  - Rate limiting (max 5 requests/hr) and Google reCAPTCHA v3.
  - Device/Session management (Logout all devices).
  - RBAC middleware, 11 roles, and 15 permissions.
- **Key Models:** `User`, `UserManager` (preserving `app_user` DB table).
- **Frontend Impact:** Login forms, Navbar, UserContext.

## 2. Business Directory (`apps/directory/`)
- **Phase:** 1 & 2 | **Difficulty:** High | **Effort:** 3-4 weeks (Split)
- **Features (FR-DIR-01 to 12):** 
  - Business profiles with photos (max 10), location, and contacts.
  - Multi-tier Category and Subcategory system.
  - "Claim Business" workflow, moderation queue (approved/rejected/pending).
  - Saved/Favorite listings logic.
  - LocalBusiness Schema.org JSON-LD generation.
- **Key Models:** `MainCategory`, `SubCategory`, `ShopListing`, `LikedShops`.

## 3. Search Engine (`apps/search/`)
- **Phase:** 1, 2, & 4 | **Difficulty:** Very High | **Effort:** 1-2 weeks per phase
- **Features (FR-SRCH-01 to 09):** 
  - Phase 1: PostgreSQL full-text search.
  - Phase 2: PostGIS geolocation search (configurable radius). Autocomplete & fuzzy search.
  - Phase 4: Elasticsearch integration.
  - Synonyms, category filters, sorting (Relevance, Rating, Distance).
- **Key Location:** `apps/search/views.py`.

## 4. News Portal (`apps/news/`)
- **Phase:** 2 | **Difficulty:** Medium | **Effort:** 2 weeks
- **Features (FR-NEWS-01 to 11):** 
  - News articles with categories, tags, and scheduled publishing (via Celery).
  - Breaking News ticker and Trending section.
  - Comments (moderated), social sharing, AMP-ready templates.
  - Publishing workflow: Draft → Editor Review → Published.
- **Key Models:** `ArticleModel`, `ActiveArticle`.

## 5. Job Portal (`apps/jobs/`)
- **Phase:** 3 | **Difficulty:** High | **Effort:** 3-4 weeks
- **Details (MOD-01, FR-JOB-01 to 08):** 
  - Job posting (salary, location, requirements, deadlines).
  - Admin approval workflow before posting.
  - In-platform applications (resume upload).
  - Auto-archival upon expiration and poster notifications.
- **Key Models:** `Job`, `JobApplication`, `JobCategory`.

## 6. Event Module (`apps/events/`)
- **Phase:** 3 | **Difficulty:** Medium | **Effort:** 2 weeks
- **Details (FR-EVT-01 to 08):** 
  - Event submission, admin moderation.
  - Calendar view, Maps embed, social sharing.
  - Event Schema JSON-LD formatting.
- **Key Models:** `Event`, `EventCategory`.

## 7. Advertisement System (`apps/ads/`)
- **Phase:** 2 | **Difficulty:** High | **Effort:** 3-4 weeks
- **Details (MOD-07, FR-ADV-01 to 07):** 
  - Self-serve ad request with creative upload and scheduling.
  - Ad placements (Hero banner, Category banner, sidebar, listing interstitial).
  - Tracking metrics: Impressions, Clicks, CTR analytics.
- **Key Models:** `HomeCrouselAds`, `BannerAds`, `AdsListing`.

## 8. User Dashboard (`apps/dashboard/`)
- **Phase:** 2 | **Difficulty:** Medium | **Effort:** 3 weeks
- **Details (MOD-09, FR-DASH-01 to 09):** 
  - Aggregate dashboard for managing personal listings, job applications, events, and ad requests.
  - Notifications hub, Profile settings, Activity logs.
  - Subscription & payment invoice views.
- **Role:** Primarily aggregates APIs from other apps for a unified user interface.

## 9. Blog Module (`apps/blog/`)
- **Phase:** 3 | **Difficulty:** Medium | **Effort:** 2-3 weeks
- **Details (MOD-02):** 
  - Rich text editor with auto-generated Table of Contents.
  - Tag taxonomy, author profiles, related posts.
  - Scheduled publishing (Draft → Review → Published).
- **Key Models:** `BlogPost`, `BlogCategory`, `BlogTag`.

## 10. Startup Ecosystem (`apps/startups/`)
- **Phase:** 3 | **Difficulty:** Medium | **Effort:** 2 weeks
- **Details (MOD-03):** 
  - Dedicated startup profiles (founders, industry, founding year).
  - Stage/Industry filtering.
- **Key Models:** `Startup`, `Founder`.

## 11. Club Activities (`apps/clubs/`)
- **Phase:** 3 | **Difficulty:** Low | **Effort:** 2 weeks
- **Details (MOD-04):** 
  - Club profile (name, category), member listings.
  - Activity/event specific to clubs, photo gallery.
- **Key Models:** `Club`, `ClubActivity`.

## 12. Notification System (`apps/notifications/`)
- **Phase:** 2 | **Difficulty:** Medium | **Effort:** 2-3 weeks
- **Details (MOD-05):** 
  - Multi-channel delivery: In-App, Email (SendGrid/SES), SMS (Twilio).
  - Real-time/async dispatching via Celery for events like `listing_approved`, `job_application`, `payment_success`.
- **Key Models:** `Notification`, `NotificationTemplate`.

## 13. Payment & Subscription (`apps/payments/`)
- **Phase:** 2 | **Difficulty:** High | **Effort:** 3-4 weeks
- **Details (MOD-06):** 
  - Razorpay Integration (UPI, Cards, Wallets).
  - Webhook processing for async payment confirmations.
  - Powers Revenue Streams: Trending Listings, Ads, Job Posting Fees.
- **Key Models:** `Payment`, `Subscription`, `Invoice`, `Package`.

## 14. City Information (CMS) (`apps/cms/`)
- **Phase:** 3 | **Difficulty:** Low | **Effort:** 1-2 weeks
- **Details (MOD-08):** 
  - Managed static pages (Culture & Heritage, Education Directory, Emergency Contacts).
- **Key Models:** `Page`, `PageCategory`.

## 15. Admin Dashboard (`apps/admin_panel/`)
- **Phase:** 1 | **Difficulty:** Critical/Very High | **Effort:** 4-5 weeks
- **Details (MOD-10):** 
  - Centralized moderation queue.
  - Full CRUD across User, Listing, Ad, Category, Content management.
  - Role/Permission management assignments.
- **Role:** The control center integrating backend Admin APIs.

## 16. Media Library (`apps/media_lib/`)
- **Phase:** 2 | **Difficulty:** Medium | **Effort:** 2 weeks
- **Details (MOD-11):** 
  - Auto WebP conversion, AWS S3/R2 storage, CDN delivery.
  - Bulk upload endpoints, folder organization, 5MB max constraints.
- **Key Models:** `MediaFile`, `MediaFolder`.

## 17. Audit Logs (`apps/audit/`)
- **Phase:** 2 | **Difficulty:** Low | **Effort:** 1 week
- **Details (MOD-12):** 
  - Immutable backend logging for all admin actions.
  - Searchable, CSV exportable, 1-year retention policy.
- **Key Models:** `AuditLog`.

## 18. Analytics Dashboard (`apps/analytics/`)
- **Phase:** 4 | **Difficulty:** Medium | **Effort:** 2-3 weeks
- **Details (MOD-13):** 
  - GA4 server-side integration.
  - Traffic, revenue, and listing engagement reports.
- **Key Models:** `AnalyticsEvent`, `Report`.

## 19. Reviews & Ratings (`apps/reviews/`)
- **Phase:** 2 | **Difficulty:** Medium | **Effort:** 1 week
- **Details:** 
  - 1-5 star ratings and text reviews for business listings.
  - Moderation queue integration.
- **Key Models:** `ShopReview` (preserving `app_shopreview`).

## 20. Tourism Module (`apps/tourism/`)
- **Phase:** 3 | **Difficulty:** Medium | **Effort:** 1-2 weeks
- **Details:** 
  - Tourist places, maps integration, galleries, and specialized reviews.
- **Key Models:** `TouristPlace`, `TouristReview`.

## 21. NGO Directory (`apps/ngo/`)
- **Phase:** 3 | **Difficulty:** Low | **Effort:** 1 week
- **Details:** 
  - Specific filters and categories for NGOs in the region.
- **Key Models:** `NGO`, `NGOCategory`.

## 22. Finance (`apps/finance/`)
- **Phase:** 1 (Migration) | **Difficulty:** Low | **Effort:** < 1 week
- **Details:** 
  - Migration of existing stock/finance ticker functionality.
- **Key Models:** `FinanceData` (preserving `app_financedata`).

---
*Document Version: 1.0 | Created from combined PRD planning documents*
