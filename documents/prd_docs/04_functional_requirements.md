# Jalgaon.com — Functional Requirements (All Modules)

> **Source:** PRD v1.0 | **Purpose:** Complete functional requirements with IDs for every module

---

## FR-1: Authentication Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | OTP login via mobile number (primary) | Critical |
| FR-AUTH-02 | OTP login via email (optional/fallback) | High |
| FR-AUTH-03 | Twilio SMS gateway integration for OTP delivery | Critical |
| FR-AUTH-04 | OTP expiry of 5 minutes; maximum 3 retry attempts | Critical |
| FR-AUTH-05 | Rate limiting — max 5 OTP requests per phone per hour | High |
| FR-AUTH-06 | JWT-based session with configurable expiry (7 days default) | Critical |
| FR-AUTH-07 | "Remember Me" option extending token to 30 days | Medium |
| FR-AUTH-08 | Device management — list and revoke active sessions | Medium |
| FR-AUTH-09 | "Logout from all devices" action | Medium |
| FR-AUTH-10 | CAPTCHA on OTP request form to prevent spam | High |
| FR-AUTH-11 | Automatic account creation on first successful OTP verification | Critical |

**Token Architecture:**
- Access token TTL: 15 minutes
- Refresh token TTL: 7 days (30 days with Remember Me)
- JWT with RS256 asymmetric signing
- Public key at `/api/v1/.well-known/jwks.json`
- Token blacklist via Redis for logout/revoke

---

## FR-2: Business Directory

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DIR-01 | Browse listings by category and subcategory | Critical |
| FR-DIR-02 | Advanced search with keyword, location, and radius filters | Critical |
| FR-DIR-03 | Rich business profile: name, description, address, phone, website, email, WhatsApp, social links, photos gallery (max 10), business hours, Google Maps embed, categories | Critical |
| FR-DIR-04 | Star rating (1–5) and text reviews per listing | High |
| FR-DIR-05 | "Claim Business" workflow for unverified listings | High |
| FR-DIR-06 | "Report Business" feature with reason selection | Medium |
| FR-DIR-07 | Favorite/Save listing to user profile | Medium |
| FR-DIR-08 | Share listing via native share API | Medium |
| FR-DIR-09 | "Nearby Listings" using browser geolocation API | High |
| FR-DIR-10 | SEO-friendly URLs: `/business/{city}/{category}/{slug}` | Critical |
| FR-DIR-11 | Schema.org LocalBusiness JSON-LD on every profile page | Critical |
| FR-DIR-12 | Trending Listings displayed above organic results with "Featured" badge | High |

**Existing Categories (All Preserved):**
Automotive, Agriculture Services, Construction & Real Estate, Beauty & Wellness, Business Services, Education, Electronics & Appliances, Finance & Insurance, Food & Beverages, Healthcare, Home Services, Hospitality, IT & Software, Manufacturing, Media & Entertainment, Personal Care, Retail, Sports & Recreation, Transportation, Utilities, Wholesale & Distributors, Miscellaneous

---

## FR-3: Search Engine

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SRCH-01 | Full-text keyword search across business names, descriptions, categories | Critical |
| FR-SRCH-02 | Fuzzy search to handle typos and approximate matches | High |
| FR-SRCH-03 | Autocomplete suggestions as user types (debounced, <200ms) | High |
| FR-SRCH-04 | Location-based search with configurable radius (1km, 5km, 10km, 25km) | High |
| FR-SRCH-05 | Recent search history (stored per user, max 10 items) | Medium |
| FR-SRCH-06 | Popular searches displayed below empty search bar | Medium |
| FR-SRCH-07 | Synonym support (e.g., "doctor" returns "clinic" results) | Medium |
| FR-SRCH-08 | Category and subcategory filter chips in results page | High |
| FR-SRCH-09 | Sort results by: Relevance, Rating, Distance, Newest | High |

**Implementation:** PostgreSQL Full-Text Search (Phase 1) → Elasticsearch (Phase 2)

---

