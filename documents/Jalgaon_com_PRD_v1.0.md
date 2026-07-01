PRODUCT REQUIREMENTS DOCUMENT

Jalgaon.com — City Digital Ecosystem Platform

Version 1.0  |  June 2026  |  Confidential

| Prepared By | Jalgaon.com Product Team |
| --- | --- |
| Document Type | Product Requirements Document (PRD) |
| Platform | Jalgaon.com — Local City Ecosystem |
| Target Platform | Web (Next.js) + Android/iOS (Future) |
| Tech Stack | Next.js + Django REST + PostgreSQL |
| Status | Draft for Development Handover |

SimpleSphere Technologies  |  Jalgaon, Maharashtra, India

# Table of Contents

# 1. Executive Summary

Jalgaon.com is a city-based digital business directory and information portal serving Jalgaon, Maharashtra. The platform currently enables local businesses, NGOs, tourists, and residents to discover services, events, and information about the city.

This document defines the complete requirements for upgrading Jalgaon.com from a basic business directory into a comprehensive Local City Ecosystem Platform — combining the capabilities of JustDial, IndiaMART, Google Business, a News Portal, Job Portal, Event Portal, and City Information Portal into a single, highly optimized platform.

## 1.1 Vision

To become the #1 local digital platform for Jalgaon — the most trusted, comprehensive, and SEO-dominant city ecosystem — enabling residents, businesses, tourists, and organizations to connect, discover, and thrive.

## 1.2 Mission

Build a robust, scalable, mobile-first platform that empowers every business, event organizer, job seeker, NGO, and citizen in Jalgaon with a premium digital presence and seamless discovery experience.

## 1.3 Key Goals

Modernize the UI/UX to a premium, professional standard comparable to JustDial and Google Business

Introduce OTP-based authentication replacing existing login

Build a fully independent Admin Dashboard for non-technical management

Implement Role-Based Access Control (RBAC) across all modules

Launch Job Portal, News Portal, Blog, Startup Ecosystem, and Club Activities modules

Achieve dominant local SEO rankings for all Jalgaon-related business searches

Build PWA-ready, mobile-first architecture as the foundation for future Android/iOS apps

Monetize through Trending Listings, Advertisements, and Subscription Packages

# 2. Business Objectives

## 2.1 Primary Objectives

Establish Jalgaon.com as the definitive local search and discovery platform for Jalgaon city

Increase monthly active users (MAU) to 50,000+ within 12 months of relaunch

Onboard 5,000+ verified business listings within 6 months

Generate sustainable revenue through B2B advertising, trending listings, and premium subscriptions

Rank Page 1 on Google for all major local search queries (e.g., 'hospitals in Jalgaon', 'IT company in Jalgaon')

## 2.2 Revenue Streams

| Revenue Stream | Description |
| --- | --- |
| Trending Listings (Paid) | Businesses pay to appear at top of search results with badges |
| Advertisement Packages | Banner ads, sponsored content, homepage ads |
| Premium Business Profiles | Enhanced profiles with analytics, photos, videos |
| Job Posting Fees | Employers pay per job post or subscription |
| Event Promotion | Event organizers pay for featured event slots |
| Newsletter Sponsorships | Branded placements in weekly city newsletter |

## 2.3 Success Metrics (KPIs)

| Metric | Target | Timeline |
| --- | --- | --- |
| Total Listings | 0 → 5,000+ | 6 months |
| Monthly Active Users | 0 → 50,000+ | 12 months |
| Page 1 Rankings | 0 → 500+ keywords | 9 months |
| Revenue MRR | ₹0 → ₹2L+ | 12 months |
| Mobile Traffic Share | >60% | 3 months |
| Avg. Page Load (Core Web Vitals) | <2.5s LCP | 3 months |

# 3. Existing System Analysis

## 3.1 Current Platform Overview

Based on a full audit of the existing Jalgaon.com website, the following structure and features are currently live:

### 3.1.1 Navigation Structure

Top Navigation: Home, Advertise, Add Listing, News, Login

Side Navigation (vertical tabs): NGO, Directory, Tourist Places, Events

Bottom Navigation (mobile): Home, Advertise, Add Listing, News

Search Bar: Basic keyword search with 'Select City' dropdown

### 3.1.2 Homepage Sections

Hero Slider: Single slide with 'List Your Business on Jalgaon.com' CTA

Category Grid: 20 top-level categories displayed as image + label tiles

Subcategory Sections: Expandable subcategories per category (e.g., Automotive > Car Dealerships, Two-Wheeler Dealerships)

Related Articles Section: 2-item horizontal carousel at page bottom

### 3.1.3 Business Categories (Existing — All to be Preserved)

| Category | Subcategories |
| --- | --- |
| Automotive | Car Dealerships, Two-Wheeler Dealerships, Dealerships |
| Agriculture Services | Crop Production, Animal Husbandry, Dairy Farming, Poultry Farm |
| Construction & Real Estate | Real Estate Agents, Architects, Building Materials Suppliers |
| Beauty & Wellness | Beauty Salons/Parlour, Spas, Barber |
| Business Services | Accounting & Bookkeeping, Legal Services, Business Consultants |
| Education | Coaching Centres, Technical Institutes, Language Schools |
| Electronics & Appliances | Electronics Shops, Mobile Shops, Computer Shops |
| Finance & Insurance | Banks, Financial Consultants |
| Food & Beverages | Restaurants, Cafes, Bakeries, Dhaba |
| Healthcare | Pharmacies, Clinics, Hospitals |
| Home Services | Cleaning Services, Pest Control |
| Hospitality | Hotels, Motels |
| IT & Software | Software Development, IT Services |
| Manufacturing | Food & Beverage, Textile, Furniture, Machinery |
| Media & Entertainment | Music & Dance Schools, Art Galleries |
| Personal Care | Videography Services, Dry Cleaners |
| Retail | Grocery Shops, General Store, Footwear, Ice-Cream Shops |
| Sports & Recreation | Sports Goods Shops, Fitness Equipment |
| Transportation | Taxi Services, Public Transportation |
| Utilities | Water Tank Supply, Water Jar Supply |
| Wholesale & Distributors | Distribution Services, Warehousing |
| Miscellaneous | Driving School, Zerox Shops |

