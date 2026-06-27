# Jalgaon.com — Phase-Wise Implementation Plan

> **Source:** PRD v1.0 | **Purpose:** Complete phase-wise development roadmap with milestones, tasks, and deliverables

---

## Overview

| Phase | Name | Duration | Focus |
|-------|------|----------|-------|
| Phase 1 | Foundation | Months 1–2 | Core infra, auth, directory MVP, homepage, SEO, admin |
| Phase 2 | Core Modules | Months 3–4 | Rich profiles, search, news, user dashboard, ads, payments |
| Phase 3 | Extended Modules | Months 5–6 | Jobs, blog, events, tourist, NGO, startups, clubs, CMS |
| Phase 4 | Optimization & Scale | Month 7+ | Elasticsearch, push notifications, analytics, security, mobile app |

---

## Phase 1 — Foundation (Months 1–2)

### Month 1: Infrastructure & Auth MVP

**Sprint 1 (Week 1–2): Project Setup & Core Architecture**

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 1.1.1 | Initialize Next.js 14+ project with TypeScript, TailwindCSS | 2 days | Frontend |
| 1.1.2 | Initialize Django 5.x project with DRF, PostgreSQL, Docker Compose | 2 days | Backend |
| 1.1.3 | Set up PostgreSQL 16 with PostGIS extension | 1 day | Backend |
| 1.1.4 | Configure Redis 7.x (session, cache, rate limiting) | 1 day | Backend |
| 1.1.5 | Set up Docker + Docker Compose for local development | 1 day | DevOps |
| 1.1.6 | Configure Nginx reverse proxy | 1 day | DevOps |
| 1.1.7 | Set up GitHub Actions CI/CD pipeline (lint → test → build → deploy) | 2 days | DevOps |
| 1.1.8 | Configure Sentry error monitoring (frontend + backend) | 0.5 day | DevOps |
| 1.1.9 | Set up AWS S3 / Cloudflare R2 for media storage | 0.5 day | DevOps |
| 1.1.10 | Configure Cloudflare CDN for static assets | 0.5 day | DevOps |

**Sprint 2 (Week 3–4): Authentication & RBAC**

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 1.2.1 | Design Users, Roles, Permissions DB schema | 1 day | Backend |
| 1.2.2 | Implement OTP send/verify API (Twilio integration) | 3 days | Backend |
| 1.2.3 | Implement JWT authentication (RS256, access/refresh tokens) | 2 days | Backend |
| 1.2.4 | Implement rate limiting on OTP endpoints | 1 day | Backend |
| 1.2.5 | Build RBAC middleware and permission decorators | 2 days | Backend |
| 1.2.6 | Seed all 11 roles and 15 permissions | 0.5 day | Backend |
| 1.2.7 | Build OTP Login page (mobile number input + OTP entry) | 2 days | Frontend |
| 1.2.8 | Integrate Google reCAPTCHA v3 on login form | 1 day | Frontend |
| 1.2.9 | Build profile creation form (first login) | 1 day | Frontend |
| 1.2.10 | Implement JWT token management (storage, refresh, logout) | 1 day | Frontend |

### Month 2: Directory MVP & Homepage

**Sprint 3 (Week 5–6): Business Directory Core**

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 1.3.1 | Design Listings, Categories, Reviews DB schema | 1 day | Backend |
| 1.3.2 | Build Categories CRUD API (with subcategories) | 2 days | Backend |
| 1.3.3 | Build Listings CRUD API (create, read, update, delete, search) | 3 days | Backend |
| 1.3.4 | Implement listing moderation workflow (pending → approved/rejected) | 1 day | Backend |
| 1.3.5 | Build basic full-text search (PostgreSQL) | 2 days | Backend |
| 1.3.6 | Seed all 22 existing categories with subcategories | 0.5 day | Backend |
| 1.3.7 | Build Category Grid component | 1 day | Frontend |
| 1.3.8 | Build Listing Card component | 1 day | Frontend |
| 1.3.9 | Build Category Listing Page (grid, basic filters, pagination) | 2 days | Frontend |
| 1.3.10 | Build Add Listing multi-step form (5 steps) | 3 days | Frontend |

