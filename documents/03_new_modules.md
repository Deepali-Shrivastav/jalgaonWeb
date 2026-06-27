# Jalgaon.com — New Modules Specification

> **Source:** PRD v1.0 | **Purpose:** All new modules to build from scratch

---

## Module Overview

| # | Module | Priority | Phase | Dependencies |
|---|--------|----------|-------|-------------|
| MOD-01 | Job Portal | High | 3 | Auth, RBAC, Admin |
| MOD-02 | Blog Module | Medium | 3 | Auth, RBAC |
| MOD-03 | Startup Ecosystem | Medium | 3 | Auth, Directory |
| MOD-04 | Club Activities | Low | 3 | Auth, Events |
| MOD-05 | Notification System | Medium | 2 | Auth, Twilio, SendGrid |
| MOD-06 | Payment & Subscription | High | 2 | Auth, Razorpay |
| MOD-07 | Advertisement System | High | 2 | Auth, Admin, Payment |
| MOD-08 | City Information (CMS) | Low | 3 | Admin Dashboard |
| MOD-09 | User Dashboard | High | 2 | Auth, all modules |
| MOD-10 | Admin Dashboard | Critical | 1 | Auth, RBAC |
| MOD-11 | Media Library | Medium | 2 | AWS S3/R2, CDN |
| MOD-12 | Audit Logs | Medium | 2 | Auth, RBAC |
| MOD-13 | Analytics Dashboard | Medium | 4 | All modules |

---

## MOD-01: Job Portal

**Priority:** High | **Phase:** 3 | **Effort:** 3–4 weeks

### Features
- Job post form: title, company, location, salary range, description, requirements, deadline
- Admin approval required before job goes live
- Job search with keyword, location, category, salary, and job type filters
- Bookmark/save jobs to user profile
- Apply via platform (resume upload or external URL)
- Job poster receives notification on new applications
- Job expiry after deadline with auto-archival
- JobPosting Schema JSON-LD on each job page

### DB Table: `jobs`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Primary key |
| posted_by | UUID FK → users | Job poster |
| listing_id | UUID FK → listings NULL | Associated business |
| title | VARCHAR(255) | Job title |
| company | VARCHAR(255) | Company name |
| location | VARCHAR(255) | Job location |
| type | ENUM | full_time, part_time, contract, internship |
| salary_min / salary_max | INT NULL | Salary range |
| description | TEXT | Full description |
| requirements | TEXT | Qualifications |
| deadline | DATE NULL | Application deadline |
| status | ENUM | pending, active, expired, rejected |

### API Endpoints
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/v1/jobs` | Public |
| POST | `/api/v1/jobs` | Auth |
| GET | `/api/v1/jobs/{id}` | Public |
| POST | `/api/v1/jobs/{id}/apply` | Auth |

---

## MOD-02: Blog Module

**Priority:** Medium | **Phase:** 3 | **Effort:** 2–3 weeks

### Features
- Rich text editor with image embedding
- Auto-generated Table of Contents from headings
- Category and tag taxonomy, author profiles
- BlogPosting Schema JSON-LD
- Related posts, social sharing, scheduled publishing
- Publishing workflow: Draft → Review → Published

---

## MOD-03: Startup Ecosystem

**Priority:** Medium | **Phase:** 3 | **Effort:** 2 weeks

### Features
- Startup profile: name, logo, founder(s), industry, founding year
- Social links (LinkedIn, Twitter/X, website)
- Search and filter by industry, stage
- Featured startups on homepage

---

## MOD-04: Club Activities

**Priority:** Low | **Phase:** 3 | **Effort:** 2 weeks

### Features
- Club profile: name, description, category
- Activity/event listing per club
- Photo gallery, member listing
- Search and filter by category

---

## MOD-05: Notification System

**Priority:** Medium | **Phase:** 2 | **Effort:** 2–3 weeks

### Channels
- **In-App** — Real-time in dashboard
- **Email** — SendGrid/AWS SES
- **SMS** — Twilio
- **Push** (Future) — FCM

### Notification Types
| Type | Trigger |
|------|---------|
| listing_approved | Admin approves listing |
| trending_expiring | Expiring in 3 days |
| new_review | Review received |
| job_application | New job application |
| payment_success/failed | Payment processed |

---

## MOD-06: Payment & Subscription

**Priority:** High | **Phase:** 2 | **Effort:** 3–4 weeks

### Gateway: Razorpay (UPI, Cards, NetBanking, Wallets)

### Revenue Streams
| Stream | Description |
|--------|-------------|
| Trending Listings | Pay to appear at top with badges |
| Ad Packages | Banner ads, sponsored content |
| Premium Profiles | Enhanced analytics, photos, videos |
| Job Posting Fees | Per post or subscription |
| Event Promotion | Featured event slots |

---

## MOD-07: Advertisement System

**Priority:** High | **Phase:** 2 | **Effort:** 3–4 weeks

### Features
- Self-serve ad request with creative upload
- Admin approve/reject/revision workflow
- Scheduling with start/end dates
- Impression & click tracking, CTR analytics
- Placements: Homepage Hero, Category Banner, Sidebar, Between Listings

---

## MOD-08: City Information (CMS)

**Priority:** Low | **Phase:** 3 | **Effort:** 1–2 weeks

### Pages
About Jalgaon, Culture & Heritage, Healthcare Directory, Education Directory, Emergency Contacts, Government Offices

---

## MOD-09: User Dashboard

**Priority:** High | **Phase:** 2 | **Effort:** 3 weeks

### Sections
My Listings, My Jobs, My Events, Ad Requests, Saved/Favorites, Notifications, Profile Settings, Subscription & Payments, Activity Log

---

## MOD-10: Admin Dashboard

**Priority:** Critical | **Phase:** 1 | **Effort:** 4–5 weeks

### Modules
Dashboard Home (real-time stats), User Management, Listing Management, Category Management, Content Management, Advertisement Management, Trending Listings, Job Management, Review Moderation, Payments, SEO Manager, Media Library, Notifications, Reports, Roles & Permissions, Audit Logs, Settings

---

## MOD-11: Media Library

**Priority:** Medium | **Phase:** 2 | **Effort:** 2 weeks

Auto WebP conversion, CDN delivery, folder/tag organization, bulk upload, 5MB max, malware scanning

---

## MOD-12: Audit Logs

**Priority:** Medium | **Phase:** 2 | **Effort:** 1 week

Immutable admin action logs, searchable/filterable, CSV export, 1-year retention

---

## MOD-13: Analytics Dashboard

**Priority:** Medium | **Phase:** 4 | **Effort:** 2–3 weeks

GA4 integration, custom metrics dashboard, traffic/listing/revenue reports, SEO ranking tracker

---

*Document Version: 1.0 | Derived from Jalgaon.com PRD v1.0*