### 3.1.4 Other Existing Modules

NGO Directory — Accessible via vertical side tab

Tourist Places — Accessible via vertical side tab

Events — Accessible via vertical side tab

News — Accessible via top navigation

Advertise — Page for ad inquiries

Add Listing — Business submission form

Login — Standard login page

# 4. Problems in Current System

## 4.1 UI/UX Problems

Homepage hero is a single static slide with no dynamic content or strong CTA hierarchy

Category tiles use stock images — no professional illustrations or icons

Mobile layout shows vertical side-tabs overlapping main content area

No hero search bar — search is placed in a secondary position

Bottom navigation on mobile is incomplete (missing Tourist Places, NGO, Events as direct tabs)

Typography is inconsistent; no clear visual hierarchy between headings and body text

Related Articles section at the bottom uses a basic carousel with poor UX

No featured/trending listings section on homepage

No recent news, upcoming events, or city stats visible on homepage

Footer is absent — no contact, social links, legal pages, or newsletter signup

## 4.2 Functional Problems

Authentication relies on traditional email/password — OTP login not supported

No user dashboard after login for managing listings, saved items, or notifications

Business profiles lack rich fields: no business hours, WhatsApp button, social links, photos gallery, or Google Maps embed

No review/rating system for businesses

No claim business feature

No 'Nearby Listings' or geolocation-based search

News module exists but lacks categories, tags, authors, breaking news, AMP, or scheduling

No Blog module

No Job Portal

No Startup Ecosystem module

No Club Activities module

No Advertisement management system — just a static Advertise page

No Trending Listings monetization

No Subscription/Payment integration

## 4.3 Technical Problems

Unknown current tech stack — likely not optimized for SSR/SSG required for SEO

No structured data (Schema.org JSON-LD) on any page — critical SEO gap

No dynamic metadata (Open Graph, Twitter Cards) for social sharing

No sitemap.xml or robots.txt optimization visible

No CDN or image optimization pipeline

No separate Admin Dashboard — likely Django admin only

No RBAC — no distinction between Admin, Editor, Business Owner roles

No API versioning or Swagger documentation

No audit logging

No analytics integration

No Docker/CI-CD deployment pipeline

# 5. Proposed Improvements

## 5.1 Design & UI/UX Improvements

| Page/Component | Improvement |
| --- | --- |
| Homepage | Full redesign: modern hero slider, prominent search bar, trending listings, news, events, categories grid |
| Navigation | Desktop mega-menu, mobile bottom nav with 5 tabs, sticky header with smart scroll |
| Category Pages | Filter sidebar, grid/list toggle, sort options, pagination, breadcrumbs |
| Business Profile | Rich profile: photos gallery, business hours, Google Maps, WhatsApp CTA, reviews |
| Search Interface | Full-page search with autocomplete, category filters, location, radius |
| Footer | Multi-column footer with navigation, social links, newsletter signup, legal pages |
| Typography | Unified type scale using Inter/Plus Jakarta Sans; clear H1-H6 hierarchy |
| Color System | Primary blue palette with semantic colors; consistent card shadows and borders |

## 5.2 New Modules to Build

Job Portal — Post, search, filter, and apply for jobs; admin moderation workflow

Blog Module — SEO-optimized long-form content with Table of Contents and schema markup

Startup Ecosystem — Profiles for local startups with founder info, industry, and social links

Club Activities — Community clubs with events, gallery, and member management

Notification System — Email, SMS, and browser push notification infrastructure

Payment & Subscription System — Razorpay/Stripe integration for listing packages

Advertisement System — Full self-serve ad platform with creative upload, package selection, and analytics

City Information (CMS) — Static pages for History, Culture, Healthcare, Education, Emergency Contacts

## 5.3 Pages Requiring Full Redesign

Homepage — Complete overhaul (currently bare and incomplete)

Business Profile/Listing Detail — Needs rich media, maps, reviews, contact actions

Category Listing Page — Needs filters, grid, sort, and location search

Search Results Page — Needs full search interface with faceted filtering

User Dashboard — Needs to be built from scratch

Admin Dashboard — Needs to be built as a completely separate application

## 5.4 Pages Requiring UI Improvement (Preserve Functionality)

NGO Directory — Improve card design, add filters and search

Tourist Places — Add gallery, maps, review widget, nearby places

Events Page — Add calendar view, category filters, registration CTA

News Page — Add categories, breaking news ticker, author byline, related articles

Add Listing Form — Multi-step wizard with progress indicator

Advertise Page — Replace static page with dynamic self-serve ad request form

# 6. Functional Requirements

## 6.1 Authentication Module

FR-AUTH-01: OTP login via mobile number (primary)

FR-AUTH-02: OTP login via email (optional/fallback)

FR-AUTH-03: Twilio SMS gateway integration for OTP delivery

FR-AUTH-04: OTP expiry of 5 minutes; maximum 3 retry attempts

FR-AUTH-05: Rate limiting — maximum 5 OTP requests per phone per hour

FR-AUTH-06: JWT-based session with configurable expiry (7 days default)

FR-AUTH-07: 'Remember Me' option extending token to 30 days

FR-AUTH-08: Device management — list and revoke active sessions

FR-AUTH-09: 'Logout from all devices' action

FR-AUTH-10: CAPTCHA on OTP request form to prevent spam

FR-AUTH-11: Automatic account creation on first successful OTP verification

## 6.2 Business Directory

FR-DIR-01: Browse listings by category and subcategory

FR-DIR-02: Advanced search with keyword, location, and radius filters

FR-DIR-03: Business profile with: name, description, address, phone, website, email, WhatsApp, social links, photos gallery (max 10), business hours, Google Maps embed, categories

FR-DIR-04: Star rating (1–5) and text reviews per listing

FR-DIR-05: 'Claim Business' workflow for unverified listings

FR-DIR-06: 'Report Business' feature with reason selection

FR-DIR-07: Favorite/Save listing to user profile

FR-DIR-08: Share listing via native share API

FR-DIR-09: 'Nearby Listings' using browser geolocation API

FR-DIR-10: SEO-friendly URLs: /business/{city}/{category}/{slug}

FR-DIR-11: Schema.org LocalBusiness JSON-LD on every profile page

FR-DIR-12: Trending Listings displayed above organic results with 'Featured' badge