**Sprint 4 (Week 7–8): Homepage Redesign + SEO + Admin MVP**

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 1.4.1 | Build Homepage layout (hero, categories, placeholder sections) | 3 days | Frontend |
| 1.4.2 | Implement sticky header with search bar | 1 day | Frontend |
| 1.4.3 | Build Footer component (5-column, social, legal links) | 1 day | Frontend |
| 1.4.4 | Implement SEO infrastructure: generateMetadata(), sitemap.xml, robots.txt | 2 days | Frontend |
| 1.4.5 | Add Schema.org JSON-LD (Organization, WebSite, BreadcrumbList) | 1 day | Frontend |
| 1.4.6 | Build Admin Dashboard shell (sidebar nav, top bar, routing) | 2 days | Frontend |
| 1.4.7 | Build Admin Listing Management (moderation queue, approve/reject) | 2 days | Frontend |
| 1.4.8 | Build Admin Category Management (CRUD, reorder, toggle) | 1 day | Frontend |
| 1.4.9 | Build Admin User Management (list, search, assign roles) | 1 day | Frontend |
| 1.4.10 | Deploy to staging environment | 1 day | DevOps |

### Phase 1 Milestone Deliverables

| Milestone | Deliverable | Target |
|-----------|------------|--------|
| **M1** | Auth + Admin + Directory MVP | End of Month 1 |
| **M2** | Homepage redesign + SEO live | End of Month 2 |

---

## Phase 2 — Core Modules (Months 3–4)

### Month 3: Rich Profiles, Search & News

**Sprint 5 (Week 9–10): Rich Business Profiles + Search**

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 2.1.1 | Build photo gallery upload API (max 10 photos, S3) | 2 days | Backend |
| 2.1.2 | Implement Reviews API (create, read, moderate) | 2 days | Backend |
| 2.1.3 | Build geolocation search API (PostGIS, configurable radius) | 2 days | Backend |
| 2.1.4 | Implement fuzzy search + autocomplete API | 2 days | Backend |
| 2.1.5 | Build Rich Business Profile page (gallery, hours, map, contacts) | 3 days | Frontend |
| 2.1.6 | Build Review/Rating component (submit + display) | 2 days | Frontend |
| 2.1.7 | Build full-page Search UI (autocomplete, filters, results) | 3 days | Frontend |
| 2.1.8 | Add LocalBusiness Schema JSON-LD on profile pages | 1 day | Frontend |
| 2.1.9 | Implement Google Maps embed on profile pages | 1 day | Frontend |
| 2.1.10 | Build "Nearby Listings" using browser geolocation | 1 day | Frontend |

**Sprint 6 (Week 11–12): News Portal**

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 2.2.1 | Design News DB schema (articles, categories, tags, authors) | 1 day | Backend |
| 2.2.2 | Build News CRUD API with publishing workflow | 2 days | Backend |
| 2.2.3 | Implement scheduled publishing (Celery tasks) | 1 day | Backend |
| 2.2.4 | Build article view counter | 0.5 day | Backend |
| 2.2.5 | Build News index page (categories, trending, latest) | 2 days | Frontend |
| 2.2.6 | Build News article page (full content, author, related) | 2 days | Frontend |
| 2.2.7 | Build Breaking News ticker component | 1 day | Frontend |
| 2.2.8 | Add NewsArticle Schema JSON-LD | 0.5 day | Frontend |
| 2.2.9 | Build Admin News Management (CRUD, moderation, scheduling) | 2 days | Frontend |
| 2.2.10 | Implement social sharing (Facebook, Twitter/X, WhatsApp) | 1 day | Frontend |

### Month 4: User Dashboard, Ads & Payments

**Sprint 7 (Week 13–14): User Dashboard + Notifications**

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 2.3.1 | Build Notifications API (create, read, mark-read) | 2 days | Backend |
| 2.3.2 | Implement email notifications (SendGrid/SES) | 2 days | Backend |
| 2.3.3 | Implement SMS notifications (Twilio) | 1 day | Backend |
| 2.3.4 | Build Celery async notification tasks | 1 day | Backend |
| 2.3.5 | Build User Dashboard layout (sidebar, sections) | 2 days | Frontend |
| 2.3.6 | Build My Listings section | 1 day | Frontend |
| 2.3.7 | Build Notifications center (in-app) | 1 day | Frontend |
| 2.3.8 | Build Saved/Favorites section | 1 day | Frontend |
| 2.3.9 | Build Profile Settings page | 1 day | Frontend |
| 2.3.10 | Build Activity Log section | 1 day | Frontend |