## FR-4: News Portal

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-NEWS-01 | News articles with categories, tags, author, publish date, featured image | High |
| FR-NEWS-02 | Breaking News ticker on homepage and news index | High |
| FR-NEWS-03 | Trending News section (by views in last 24h) | Medium |
| FR-NEWS-04 | Related News widget on article pages | Medium |
| FR-NEWS-05 | Comment system (moderation-required) on articles | Medium |
| FR-NEWS-06 | Social sharing (Facebook, Twitter/X, WhatsApp) on every article | High |
| FR-NEWS-07 | AMP-ready article templates for mobile Google search | Medium |
| FR-NEWS-08 | Publishing workflow: Draft → Editor Review → Published | High |
| FR-NEWS-09 | Scheduled publishing (publish at future date/time) | Medium |
| FR-NEWS-10 | Article view counter | Low |
| FR-NEWS-11 | Article Schema (Article JSON-LD) on every news page | High |

---

## FR-5: Job Portal

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-JOB-01 | Job post form: title, company, location, salary range, description, requirements, deadline | High |
| FR-JOB-02 | Admin approval required before job goes live | High |
| FR-JOB-03 | Job search with keyword, location, category, salary, and job type filters | High |
| FR-JOB-04 | Bookmark/save jobs to user profile | Medium |
| FR-JOB-05 | Apply for job via platform (resume upload or external URL) | High |
| FR-JOB-06 | Job poster receives notification on new applications | High |
| FR-JOB-07 | Job expiry after deadline date with auto-archival | Medium |
| FR-JOB-08 | JobPosting Schema JSON-LD on each job page | High |

---

## FR-6: Event Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-EVT-01 | Event submission form: name, date, time, venue, description, organizer, registration link, images | High |
| FR-EVT-02 | Admin approval mandatory before event goes live | High |
| FR-EVT-03 | Upcoming events feed on homepage | High |
| FR-EVT-04 | Calendar view of events | Medium |
| FR-EVT-05 | Past events archive | Low |
| FR-EVT-06 | Google Maps embed for event venue | Medium |
| FR-EVT-07 | Event sharing via social media and WhatsApp | Medium |
| FR-EVT-08 | Event Schema JSON-LD on each event page | High |

---

## FR-7: Advertisement Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ADV-01 | Advertiser submits ad request: ad type, creative upload, target page, package, duration | High |
| FR-ADV-02 | Admin review: approve, reject, or request revision | High |
| FR-ADV-03 | Ad scheduling with start and end dates | High |
| FR-ADV-04 | Impression and click tracking per ad | High |
| FR-ADV-05 | Analytics report for advertiser: impressions, clicks, CTR, spend | Medium |
| FR-ADV-06 | Ad placements: Homepage Hero Banner, Category Page Banner, Sidebar, Between Listings | High |
| FR-ADV-07 | Admin can enable/disable specific ad slots globally | Medium |

---

## FR-8: User Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DASH-01 | My Listings — view, edit, and manage own business listings | High |
| FR-DASH-02 | My Jobs — view posted jobs and applicants | High |
| FR-DASH-03 | My Events — view submitted events | Medium |
| FR-DASH-04 | Advertisement Requests — status of submitted ad requests | Medium |
| FR-DASH-05 | Saved/Favorite Listings | Medium |
| FR-DASH-06 | Notifications — in-app notification center | High |
| FR-DASH-07 | Profile Settings — name, photo, contact, preferences | High |
| FR-DASH-08 | Subscription & Payments — view active plan, invoices, upgrade | High |
| FR-DASH-09 | Activity Log — recent actions | Low |

---

## FR Summary

| Module | Total FRs | Critical | High | Medium | Low |
|--------|-----------|----------|------|--------|-----|
| Authentication | 11 | 5 | 3 | 3 | 0 |
| Business Directory | 12 | 5 | 4 | 3 | 0 |
| Search Engine | 9 | 1 | 5 | 3 | 0 |
| News Portal | 11 | 0 | 5 | 5 | 1 |
| Job Portal | 8 | 0 | 6 | 2 | 0 |
| Event Module | 8 | 0 | 4 | 3 | 1 |
| Advertisement | 7 | 0 | 5 | 2 | 0 |
| User Dashboard | 9 | 0 | 5 | 3 | 1 |
| **Total** | **75** | **11** | **37** | **24** | **3** |

---

*Document Version: 1.0 | Derived from Jalgaon.com PRD v1.0*