## 6.3 Search Engine

FR-SRCH-01: Full-text keyword search across business names, descriptions, categories

FR-SRCH-02: Fuzzy search to handle typos and approximate matches

FR-SRCH-03: Autocomplete suggestions as user types (debounced, <200ms)

FR-SRCH-04: Location-based search with configurable radius (1km, 5km, 10km, 25km)

FR-SRCH-05: Recent search history (stored per user, max 10 items)

FR-SRCH-06: Popular searches displayed below empty search bar

FR-SRCH-07: Synonym support (e.g., 'doctor' returns 'clinic' results)

FR-SRCH-08: Category and subcategory filter chips in results page

FR-SRCH-09: Sort results by: Relevance, Rating, Distance, Newest

## 6.4 News Portal

FR-NEWS-01: News articles with categories, tags, author, publish date, featured image

FR-NEWS-02: Breaking News ticker on homepage and news index

FR-NEWS-03: Trending News section (by views in last 24h)

FR-NEWS-04: Related News widget on article pages

FR-NEWS-05: Comment system (moderation-required) on articles

FR-NEWS-06: Social sharing (Facebook, Twitter/X, WhatsApp) on every article

FR-NEWS-07: AMP-ready article templates for mobile Google search

FR-NEWS-08: Publishing workflow: Draft → Editor Review → Published

FR-NEWS-09: Scheduled publishing (publish at future date/time)

FR-NEWS-10: Article view counter

FR-NEWS-11: Article Schema (Article JSON-LD) on every news page

## 6.5 Job Portal

FR-JOB-01: Job post form: title, company, location, salary range, description, requirements, deadline

FR-JOB-02: Admin approval required before job goes live

FR-JOB-03: Job search with keyword, location, category, salary, and job type filters

FR-JOB-04: Bookmark/save jobs to user profile

FR-JOB-05: Apply for job via platform (resume upload or external URL)

FR-JOB-06: Job poster receives notification on new applications

FR-JOB-07: Job expiry after deadline date with auto-archival

FR-JOB-08: JobPosting Schema JSON-LD on each job page

## 6.6 Event Module

FR-EVT-01: Event submission form: name, date, time, venue, description, organizer, registration link, images

FR-EVT-02: Admin approval mandatory before event goes live

FR-EVT-03: Upcoming events feed on homepage

FR-EVT-04: Calendar view of events

FR-EVT-05: Past events archive

FR-EVT-06: Google Maps embed for event venue

FR-EVT-07: Event sharing via social media and WhatsApp

FR-EVT-08: Event Schema JSON-LD on each event page

## 6.7 Advertisement Module

FR-ADV-01: Advertiser submits ad request: ad type, creative upload, target page, package, duration

FR-ADV-02: Admin review: approve, reject, or request revision

FR-ADV-03: Ad scheduling with start and end dates

FR-ADV-04: Impression and click tracking per ad

FR-ADV-05: Analytics report for advertiser: impressions, clicks, CTR, spend

FR-ADV-06: Ad placements: Homepage Hero Banner, Category Page Banner, Sidebar, Between Listings

FR-ADV-07: Admin can enable/disable specific ad slots globally

## 6.8 User Dashboard

FR-DASH-01: My Listings — view, edit, and manage own business listings

FR-DASH-02: My Jobs — view posted jobs and applicants

FR-DASH-03: My Events — view submitted events

FR-DASH-04: Advertisement Requests — status of submitted ad requests

FR-DASH-05: Saved/Favorite Listings

FR-DASH-06: Notifications — in-app notification center

FR-DASH-07: Profile Settings — name, photo, contact, preferences

FR-DASH-08: Subscription & Payments — view active plan, invoices, upgrade

FR-DASH-09: Activity Log — recent actions

# 7. Non-Functional Requirements

## 7.1 Performance

NFR-PERF-01: Homepage Largest Contentful Paint (LCP) < 2.5 seconds

NFR-PERF-02: Time to First Byte (TTFB) < 800ms on all SSR pages

NFR-PERF-03: All Core Web Vitals (LCP, FID/INP, CLS) must pass Google 'Good' threshold

NFR-PERF-04: API response time < 300ms for 95th percentile under normal load

NFR-PERF-05: System must handle 1,000 concurrent users without degradation

NFR-PERF-06: Image delivery via CDN with WebP auto-conversion

## 7.2 Scalability

NFR-SCALE-01: Horizontal scaling via Docker containers + Nginx load balancer

NFR-SCALE-02: Database connection pooling (PgBouncer) for PostgreSQL

NFR-SCALE-03: Redis caching layer for frequently accessed data

NFR-SCALE-04: Stateless API design enabling multi-instance deployment

## 7.3 Security

NFR-SEC-01: JWT tokens with RS256 signing algorithm

NFR-SEC-02: HTTPS enforced on all routes

NFR-SEC-03: CSRF protection on all state-changing endpoints

NFR-SEC-04: XSS protection via Content Security Policy headers

NFR-SEC-05: SQL injection protection via Django ORM parameterized queries

NFR-SEC-06: API rate limiting: 100 req/min per IP (unauthenticated), 500 req/min (authenticated)

NFR-SEC-07: Audit logs for all admin actions (immutable, timestamped)

NFR-SEC-08: Database backups: daily automated snapshots, 30-day retention

## 7.4 Availability

NFR-AVAIL-01: Target 99.9% uptime (< 8.7 hours downtime/year)

NFR-AVAIL-02: Zero-downtime deployments via rolling update strategy

NFR-AVAIL-03: Health check endpoints for all services

## 7.5 Compliance

NFR-COMP-01: GDPR-compatible data deletion on user request

NFR-COMP-02: Privacy Policy and Terms of Service pages required

NFR-COMP-03: Cookie consent banner for EU visitors

# 8. User Roles & RBAC Matrix

## 8.1 Role Definitions