**Sprint 8 (Week 15–16): Advertisements + Trending + Payments**

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 2.4.1 | Design Advertisements, Ad Packages DB schema | 1 day | Backend |
| 2.4.2 | Build Advertisement CRUD API (submit, review, schedule) | 2 days | Backend |
| 2.4.3 | Implement impression/click tracking API | 1 day | Backend |
| 2.4.4 | Integrate Razorpay payment gateway | 3 days | Backend |
| 2.4.5 | Build Trending Listings purchase flow API | 1 day | Backend |
| 2.4.6 | Implement auto-expiry for trending listings (Celery) | 1 day | Backend |
| 2.4.7 | Build Ad submission form (creative upload, package selection) | 2 days | Frontend |
| 2.4.8 | Build Admin Ad Management (queue, preview, approve/reject) | 2 days | Frontend |
| 2.4.9 | Build Trending Listings display with "Featured" badge | 1 day | Frontend |
| 2.4.10 | Build payment checkout flow (Razorpay UI) | 2 days | Frontend |

### Phase 2 Milestone Deliverables

| Milestone | Deliverable | Target |
|-----------|------------|--------|
| **M3** | Rich profiles + Search + News | End of Month 3 |
| **M4** | User Dashboard + Ads + Trending | End of Month 4 |

---

## Phase 3 — Extended Modules (Months 5–6)

### Month 5: Job Portal + Blog + Events

**Sprint 9 (Week 17–18): Job Portal**

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 3.1.1 | Design Jobs, Applications DB schema | 1 day | Backend |
| 3.1.2 | Build Jobs CRUD API with moderation workflow | 2 days | Backend |
| 3.1.3 | Build Job Application API (resume upload) | 1 day | Backend |
| 3.1.4 | Build Job search with filters (keyword, location, type, salary) | 1 day | Backend |
| 3.1.5 | Build Job listing page (search, filter, cards) | 2 days | Frontend |
| 3.1.6 | Build Job detail page with Apply CTA | 1 day | Frontend |
| 3.1.7 | Build Job post form | 1 day | Frontend |
| 3.1.8 | Add JobPosting Schema JSON-LD | 0.5 day | Frontend |
| 3.1.9 | Build Admin Job Management | 1 day | Frontend |
| 3.1.10 | Build Blog CRUD API with publishing workflow | 2 days | Backend |

**Sprint 10 (Week 19–20): Blog + Events**

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 3.2.1 | Build Blog index page with categories/tags | 2 days | Frontend |
| 3.2.2 | Build Blog post page (ToC, related, sharing) | 2 days | Frontend |
| 3.2.3 | Add BlogPosting Schema JSON-LD | 0.5 day | Frontend |
| 3.2.4 | Design Events DB schema | 0.5 day | Backend |
| 3.2.5 | Build Events CRUD API with moderation | 2 days | Backend |
| 3.2.6 | Build Events listing page with calendar view | 2 days | Frontend |
| 3.2.7 | Build Event detail page (map, registration, sharing) | 1 day | Frontend |
| 3.2.8 | Add Event Schema JSON-LD | 0.5 day | Frontend |
| 3.2.9 | Build Admin Event Management | 1 day | Frontend |
| 3.2.10 | Build Admin Blog Management | 1 day | Frontend |

### Month 6: Tourist Places, NGO, Startups, Clubs, CMS

**Sprint 11 (Week 21–22): Tourist Places + NGO Redesign**

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 3.3.1 | Build Tourist Places API (gallery, maps, reviews) | 2 days | Backend |
| 3.3.2 | Redesign Tourist Places listing page | 2 days | Frontend |
| 3.3.3 | Build Tourist Place detail page (gallery, map, nearby) | 2 days | Frontend |
| 3.3.4 | Redesign NGO Directory (cards, filters, search) | 2 days | Frontend |
| 3.3.5 | Build Startup Ecosystem profiles API | 1 day | Backend |
| 3.3.6 | Build Startup listing and profile pages | 2 days | Frontend |

**Sprint 12 (Week 23–24): Clubs, CMS + Full Integration**

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 3.4.1 | Build Club Activities API (profiles, events, gallery) | 1 day | Backend |
| 3.4.2 | Build Club listing and detail pages | 2 days | Frontend |
| 3.4.3 | Build CMS pages (About Jalgaon, Culture, Healthcare, etc.) | 2 days | Frontend |
| 3.4.4 | Build Admin CMS Page editor | 1 day | Frontend |
| 3.4.5 | Build Media Library (upload, organize, CDN) | 2 days | Full Stack |
| 3.4.6 | Implement Audit Logs (immutable admin action log) | 1 day | Backend |
| 3.4.7 | Full integration testing | 2 days | QA |
| 3.4.8 | Homepage population (all sections live with real data) | 1 day | Full Stack |