| Role | Permissions Summary |
| --- | --- |
| Super Admin | Full platform control including settings, roles, billing, and all modules |
| Admin | Manages all content, users, listings, ads, and approvals; cannot change roles |
| Content Manager | Creates and publishes listings, news, blogs, events; cannot manage users or payments |
| News Editor | Creates and publishes news and blog articles only |
| SEO Manager | Edits metadata, slugs, sitemaps, canonical tags across all content types |
| Moderator | Reviews and approves/rejects user-submitted content, reviews, and reports |
| Support Executive | Views tickets, responds to contact forms, view-only access to listings |
| Advertiser | Submits ad requests, uploads creatives, views own analytics |
| Business Owner | Manages own listing(s), posts jobs, submits events, views listing analytics |
| Registered User | Browses platform, submits reviews, saves listings, applies to jobs, submits events |
| Guest | Read-only access to all public content; cannot submit or save anything |

## 8.2 RBAC Permission Matrix

| Permission | Super Admin | Admin | Content Mgr | News Editor | SEO Mgr | Moderator | Support | Advertiser | Biz Owner | Reg. User |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Manage Users | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Manage Roles/Perms | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Manage All Listings | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage Own Listing | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Publish News/Blog | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Edit SEO Metadata | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Approve/Reject Content | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage Advertisements | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| View Analytics | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Manage Payments | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Submit Events/Jobs | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Post Reviews | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Manage Settings | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| View Audit Logs | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Manage CMS Pages | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

# 9. Complete Module Breakdown

## 9.1 Module Inventory

| Module | Key Features | Priority |
| --- | --- | --- |
| Authentication | OTP Login, Session, Device Management | High |
| Business Directory | Listings, Categories, Search, Reviews | Critical |
| Search Engine | Full-text, Fuzzy, Geo, Autocomplete | Critical |
| News Portal | Articles, Categories, Authors, Comments | High |
| Blog Module | Long-form, SEO, Tags, ToC, Schema | Medium |
| Job Portal | Post, Apply, Search, Notifications | High |
| Event Module | Submit, Calendar, Registration, Maps | Medium |
| Tourist Places | Gallery, Maps, Reviews, History | Medium |
| NGO Directory | Profiles, Categories, Search | Medium |
| Startup Ecosystem | Profiles, Founder, Industry, Links | Medium |
| Club Activities | Profiles, Events, Gallery, Members | Low |
| Advertisement System | Self-serve, Creative Upload, Analytics | High |
| Trending Listings | Paid Priority, Badges, Analytics | High |
| User Dashboard | My Content, Saved, Notifications, Profile | High |
| Admin Dashboard | All Modules, CMS, Reports, Settings | Critical |
| RBAC | Roles, Permissions, Policies | Critical |
| Payment & Subscriptions | Razorpay, Plans, Invoices | High |
| Notification System | Email, SMS, Push (future) | Medium |
| SEO Infrastructure | Metadata, Schema, Sitemap, Robots | Critical |
| Analytics | Dashboard, Reports, Traffic | Medium |
| CMS (City Info) | Static Pages, About City, Contacts | Low |
| Media Library | Upload, CDN, WebP, Gallery Mgmt | Medium |
| Audit Logs | Admin Action Logs, Immutable | Medium |

# 10. User Flow Diagrams

## 10.1 New User Registration & Login Flow

1. User visits platform → clicks Login/Register

2. Enters mobile number → system sends OTP via Twilio

3. User enters OTP → system validates (max 3 attempts, 5-min expiry)

4. On first login: profile creation form (name, email optional)

5. JWT token issued → user redirected to homepage or intended destination

6. Dashboard populated with empty modules ready for user actions

## 10.2 Business Listing Submission Flow

1. Logged-in user clicks 'Add Listing'

2. Multi-step form: Step 1 (Basic Info: name, category, phone) → Step 2 (Location & Maps) → Step 3 (Details: hours, website, social) → Step 4 (Photos upload) → Step 5 (Review & Submit)

3. Listing saved as 'Pending Moderation' status

4. Moderator/Admin reviews in Admin Dashboard → Approve or Reject

5. On approval: listing published, user notified via SMS/email

6. Listing appears in search results with applicable category badges

## 10.3 Trending Listing Purchase Flow

1. Business owner visits own listing → clicks 'Boost Listing'

2. Selects Trending Package (duration, banner option)

3. Payment via Razorpay (UPI, Card, NetBanking)

4. On payment success: listing immediately flagged as Trending

5. Listing appears at top of category with 'Featured' badge

6. Auto-expiry after package duration; owner notified 3 days before expiry

## 10.4 Advertisement Submission Flow

1. Advertiser registers/logs in → navigates to 'Advertise' section

2. Selects ad type (Banner, Sidebar, Homepage Hero) and placement

3. Selects package (duration, impressions) → uploads creative (JPG/PNG/GIF, max 2MB)

4. Submits request → Admin Dashboard shows 'Pending Ad Requests'

5. Admin reviews creative: Approve / Reject / Request Revision

6. On approval: ad goes live on scheduled date; advertiser sees analytics dashboard

# 11. Admin Dashboard Flow

## 11.1 Admin Dashboard Modules

Dashboard Home: Real-time stats — Active Users, New Listings (today), Pending Reviews, Revenue, Ad Impressions

User Management: Search, filter, view, deactivate, or delete users; assign roles

Listing Management: Approve/reject new listings; edit any listing; bulk actions; moderation queue

Category Management: Add/edit/delete categories and subcategories; reorder; toggle visibility

Content Management: News articles, blog posts, events, tourist places — full CRUD with editor

Advertisement Management: Ad queue, creative preview, approve/reject, scheduling, impression reports

Trending Listings: View active trending listings, manually add/remove, adjust priority order

Job Management: Approve/reject job posts; view applications

Review Moderation: Approve/reject user reviews; flag and remove inappropriate content

Payment & Subscriptions: View transactions, subscriptions, invoice generation

SEO Manager: Edit meta titles, descriptions, canonical URLs, robots directives per page

Media Library: Upload, organize, and manage all platform images and files

Notifications: Send bulk SMS/email to user segments

Reports & Analytics: Traffic, listings, revenue, SEO metrics, top searches

Roles & Permissions: Create custom roles, assign granular permissions

Audit Logs: Immutable admin action log with timestamp, user, and change details

Settings: Platform config — OTP provider, payment gateway, notification templates, maintenance mode

# 12. UI/UX Recommendations

## 12.1 Design System