### Phase 3 Milestone Deliverables

| Milestone | Deliverable | Target |
|-----------|------------|--------|
| **M5** | Job Portal + Blog + Events live | End of Month 5 |
| **M6** | All modules live, full SEO index | End of Month 6 |

---

## Phase 4 — Optimization & Scale (Month 7+)

### Month 7–8: Performance & Security

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 4.1.1 | Integrate Elasticsearch for advanced search | 1 week | Backend |
| 4.1.2 | Performance audit (Lighthouse, Core Web Vitals) | 3 days | Frontend |
| 4.1.3 | Security penetration testing (OWASP ZAP) | 3 days | Security |
| 4.1.4 | Load testing with k6 (1,000 concurrent users) | 2 days | DevOps |
| 4.1.5 | Implement PWA (Service Worker, offline fallback, manifest) | 3 days | Frontend |
| 4.1.6 | Build Analytics Dashboard (GA4 + custom metrics) | 1 week | Full Stack |
| 4.1.7 | Set up Prometheus + Grafana monitoring | 2 days | DevOps |
| 4.1.8 | Database optimization (indexes, query profiling) | 2 days | Backend |

### Month 9+: Mobile App Prep & Growth

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 4.2.1 | Push notification system (FCM backend) | 1 week | Backend |
| 4.2.2 | A/B testing infrastructure | 1 week | Full Stack |
| 4.2.3 | Seed database with 500+ pre-verified listings | 1 week | Content |
| 4.2.4 | Content marketing launch (blog, news, city guides) | Ongoing | Content |
| 4.2.5 | React Native mobile app development (Android + iOS) | 8–12 weeks | Mobile |

### Phase 4 Milestone Deliverables

| Milestone | Deliverable | Target |
|-----------|------------|--------|
| **M7+** | Performance, security, app prep | Ongoing |

---

## Milestone Summary

| Milestone | Description | Target Date | Key Deliverables |
|-----------|-------------|-------------|-----------------|
| **M1** | Auth + Admin + Directory MVP | End of Month 1 | OTP login, RBAC, basic admin, category CRUD, listing CRUD |
| **M2** | Homepage redesign + SEO live | End of Month 2 | New homepage, footer, sitemap, schema, staging deploy |
| **M3** | Rich profiles + Search + News | End of Month 3 | Photo gallery, reviews, geo search, autocomplete, news portal |
| **M4** | User Dashboard + Ads + Trending | End of Month 4 | Dashboard, notifications, ad system, Razorpay payments |
| **M5** | Job Portal + Blog + Events live | End of Month 5 | Job search/apply, blog with ToC, event calendar |
| **M6** | All modules live, full SEO index | End of Month 6 | Tourist, NGO, startups, clubs, CMS, media library, audit logs |
| **M7+** | Performance, security, app prep | Ongoing | Elasticsearch, PWA, monitoring, load testing, mobile app |

---

## Team Requirements (Estimated)

| Role | Count | Phase |
|------|-------|-------|
| Frontend Developer (Next.js) | 2 | All phases |
| Backend Developer (Django) | 2 | All phases |
| UI/UX Designer | 1 | Phase 1–3 |
| DevOps Engineer | 1 (part-time) | All phases |
| QA Engineer | 1 | Phase 2–4 |
| Content Manager | 1 | Phase 3+ |
| Project Manager | 1 | All phases |

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low initial listing data | Platform appears empty | Seed 500+ listings before launch; free premium 3 months |
| OTP delivery failures | Users can't log in | Email OTP fallback; retry with alternate Twilio number |
| Search quality poor | Irrelevant results | Synonym dictionaries, category boosting, curated popular searches |
| SEO indexing delay | Months to rank | Submit sitemap day 1; publish blog content from day 1 |
| Payment failures | Revenue lost | Thorough webhook testing; idempotency keys; manual fallback |
| Admin overwhelmed | Pending queue grows | Auto-approval for verified businesses; priority inbox |
| Performance at scale | Slow site | Load test before launch; Redis caching; ISR aggressively |
| Mobile app scope creep | Delays Phase 4 | Defer app strictly; PWA as interim solution |

---

*Document Version: 1.0 | Derived from Jalgaon.com PRD v1.0*