| Token | Value |
| --- | --- |
| Primary Color | #1A56DB (Jalgaon Blue) |
| Secondary Color | #1E3A5F (Dark Navy) |
| Accent Color | #F59E0B (Amber for CTAs) |
| Success | #059669 (Emerald) |
| Error | #EF4444 (Red) |
| Background | #F9FAFB (Light Gray) |
| Card Background | #FFFFFF |
| Primary Font | Inter / Plus Jakarta Sans (Google Fonts) |
| Heading Weight | 700 (Bold) for H1-H3, 600 for H4-H6 |
| Base Font Size | 16px (body), 14px (captions), 12px (labels) |
| Border Radius | 8px (cards), 6px (buttons), 4px (inputs) |
| Shadow | 0 2px 8px rgba(0,0,0,0.08) for cards |

## 12.2 Homepage Layout Wireframe Description

Header: Logo left | Search bar center (full width with city selector) | Login/CTA right | Sticky on scroll

Hero Slider: Full-width, 3-5 slides, auto-play, 'Add Your Business' and 'Browse Directory' CTAs

Category Grid: 4-column desktop / 3-col tablet / 2-col mobile icon tiles with labels

Trending Listings: Horizontal scrollable cards with 'Trending' badge, rating, distance

Latest News: 3-column card grid with image, category pill, title, date, read-more

Upcoming Events: Horizontal card strip with event image, date badge, venue, register CTA

Tourist Places: 4-card grid with hero image, overlay title

Job Portal Teaser: 'Latest Jobs in Jalgaon' 3-card strip with job title, company, type badge

Popular Categories: Quick-link pills (Hospitals, Restaurants, Schools, etc.)

NGO Highlight: 3 featured NGOs with logo, mission snippet

City Stats: Animated counter — X Businesses | X Events | X NGOs | X Tourist Places

Newsletter Signup: Email input with subscribe button

Footer: 5-column links | Social icons | Play Store/App Store badges (future) | Legal links

## 12.3 Business Profile Page

Cover photo (full-width) with overlay: business name, rating stars, review count, category badge

Action Bar (sticky on mobile): Call | WhatsApp | Website | Share | Save

About Section: Description, established year, services list

Photo Gallery: Masonry grid, lightbox on click

Business Hours: Weekly schedule with 'Open Now' / 'Closed' status indicator

Location Map: Google Maps embed with 'Get Directions' button

Contact Info: Phone, email, website, social links

Reviews Section: Overall rating breakdown, individual reviews, 'Write Review' CTA

Related Listings: 3-4 similar businesses in same category

## 12.4 Mobile-First Considerations

Bottom navigation bar: Home | Search | Add Listing | Saved | Profile

Search page full-screen takeover on mobile

Card tap targets minimum 44x44px

WhatsApp and Call CTAs always above fold on mobile

Infinite scroll (with 'Load More' fallback) on listing pages

# 13. SEO Strategy

## 13.1 Technical SEO

Next.js SSR for business profiles, category pages, news, events — all content server-rendered

Next.js Static Generation (ISR) for static pages with 1-hour revalidation

Dynamic metadata via generateMetadata() for every route

Canonical URL tags on all pages to prevent duplicate content

XML Sitemap auto-generated and submitted to Google Search Console

robots.txt optimized to allow all important content, block admin/API routes

301 redirects from old URL structures to new SEO-friendly URLs

Image ALT text mandatory on all listing photos

Lazy loading for all below-fold images

Core Web Vitals optimization: LCP < 2.5s, CLS < 0.1, INP < 200ms

## 13.2 Schema.org Structured Data

| Schema Type | Pages Applied | Key Properties |
| --- | --- | --- |
| LocalBusiness | Every business profile page | Full address, hours, rating, phone, geo coords |
| NewsArticle | Every news article | Headline, author, datePublished, image, publisher |
| BlogPosting | Every blog post | Author, datePublished, mainEntityOfPage, keywords |
| Event | Every event page | Name, startDate, endDate, location, organizer |
| JobPosting | Every job listing | Title, datePosted, validThrough, salary, employer |
| BreadcrumbList | All content pages | Hierarchical navigation path |
| Organization | Homepage & About | Platform org info, social profiles, contact |
| FAQPage | Category/City pages | Common questions for featured snippets |

## 13.3 Local SEO Priority Keywords

| Target Keyword | Target Page |
| --- | --- |
| Hospitals in Jalgaon | Category page + individual hospital profiles |
| IT companies in Jalgaon | Category page + individual profiles |
| Restaurants in Jalgaon | Category page + individual profiles |
| Schools in Jalgaon | Category page + individual profiles |
| Events in Jalgaon | Events index page |
| Jobs in Jalgaon | Job portal index |
| Tourist places in Jalgaon | Tourist places index |
| SimpleSphere Technologies | Individual company profile page |
| Real estate agents Jalgaon | Category page |
| Best hotels in Jalgaon | Hospitality category page |

# 14. Database Design

## 14.1 Core Tables — Users

| Column | Type | Description |
| --- | --- | --- |
| id | UUID PK | Primary key (UUID v4) |
| phone | VARCHAR(15) UNIQUE | Mobile number (primary auth identifier) |
| email | VARCHAR(255) NULL | Optional email address |
| name | VARCHAR(255) | Display name |
| avatar_url | TEXT NULL | Cloud storage URL for profile photo |
| role_id | INT FK → roles | Assigned role |
| is_active | BOOLEAN | Account active flag |
| is_verified | BOOLEAN | Phone verified flag |
| created_at | TIMESTAMPTZ | Account creation timestamp |
| last_login | TIMESTAMPTZ NULL | Last successful login |

## 14.2 Core Tables — Listings

| Column | Type | Description |
| --- | --- | --- |
| id | UUID PK | Primary key |
| user_id | UUID FK → users | Owner of the listing |
| name | VARCHAR(255) | Business name |
| slug | VARCHAR(300) UNIQUE | SEO-friendly URL slug |
| category_id | INT FK → categories | Primary category |
| subcategory_id | INT FK → subcategories | Subcategory |
| description | TEXT | Business description |
| phone | VARCHAR(20) | Contact phone |
| whatsapp | VARCHAR(20) NULL | WhatsApp number |
| email | VARCHAR(255) NULL | Contact email |
| website | TEXT NULL | Business website URL |
| address | TEXT | Full address |
| city | VARCHAR(100) | City name |
| lat | DECIMAL(10,8) NULL | Latitude (for geo search) |
| lng | DECIMAL(11,8) NULL | Longitude (for geo search) |
| business_hours | JSONB NULL | Weekly hours object |
| social_links | JSONB NULL | Social media URLs |
| status | ENUM(pending,active,rejected,suspended) | Moderation status |
| is_trending | BOOLEAN | Paid trending flag |
| trending_until | TIMESTAMPTZ NULL | Trending expiry datetime |
| trending_priority | INT DEFAULT 0 | Display priority for trending |
| is_claimed | BOOLEAN | Business claimed by owner |
| avg_rating | DECIMAL(3,2) | Cached average rating |
| review_count | INT DEFAULT 0 | Cached review count |
| views | INT DEFAULT 0 | Profile view counter |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## 14.3 Supporting Tables

| Column | Type | Description |
| --- | --- | --- |
| id | INT PK SERIAL | Auto-increment PK |
| name | VARCHAR(100) | Category name |
| slug | VARCHAR(120) UNIQUE | URL slug |
| icon_url | TEXT NULL | Category icon URL |
| parent_id | INT FK NULL | NULL for top-level; FK to self for subcategory |
| sort_order | INT DEFAULT 0 | Display order |
| is_active | BOOLEAN DEFAULT TRUE | Visibility flag |

| Column | Type | Description |
| --- | --- | --- |
| id | UUID PK | Primary key |
| listing_id | UUID FK → listings | Target listing |
| user_id | UUID FK → users | Reviewer |
| rating | INT CHECK(1-5) | Star rating |
| body | TEXT | Review text |
| status | ENUM(pending,approved,rejected) | Moderation status |
| created_at | TIMESTAMPTZ | Creation timestamp |

| Column | Type | Description |
| --- | --- | --- |
| id | UUID PK | Primary key |
| advertiser_id | UUID FK → users | Advertiser user |
| title | VARCHAR(255) | Ad name/title |
| creative_url | TEXT | Uploaded creative image URL |
| placement | ENUM(hero,sidebar,category,between) | Ad placement slot |
| package_id | INT FK → ad_packages | Selected package |
| status | ENUM(pending,approved,active,paused,expired,rejected) | Ad lifecycle status |
| start_date | DATE NULL | Scheduled start date |
| end_date | DATE NULL | Expiry date |
| impressions | INT DEFAULT 0 | Total impressions count |
| clicks | INT DEFAULT 0 | Total clicks count |
| created_at | TIMESTAMPTZ | Submission timestamp |

| Column | Type | Description |
| --- | --- | --- |
| id | UUID PK | Primary key |
| posted_by | UUID FK → users | Job poster |
| listing_id | UUID FK → listings NULL | Associated business (optional) |
| title | VARCHAR(255) | Job title |
| company | VARCHAR(255) | Company name |
| location | VARCHAR(255) | Job location |
| type | ENUM(full_time,part_time,contract,internship) | Employment type |
| salary_min | INT NULL | Minimum salary |
| salary_max | INT NULL | Maximum salary |
| description | TEXT | Full job description |
| requirements | TEXT | Requirements / qualifications |
| deadline | DATE NULL | Application deadline |
| status | ENUM(pending,active,expired,rejected) | Moderation/lifecycle status |
| created_at | TIMESTAMPTZ | Submission timestamp |

| Column | Type | Description |
| --- | --- | --- |
| id | UUID PK | Primary key |
| user_id | UUID FK → users | Target user |
| type | VARCHAR(50) | Notification type (listing_approved, trending_expiring, etc.) |
| title | VARCHAR(255) | Notification title |
| body | TEXT | Notification body text |
| is_read | BOOLEAN DEFAULT FALSE | Read status |
| channel | ENUM(in_app,email,sms) | Delivery channel |
| created_at | TIMESTAMPTZ | Creation timestamp |

# 15. API Architecture

## 15.1 Design Principles

RESTful API design following HTTP verb semantics

API versioning via URL prefix: /api/v1/

JWT Bearer token authentication on all protected endpoints

Consistent JSON response envelope: { success, data, error, meta }

Pagination via ?page=&page_size= query params; max 100 items per page

Filtering via ?field=value query params on list endpoints

Swagger/OpenAPI 3.0 documentation at /api/docs/

Rate limiting headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

## 15.2 Core API Endpoints

| Endpoint | Auth Level | Description |
| --- | --- | --- |
| POST /api/v1/auth/send-otp | Public | Send OTP to mobile number |
| POST /api/v1/auth/verify-otp | Public | Verify OTP, return JWT |
| POST /api/v1/auth/logout | Auth | Invalidate current token |
| GET /api/v1/listings | Public | List/search listings with filters |
| POST /api/v1/listings | Auth | Create new listing |
| GET /api/v1/listings/{id} | Public | Get single listing detail |
| PUT /api/v1/listings/{id} | Auth (owner/admin) | Update listing |
| DELETE /api/v1/listings/{id} | Auth (admin) | Delete listing |
| GET /api/v1/listings/search | Public | Full-text + geo search |
| GET /api/v1/categories | Public | List all categories + subcategories |
| GET /api/v1/news | Public | List news articles |
| GET /api/v1/news/{slug} | Public | Single news article |
| GET /api/v1/jobs | Public | List job posts with filters |
| POST /api/v1/jobs | Auth | Submit new job post |
| GET /api/v1/events | Public | List upcoming events |
| POST /api/v1/events | Auth | Submit new event |
| GET /api/v1/ads/active | Public | Get active ads for placement |
| POST /api/v1/ads/request | Auth | Submit advertisement request |
| GET /api/v1/user/dashboard | Auth | User dashboard data |
| GET /api/v1/admin/listings | Admin | Moderation queue |
| PATCH /api/v1/admin/listings/{id}/approve | Admin | Approve listing |

# 16. Security Architecture

## 16.1 Authentication & Authorization

JWT with RS256 asymmetric signing; public key exposed at /api/v1/.well-known/jwks.json

Access token TTL: 15 minutes; Refresh token TTL: 7 days (30 days with Remember Me)

Token blacklist via Redis for logout and revoke-all-sessions

RBAC enforcement via Django middleware — permission check on every protected view

## 16.2 API Security

CORS restricted to approved frontend domains

All inputs validated via Django REST Framework serializers

File upload validation: allowed types (JPG/PNG/GIF/WebP), max 5MB, malware scan

Google reCAPTCHA v3 on OTP request, listing submission, and contact forms

OWASP Top 10 mitigations applied during development and security audit before launch

## 16.3 Infrastructure Security

Nginx reverse proxy with TLS 1.2+ termination; HTTP → HTTPS redirect

Environment secrets via Docker secrets / Kubernetes secrets (not .env in production)

PostgreSQL not exposed externally; accessible only from application container network

Regular automated vulnerability scans (Trivy for containers, pip-audit for Python deps)

Incident response plan documented: detection → containment → recovery → post-mortem

# 17. Tech Stack & Architecture

## 17.1 Technology Decisions

| Component | Technology |
| --- | --- |
| Frontend Framework | Next.js 14+ (App Router, RSC, SSR/SSG/ISR) |
| Language | TypeScript (strict mode) |
| Styling | TailwindCSS 3.x with custom design token config |
| State Management | Zustand (client state) + React Query (server state/cache) |
| Backend Framework | Django 5.x + Django REST Framework (DRF) 3.15+ |
| Authentication | Simple JWT (DRF JWT) + Twilio (OTP) |
| Database | PostgreSQL 16 with PostGIS extension (geo queries) |
| Cache | Redis 7.x (session store, rate limit, search cache, queue) |
| Task Queue | Celery + Redis (async notifications, scheduled jobs) |
| Search | PostgreSQL Full-Text Search (Phase 1); Elasticsearch (Phase 2) |
| File Storage | AWS S3 or Cloudflare R2 (images, documents) |
| CDN | Cloudflare CDN for static assets and image delivery |
| Email | SendGrid or AWS SES (transactional email) |
| SMS | Twilio (OTP + notifications) |
| Payments | Razorpay (UPI, Cards, NetBanking, Wallets) |
| Containerization | Docker + Docker Compose |
| Web Server | Nginx (reverse proxy + static serving) |
| CI/CD | GitHub Actions (lint → test → build → deploy) |
| Monitoring | Sentry (errors) + Prometheus + Grafana (metrics) |

## 17.2 Architecture Overview

The platform follows a decoupled architecture:

Next.js frontend communicates with Django REST API over HTTPS

Django handles business logic, authentication, and database operations

Celery workers process async tasks (notifications, email, image processing)

Redis serves as: session store, rate limit counter, task queue broker, and search autocomplete cache

PostgreSQL with PostGIS handles all persistent data including geospatial queries

All media assets served via CDN; never directly from application server

# 18. Performance Strategy

## 18.1 Frontend Optimization

Next.js ISR (Incremental Static Regeneration) for category and listing pages — rebuild on change, serve from CDN

next/image with automatic WebP conversion and srcSet generation

Route-level code splitting — each page bundle < 150KB gzipped

Font optimization: next/font with preload and font-display: swap

Critical CSS inlined; non-critical CSS lazy-loaded

Intersection Observer for lazy-loading below-fold components

## 18.2 Backend Optimization

Django QuerySet optimization: select_related(), prefetch_related() to eliminate N+1 queries

Database indexes on: listings.slug, listings.city, listings.category_id, listings.status, listings.lat/lng

Redis caching for: homepage data (5min TTL), category lists (1hr TTL), popular searches (15min TTL)

Pagination enforced — maximum 20 items per API page (configurable up to 100)

Database connection pooling via PgBouncer

## 18.3 Mobile / PWA Strategy

Service Worker caching for shell + frequently visited pages

Offline fallback page for network errors

App manifest for 'Add to Home Screen' functionality

Critical resources preloaded via <link rel='preload'>

All interactions target < 100ms response for perceived performance

# 19. Mobile Responsiveness & App Readiness

## 19.1 Responsive Breakpoints

| Viewport | Range | Layout Behavior |
| --- | --- | --- |
| Mobile | < 768px | Single column, bottom nav, full-screen modals |
| Tablet | 768px – 1023px | 2-column grid, sidebar collapsed |
| Desktop | 1024px+ | Full layout with sidebar, mega-menu |
| Large Desktop | 1280px+ | Max content width 1200px, centered |

## 19.2 Future App Architecture

All UI components built as isolated, reusable React components — ready for React Native port

API-first backend — all features accessible via REST API (no server-rendered HTML dependencies)

Authentication via JWT — directly portable to mobile apps

Push notification infrastructure (FCM) prepared in backend, enabled in app phase

Deep link URL scheme planned: jalgaon://listing/{id}, jalgaon://category/{slug}

# 20. Third-Party Integrations

| Integration | Purpose |
| --- | --- |
| Twilio | OTP delivery via SMS; WhatsApp Business API (future) |
| Google Maps Platform | Maps embed on listing profiles; Geocoding API for address lookup; Places Autocomplete for location search |
| Razorpay | Payment gateway for subscriptions, trending listing purchases, ad packages |
| SendGrid / AWS SES | Transactional email — OTP, notifications, approval emails |
| Google reCAPTCHA v3 | Spam and bot protection on forms |
| Cloudflare | CDN, DDoS protection, image resizing via Workers |
| Google Search Console | Sitemap submission, Core Web Vitals monitoring |
| Google Analytics 4 | Traffic, user behavior, conversion tracking |
| Sentry | Frontend and backend error monitoring and alerting |
| AWS S3 / Cloudflare R2 | Media storage for listing photos, ad creatives, user avatars |
| Firebase Cloud Messaging | Push notification delivery (Phase 2 — mobile app) |

# 21. Development Roadmap

## 21.1 Phase 1 — Foundation (Months 1–2)

Project setup: Next.js, TypeScript, TailwindCSS, Django, PostgreSQL, Docker

OTP Authentication system (Twilio integration)

Core Business Directory CRUD with all existing categories

Admin Dashboard — basic listing management

Homepage redesign (hero, categories, search)

SEO infrastructure (dynamic metadata, sitemap, robots, schema)

Deployment pipeline (Docker, Nginx, CI/CD)

## 21.2 Phase 2 — Core Modules (Months 3–4)

Business Profile rich page (gallery, maps, hours, reviews, actions)

Advanced search with geolocation and filters

News Portal (with categories, authors, AMP)

User Dashboard (My Listings, Saved, Notifications)

RBAC system (all roles and permissions)

Advertisement Module (self-serve + admin management)

Trending Listings (Razorpay payment integration)

## 21.3 Phase 3 — Extended Modules (Months 5–6)

Job Portal (post, apply, search, notifications)

Blog Module (rich editor, ToC, schema)

Event Module (submission, calendar, maps)

Tourist Places (gallery, reviews, nearby)

NGO Directory (redesign, filters)

Startup Ecosystem profiles

Club Activities module

City Information CMS pages

## 21.4 Phase 4 — Optimization & Scale (Month 7+)

Elasticsearch integration for advanced search

Push notification system (FCM)

Analytics dashboard enhancements

A/B testing infrastructure

Performance audit and Core Web Vitals hardening

Security penetration testing and OWASP audit

Android/iOS app development (React Native)

## 21.5 Milestone Summary

| Milestone | Description | Target Date |
| --- | --- | --- |
| M1 | Auth + Admin + Directory MVP | End of Month 1 |
| M2 | Homepage redesign + SEO live | End of Month 2 |
| M3 | Rich profiles + Search + News | End of Month 3 |
| M4 | User Dashboard + Ads + Trending | End of Month 4 |
| M5 | Job Portal + Blog + Events live | End of Month 5 |
| M6 | All modules live, full SEO index | End of Month 6 |
| M7+ | Performance, security, app prep | Ongoing |

# 22. Testing Strategy

## 22.1 Testing Levels

Unit Tests: Django — pytest + pytest-django; Next.js — Jest + React Testing Library; coverage target >80%

Integration Tests: API endpoint tests using pytest + DRF test client; test all CRUD and auth flows

End-to-End Tests: Playwright for critical user journeys (listing submission, OTP login, job apply)

Performance Tests: k6 load tests simulating 1,000 concurrent users

SEO Validation: Lighthouse CI in GitHub Actions; automated schema validation

Security Tests: OWASP ZAP scan before each major release; Dependabot for dependency CVEs

Accessibility: axe-core automated A11Y checks; manual WCAG 2.1 AA audit

## 22.2 Acceptance Criteria

All primary user flows (login, listing submission, search, job apply) pass E2E tests

Lighthouse Performance score > 85 on mobile for homepage and category pages

Zero critical/high security vulnerabilities in pre-launch OWASP scan

All Schema.org JSON-LD validates in Google's Rich Results Test

API response time < 300ms (p95) under 1,000 concurrent user load test

All user roles tested to confirm RBAC permissions are correctly enforced

Cross-browser: Chrome, Firefox, Safari, Edge (latest 2 versions)

Mobile: tested on iOS Safari and Android Chrome

# 23. Risks & Mitigation

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Low initial business listing data | Platform appears empty at launch | Seed database with 500+ pre-verified listings before public launch; offer free premium listing for 3 months |
| OTP delivery failures | Users cannot log in if SMS fails | Implement email OTP fallback; retry with alternate Twilio number; alert monitoring |
| Search quality poor without data | Irrelevant search results reduce trust | Implement synonym dictionaries, category-based boosting; add popular searches curated manually |
| SEO indexing delay | Months before Google ranks pages | Submit sitemap immediately at launch; build internal linking; publish city-focused blog content from day 1 |
| Payment failures | Revenue lost if Razorpay integration fails | Thorough webhook testing; implement idempotency keys; manual payment fallback for trending listings |
| Admin overwhelmed by moderation | Listings pile up in pending queue | Implement auto-approval for businesses with verified phone + address; priority inbox for paid listings |
| Performance degradation at scale | Slow site reduces SEO and conversions | Load test before launch; implement Redis caching; use ISR aggressively for listing pages |
| Mobile app scope creep | App development delays Phase 4 | Defer app to dedicated Phase 4; keep web PWA as interim solution |

# 24. Future Scope

## 24.1 Near-Term Roadmap (Year 2)

Native Android and iOS applications (React Native)

Voice search integration (Google Assistant / Siri shortcuts)

WhatsApp Business API chatbot for directory queries

Multi-city expansion: Dhule, Nashik, Aurangabad

B2B Connect feature: businesses discover and connect with each other

## 24.2 Long-Term Vision (Year 3+)

AI-powered personalized content recommendations

Real-time availability booking for services (doctors, salons)

Hyperlocal delivery integration

Municipal services integration (bill payment, government offices)

Community forum and Q&A section

Premium analytics product for enterprise businesses

# 25. Appendix

## 25.1 Glossary

| Term | Definition |
| --- | --- |
| PRD | Product Requirements Document — this document |
| SSR | Server-Side Rendering — page HTML generated on server per request |
| SSG/ISR | Static Site Generation / Incremental Static Regeneration — pre-built pages |
| RBAC | Role-Based Access Control — permissions assigned to roles |
| JWT | JSON Web Token — secure, stateless authentication token |
| OTP | One-Time Password — temporary code for authentication |
| CWV | Core Web Vitals — Google's UX performance metrics |
| JSON-LD | JSON Linked Data — structured data format for schema markup |
| MAU | Monthly Active Users |
| MRR | Monthly Recurring Revenue |
| CTR | Click-Through Rate |
| CDN | Content Delivery Network |
| PWA | Progressive Web App |
| DXA | Document XML Attributes — unit in Word documents (1440 DXA = 1 inch) |

## 25.2 Reference Websites Analyzed

JustDial.com — Category search, premium listings, reviews, lead generation

IndiaMart.com — B2B listings, product catalogs, buyer-seller connect

Google Business Profile — Rich business profiles, reviews, Maps integration

Tripadvisor.com — Tourist places, reviews, photos, nearby attractions

Zomato.com — Food listings, reviews, photos, menus, ordering

Booking.com — Hospitality listings, availability, pricing, reviews

Airbnb.com — Premium listing cards, map view, category filtering

## 25.3 Document Revision History

| Version | Date | Description |
| --- | --- | --- |
| 1.0 | June 2026 | Initial version — full platform PRD for Jalgaon.com upgrade |

— End of Document —

Jalgaon.com PRD v1.0  |  Confidential  |  SimpleSphere Technologies
