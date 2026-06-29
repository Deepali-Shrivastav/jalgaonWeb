# Jalgaon.com — Complete Project Documentation

> **Project Purpose:** A local business directory and community portal for Jalgaon District, Maharashtra, India. Users can discover local businesses, read articles, view finance tickers, and business owners can list their shops. The platform serves as both a web application and an Android mobile app.

---

## Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Repository Structure](#2-repository-structure)
3. [Backend — `jalgaonApi` (Django)](#3-backend--jalgaonapi-django)
   - [Project Configuration](#31-project-configuration)
   - [Database Schema & Model Relationships](#32-database-schema--model-relationships)
   - [Serializers](#33-serializers)
   - [API Endpoints Reference](#34-api-endpoints-reference)
   - [Authentication System](#35-authentication-system)
   - [Django Admin](#36-django-admin)
   - [Utility Functions](#37-utility-functions)
4. [Frontend — `jalgaonUi` (React + Vite)](#4-frontend--jalgaonui-react--vite)
   - [Tech Stack & Dependencies](#41-tech-stack--dependencies)
   - [Environment Configuration](#42-environment-configuration)
   - [Application Entry & Routing](#43-application-entry--routing)
   - [Layout & Shell Structure](#44-layout--shell-structure)
   - [Context / State Management](#45-context--state-management)
   - [Pages](#46-pages)
   - [Components](#47-components)
   - [Utility Functions](#48-utility-functions)
5. [Mobile App — Android via Capacitor](#5-mobile-app--android-via-capacitor)
6. [Data Flow & Request/Response Cycles](#6-data-flow--requestresponse-cycles)
7. [Authentication Flow (Detailed)](#7-authentication-flow-detailed)
8. [Third-Party Integrations](#8-third-party-integrations)
9. [Configuration & Environment Setup](#9-configuration--environment-setup)
10. [Deployment Considerations](#10-deployment-considerations)
11. [Known Issues & Technical Debt](#11-known-issues--technical-debt)
12. [Key Business Logic Summary](#12-key-business-logic-summary)

---

## 1. Project Overview & Architecture

**Jalgaon.com** is a city-specific local business listing platform (similar to JustDial/Yelp but tailored for Jalgaon, Maharashtra). It has three deployment targets that share the same codebase:

| Layer | Technology | Purpose |
|---|---|---|
| Backend API | Django 5 + DRF + PostgreSQL | REST API, data storage, admin panel |
| Web Frontend | React 18 + Vite + react-router-dom v6 | SPA web app served at `www.jalgaon.com` |
| Android App | Capacitor v6 wrapping the same React build | Native Android app (`com.jalgaon.app`) |

### High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                  CLIENT SIDE                          │
│                                                       │
│  ┌────────────────────┐   ┌────────────────────────┐ │
│  │   Web Browser      │   │  Android App           │ │
│  │   (jalgaonUi)      │   │  (Capacitor wrapper)   │ │
│  │   React 18 + Vite  │   │  same React build      │ │
│  └────────┬───────────┘   └──────────┬─────────────┘ │
│           │ HTTPS / Bearer Token      │               │
└───────────┼──────────────────────────┼───────────────┘
            │                          │
            ▼                          ▼
┌──────────────────────────────────────────────────────┐
│                  api.jalgaon.com                      │
│              Django 5 + DRF Backend                   │
│                                                       │
│  ┌────────────────┐   ┌──────────────────────────┐   │
│  │  /app/ URLs    │   │  /api/ URLs (mirror)      │   │
│  │  (primary API) │   │  (auth only, redundant)   │   │
│  └────────┬───────┘   └──────────────────────────┘   │
│           │                                           │
│  ┌────────▼───────────────────────────────────────┐  │
│  │         PostgreSQL Database                     │  │
│  │  Host: 65.1.52.6  DB: jalgaon_database         │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │       Media Files (uploaded images)             │  │
│  │       /media/  (served in DEBUG mode)           │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 2. Repository Structure

```
jalgaonWeb/                          ← Monorepo root
├── README.md
├── requirements.txt                 ← Python dependencies (for backend)
├── jalgaonApi/                      ← Django backend project
│   ├── manage.py
│   ├── requirements.txt             ← Backend-specific copy
│   ├── data.json                    ← Fixture/seed data (179KB)
│   ├── db.sqlite3                   ← Legacy SQLite (not used in prod)
│   ├── jalgaonApi/                  ← Django project config package
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── app/                         ← Primary Django app (all business logic)
│   │   ├── models.py                ← All database models
│   │   ├── serializers.py           ← DRF serializers
│   │   ├── views.py                 ← All API views
│   │   ├── urls.py                  ← URL patterns for /app/
│   │   ├── admin.py                 ← Django admin registrations
│   │   ├── utils.py                 ← OTP SMS utility (Fast2SMS)
│   │   └── migrations/              ← Database migrations
│   ├── api/                         ← Secondary Django app (auth mirror)
│   │   ├── urls.py                  ← Duplicate auth routes at /api/
│   │   └── views.py                 ← Empty (imports from app.views)
│   ├── media/                       ← Uploaded files root
│   ├── static/                      ← Static files
│   └── staticfiles/                 ← collectstatic output
└── jalgaonUi/                       ← React frontend project
    ├── package.json
    ├── vite.config.js
    ├── capacitor.config.json        ← Capacitor (Android) config
    ├── .env                         ← API URL environment variable
    ├── index.html
    ├── android/                     ← Android Studio project (Capacitor)
    ├── public/                      ← Static public assets
    └── src/
        ├── main.jsx                 ← App entry point + router
        ├── App.jsx                  ← Unused root component
        ├── Layout.jsx               ← Shared page shell (Navbar+Footer)
        ├── Providers.jsx            ← Context provider tree
        ├── index.css                ← Global styles
        ├── assets/                  ← Images, icons
        ├── context/                 ← React Context files
        │   ├── UserContext.jsx
        │   ├── LoginContext.jsx
        │   └── FormContext.jsx
        ├── utils/                   ← Helper utilities
        │   ├── auth.js
        │   └── csrf.js
        ├── pages/                   ← Route-level page components
        └── components/              ← Reusable UI components
```

---

## 3. Backend — `jalgaonApi` (Django)

### 3.1 Project Configuration

**File:** [`jalgaonApi/jalgaonApi/settings.py`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonApi/jalgaonApi/settings.py)

| Setting | Value | Notes |
|---|---|---|
| `DEBUG` | `True` | ⚠️ Must be `False` in production |
| `SECRET_KEY` | hardcoded | ⚠️ Security risk — must be moved to env vars |
| `ALLOWED_HOSTS` | `127.0.0.1`, `localhost`, `www.jalgaon.com`, `api.jalgaon.com` | |
| `CSRF_TRUSTED_ORIGINS` | `https://api.jalgaon.com`, `https://www.jalgaon.com` | |
| `AUTH_USER_MODEL` | `app.User` | Custom phone-based user |
| `DATABASE ENGINE` | `django.db.backends.postgresql_psycopg2` | PostgreSQL |
| `DATABASE HOST` | `65.1.52.6` | Remote server |
| `DATABASE NAME` | `jalgaon_database` | |
| `STATIC_URL` | `/static/` | |
| `MEDIA_URL` | `/media/` | |
| `SESSION_COOKIE_AGE` | 2 weeks | |

**CORS Configuration:**
- `CORS_ALLOW_CREDENTIALS = True`
- Allowed origins: `https://api.jalgaon.com`, `https://www.jalgaon.com`, `capacitor://localhost` (for Android app)

**REST Framework Settings:**
```python
DEFAULT_PERMISSION_CLASSES: IsAuthenticated (global default)
DEFAULT_AUTHENTICATION_CLASSES:
  - JWTAuthentication (primary for web)
  - SessionAuthentication (fallback)
  - TokenAuthentication (used for shop listing/ad uploads)
```

**JWT Settings:**
- Access Token lifetime: **1 day**
- Refresh Token lifetime: **90 days**
- `ROTATE_REFRESH_TOKENS = True` — new refresh token issued on each refresh
- `BLACKLIST_AFTER_ROTATION = True` — old refresh tokens are blacklisted
- Algorithm: `HS256`

**URL Root Structure** ([`jalgaonApi/urls.py`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonApi/jalgaonApi/urls.py)):
```
/admin/       → Django admin panel
/app/         → All primary API routes (app.urls)
/api/         → Duplicate auth-only routes (api.urls)
/media/       → Served in DEBUG mode only
```

---

### 3.2 Database Schema & Model Relationships

**File:** [`jalgaonApi/app/models.py`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonApi/app/models.py)

#### User (Custom)
Extends `AbstractUser`, replaces username with phone number.

| Field | Type | Constraints |
|---|---|---|
| `phone_number` | CharField(13) | `unique=True`, `USERNAME_FIELD` |
| `first_name` | CharField(50) | `null=True`, `blank=True` |
| `last_name` | CharField(50) | `null=True`, `blank=True` |
| `profile_pic` | ImageField | `upload_to='profile_pic'`, optional |

> Authentication uses **phone_number + password** (no username or email).

---

#### CategoryImg
Stores images for main categories.

| Field | Type |
|---|---|
| `category_img` | ImageField (`static/assets/category_img`) |
| `img_name` | CharField(50), optional |

---

#### MainCategory
Top-level business category (e.g., "Food", "Healthcare").

| Field | Type | Relationship |
|---|---|---|
| `category_img` | ForeignKey → CategoryImg | CASCADE |
| `main_category` | CharField(50) | |

---

#### SubCategory
Sub-category under a main category (e.g., "Restaurants" under "Food").

| Field | Type | Relationship |
|---|---|---|
| `main_category` | ForeignKey → MainCategory | CASCADE |
| `sub_category` | CharField(50) | |
| `sub_category_img` | ImageField (`static/assets/category_img`) | |

---

#### ShopListing *(Core model)*
The main business listing record.

| Field | Type | Notes |
|---|---|---|
| `user` | ForeignKey → User | Business owner, CASCADE |
| `main_category` | ForeignKey → MainCategory | CASCADE |
| `sub_category` | ForeignKey → SubCategory | CASCADE |
| `business_name` | CharField(50) | |
| `business_rating` | IntegerField | Default 0 |
| `business_address` | CharField(100) | |
| `business_banner` | ImageField | `static/assets/listedShops` |
| `sub_domain_one` … `sub_domain_seven` | CharField(50) | Tags/keywords, optional |
| `business_origin` | CharField(50) | Default "India" |
| `business_dob` | CharField(50) | Year of establishment, Default "N/A" |
| `business_gst` | CharField(50) | Default "N/A" |
| `business_description` | CharField(1000) | |
| `business_img_one/two/three` | ImageField | Gallery photos |
| `business_no` | CharField(15) | Phone number |
| `business_email` | CharField(50) | |
| `insta_link` | CharField(1000) | Optional |
| `facebook_link` | CharField(1000) | Optional |
| `website_link` | CharField(1000) | Optional |
| `gmap_link` | CharField(1000) | Google Maps URL, optional |
| `is_valid` | BooleanField | Default `False` — admin approval flag |

> ⚠️ `is_valid` defaults to `False` but is never enforced in views. Admin must manually approve listings.

---

#### HomeCrouselAds
Carousel/slideshow advertisement images shown on the home page.

| Field | Type |
|---|---|
| `crousel_add_img` | ImageField (`static/assets/AdsImages`) |

---

#### BannerAds
Static banner advertisements (home page + category pages).

| Field | Type |
|---|---|
| `banner_add_home_one` | ImageField |
| `banner_add_home_two` | ImageField |
| `banner_add_category_one … four` | ImageField |

> Only **one** BannerAds record is returned (`.first()`). All banner slots live in a single row.

---

#### FinanceData
Stock ticker data displayed in the top strip.

| Field | Type |
|---|---|
| `stock_title` | CharField(50) |
| `stock_price` | CharField(50) |
| `isUp` | BooleanField |
| `stock_change` | CharField(50) |
| `stock_price_percentage` | CharField(50) |

> These are manually managed records — not fetched live from a stock API.

---

#### AdsListing
User-submitted advertisement requests.

| Field | Type | Notes |
|---|---|---|
| `user` | ForeignKey → User | CASCADE |
| `name` | CharField(255) | Advertiser name |
| `contact_number` | CharField(15) | |
| `contact_email` | CharField(255) | |
| `ad_type` | CharField(2) | Choices: `'BA'` (Banner Ads), `'CA'` (Carousel Ads) |
| `ad_image` | ImageField | `static/assets/ads_images` |

---

#### ArticleModel
Blog/news article content.

| Field | Type |
|---|---|
| `title` | CharField(50) |
| `short_desc` | CharField(100) |
| `blog_img` | ImageField (`static/assets/article_imgs`) |
| `para_one … para_five` | CharField(1000) each |

> Note: `para_trhee` is a typo in the codebase (should be `para_three`).

---

#### ActiveArticle
Controls which articles appear on the home page slider.

| Field | Type |
|---|---|
| `article` | ForeignKey → ArticleModel | CASCADE |

> Acts as a curated list — only articles linked here appear in the home page section.

---

#### LikedShops
User's saved/liked businesses.

| Field | Type |
|---|---|
| `user` | ForeignKey → User | CASCADE |
| `shop_listing` | ForeignKey → ShopListing | CASCADE |

> No unique_together constraint — the view manually checks for duplicates before saving.

---

#### ShopReview
User reviews for business listings.

| Field | Type |
|---|---|
| `user` | ForeignKey → User | CASCADE |
| `shop_listing` | ForeignKey → ShopListing | CASCADE |
| `rating_star` | CharField(5) | Stored as string (e.g., "4") |
| `user_review` | CharField(2000) | |
| `timestamp` | DateTimeField | `auto_now_add=True` |

---

#### Entity Relationship Diagram

```
User ──────────────────┬──────────────────┬──────────────────┐
                       │                  │                  │
                   ShopListing       LikedShops         AdsListing
                   /      \              │
          MainCategory   SubCategory  ShopListing
               │
           CategoryImg
               
ShopListing ──── ShopReview ←── User
ArticleModel ←── ActiveArticle
```

---

### 3.3 Serializers

**File:** [`jalgaonApi/app/serializers.py`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonApi/app/serializers.py)

| Serializer | Model | Notes |
|---|---|---|
| `UserRegisterSerializer` | User | Fields: `phone_number`, `password` (write-only). Calls `create_user()`. |
| `UserLoginSerializer` | — (Serializer) | Calls `authenticate()` in `validate()`. Returns `{'user': user_object}`. |
| `UserSerializer` | User | Read-only. Fields: `id`, `phone_number`. Validates max 13 chars. |
| `CategoryImgSerializer` | CategoryImg | All fields. |
| `MainCategorySerializer` | MainCategory | Nested `CategoryImgSerializer`. All fields. |
| `SubCategorySerializer` | SubCategory | Custom `get_main_category` returns the name string (not ID). |
| `ShopListingSerializer` | ShopListing | All fields. Custom `update()` does partial patch. |
| `HomeCrouselAdsSerializer` | HomeCrouselAds | All fields. |
| `BannerAdsSerializer` | BannerAds | All fields. |
| `FinanceDataSerializer` | FinanceData | All fields. |
| `AdsListingSerializer` | AdsListing | All fields. |
| `ArticleModelSerializer` | ArticleModel | All fields. |
| `ActiveArticleSerializer` | ActiveArticle | Nested `ArticleModelSerializer`. Field: `article` only. |
| `LikedShopsSerializer` | LikedShops | Nested `ShopListingSerializer` for `shop_listing`. Fields: `user`, `shop_listing`. |
| `LikedShopsCreateSerializer` | — (Serializer) | PrimaryKey relations for creation. |
| `ShopReviewCreateSerializer` | ShopReview | ⚠️ **Defined twice** in the file — second definition overrides. |
| `ShopReviewSerializer` | ShopReview | Nested `UserSerializer` on `user` field (reads `user.phone_number`). |

---

### 3.4 API Endpoints Reference

All routes are prefixed with `/app/` (primary) or mirrored under `/api/` (auth only).

#### Authentication Endpoints

| Method | URL | Auth Required | Description |
|---|---|---|---|
| `POST` | `/app/register/` | No | Register new user with phone_number + password |
| `POST` | `/app/login/` | No | Login; returns `user` object + JWT access token |
| `POST` | `/app/logout/` | Yes | Session logout |
| `GET` | `/app/user/` | Yes (JWT) | Returns current authenticated user data |
| `POST` | `/app/token/` | No | SimpleJWT token pair endpoint |
| `POST` | `/app/token/refresh/` | No | Refresh JWT access token |
| `GET` | `/app/csrf-token/` | No | Returns CSRF token in JSON |
| `POST` | `/app/tokenKey/` | No | Returns DRF Token (for multipart upload auth) |

#### Category Endpoints

| Method | URL | Auth Required | Description |
|---|---|---|---|
| `GET` | `/app/categorys/` | No | All main categories with nested images |
| `GET` | `/app/subCategorys/` | No | All sub-categories with parent category name |

#### Business/Shop Endpoints

| Method | URL | Auth Required | Description |
|---|---|---|---|
| `POST` | `/app/shopListing/` | Yes (Token) | Create new business listing (multipart) |
| `PUT` | `/app/updateShop/?shop_id=<id>` | Yes (Token) | Update existing shop listing |
| `GET` | `/app/filtered-business/?mainCategoryId=<id>` | No | Get shops filtered by main category (returns raw values()) |
| `GET` | `/app/business-view/?productId=<id>` | No | Get single shop by ID |
| `GET` | `/app/listedShops/?user_id=<id>` | Yes (JWT) | Get all shops listed by a user |
| `GET` | `/app/editShopsData/?shop_id=<id>` | Yes (JWT) | Get single shop data (for edit form pre-fill) |
| `GET` | `/app/searchResult/?search=<query>` | No | Search shops by business_name |

#### Ads Endpoints

| Method | URL | Auth Required | Description |
|---|---|---|---|
| `POST` | `/app/adsListing/` | Yes (Token) | Submit advertisement request |
| `GET` | `/app/crousel-ads/` | No | Get all carousel ad images |
| `GET` | `/app/banner-ads/` | No | Get first BannerAds record |

#### Finance Endpoint

| Method | URL | Auth Required | Description |
|---|---|---|---|
| `GET` | `/app/finance-data/` | No | Get all stock ticker data |

#### Articles Endpoints

| Method | URL | Auth Required | Description |
|---|---|---|---|
| `GET` | `/app/articles/` | No | List all articles |
| `GET` | `/app/active-articles/` | No | List active (curated) articles (nested serializer) |
| `GET` | `/app/articleGet/?articleId=<id>` | No | Get single article by ID |

#### Social/Review Endpoints

| Method | URL | Auth Required | Description |
|---|---|---|---|
| `GET` | `/app/likedShops/?user_id=<id>` | Yes (JWT) | Get user's liked shops |
| `POST` | `/app/likedShops/` | Yes (JWT) | Like a shop; duplicate check enforced |
| `POST` | `/app/shop_reviews/` | Yes (JWT+Token) | Submit a review for a shop |
| `GET` | `/app/get_shop_reviews/` | Yes (JWT+Token) | Get all reviews (not filtered by shop — bug) |

---

### 3.5 Authentication System

The backend implements **two parallel authentication systems** which is a significant source of complexity:

#### System 1: SimpleJWT (Bearer Token)
- Used for: `/app/user/`, `/app/likedShops/`, `/app/listedShops/`, `/app/editShopsData/`, `/app/shop_reviews/`
- Token stored in `localStorage` under key `'token'`
- Header: `Authorization: Bearer <access_token>`
- Lifetime: 1 day access / 90 day refresh
- On login, the `UserLogin` view calls `RefreshToken.for_user(user)` and returns the access token

#### System 2: DRF Token Auth (Token prefix)
- Used for: `/app/shopListing/`, `/app/updateShop/`, `/app/adsListing/`
- Token stored in `localStorage` under key `'tokenKey'`
- Header: `Authorization: Token <drf_token>`
- Lifetime: Permanent (no expiry unless manually deleted)
- Obtained via `/app/tokenKey/` endpoint after JWT login

#### Login Flow:
1. User submits phone_number + password
2. `POST /app/login/` → returns JWT access token + user data
3. JWT token stored as `localStorage['token']`
4. User object stored as `localStorage['user']`
5. Immediately calls `POST /app/tokenKey/` with same credentials
6. DRF Token stored as `localStorage['tokenKey']`

#### Session Check on Page Load:
- `UserContext` fetches `GET /app/user/` using Bearer token on app mount
- `LoginSignup` component also does this check independently

---

### 3.6 Django Admin

**File:** [`jalgaonApi/app/admin.py`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonApi/app/admin.py)

Custom `UserAdmin` with fieldsets for `phone_number` (instead of username). All models are registered:

- `User` (custom admin)
- `CategoryImg`, `MainCategory`, `SubCategory`
- `ShopListing`, `FinanceData`
- `HomeCrouselAds`, `BannerAds`, `AdsListing`
- `ArticleModel`, `ActiveArticle`
- `LikedShops`, `ShopReview`

The admin panel at `/admin/` is the primary way to:
- Manage category structure (add/edit main categories, sub-categories, category images)
- Approve shop listings (toggle `is_valid`)
- Manage carousel/banner advertisements
- Update finance/stock ticker data
- Publish articles (add to `ActiveArticle`)

---

### 3.7 Utility Functions

**File:** [`jalgaonApi/app/utils.py`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonApi/app/utils.py)

```python
send_otp(phone_number, otp)
```
- Calls **Fast2SMS** bulk SMS API to send OTP messages
- API key is **hardcoded** in the file ⚠️
- This function is defined but **never called** in any view — OTP verification is not yet implemented

---

## 4. Frontend — `jalgaonUi` (React + Vite)

### 4.1 Tech Stack & Dependencies

**File:** [`jalgaonUi/package.json`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonUi/package.json)

| Package | Version | Purpose |
|---|---|---|
| `react` | 18.3.1 | UI framework |
| `react-dom` | 18.3.1 | DOM rendering |
| `react-router-dom` | 6.24.0 | Client-side routing |
| `axios` | 1.7.5 | HTTP client for API calls |
| `react-select` | 5.8.0 | Searchable dropdown for category/sub-category selectors |
| `react-slick` + `slick-carousel` | 0.30.2 / 1.8.1 | Carousel/slider component |
| `react-slideshow-image` | 4.3.1 | Slideshow component |
| `date-fns` | 3.6.0 | Date formatting (used in reviews: `format(date, 'dd MMMM yyyy')`) |
| `browser-image-compression` | 2.0.2 | Installed but **commented out** in AddListingForm |
| `@capacitor/core` | 6.1.2 | Capacitor core for Android |
| `@capacitor/android` | 6.1.2 | Android platform |
| `@capacitor/cli` | 6.1.2 | Capacitor CLI tooling |
| `vite` | 5.3.1 | Build tool & dev server |
| `@vitejs/plugin-react` | 4.3.1 | React plugin for Vite |

**Scripts:**
```bash
npm run dev      # Start Vite development server
npm run build    # Production build (outputs to /dist)
npm run preview  # Preview production build
npm run lint     # ESLint
```

---

### 4.2 Environment Configuration

**File:** [`jalgaonUi/.env`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonUi/.env)

```env
VITE_DJANGO_API=https://api.jalgaon.com
# (local dev commented out: VITE_DJANGO_API=http://127.0.0.1:8000)
```

This single variable is consumed throughout the entire frontend as:
```js
const djangoApi = import.meta.env.VITE_DJANGO_API;
```

**To switch to local development:** change `.env` to:
```env
VITE_DJANGO_API=http://127.0.0.1:8000
```

---

### 4.3 Application Entry & Routing

**File:** [`jalgaonUi/src/main.jsx`](file:///e:/Deepali/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonUi/src/main.jsx)

The app uses **React Router v6** with `createBrowserRouter` and `createRoutesFromElements`.

#### Route Tree

```
/ (Layout)
├── /                     → Home
├── /addListig            → AddListingPage   (⚠️ typo: "Listig" not "Listing")
├── /categories/:mainCategoryId/:mainCategory → CategoryPage
├── /productView/:productId → BusinessDetailsPage
├── /account              → Account
├── /advertise            → AddAdvertise
├── /allarticlse          → ArticlesPage     (⚠️ typo: "articlse" not "articles")
├── /articleView/:articleId → ArticleViewPage
├── /searchResults        → SearchPage
├── /about                → AboutPage
├── /contact              → ContactPage
├── /termsAndCondition    → TermsPage
└── /editForm/:shopId     → AddListingForm (with is_edit={true})
```

> ⚠️ Two routes have typos in their paths: `addListig` (Add Listing) and `allarticlse` (All Articles). These are consistent across navigation links but must be corrected if URL-sharing is important.

The entire app is wrapped in the `<Providers>` component which nests all React Context providers.

---

### 4.4 Layout & Shell Structure

**File:** [`jalgaonUi/src/Layout.jsx`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonUi/src/Layout.jsx)

```
<Layout>
  <Navbar />       ← Top navigation bar with search
  <Outlet />       ← Current page content injected here
  <Footer />       ← Site footer with links
  <Bottomnav />    ← Mobile bottom navigation bar
</Layout>
```

The `Layout` component also configures the **global axios instance**:
- Sets `xsrfCookieName` and `xsrfHeaderName` for CSRF
- Sets `withCredentials = true`
- Creates a `client` with `baseURL` from env
- Interceptor automatically attaches `Authorization: Bearer <token>` from `localStorage['authToken']`

> ⚠️ **Token key inconsistency:** The Layout interceptor reads `localStorage['authToken']`, but the login flow stores the JWT under `localStorage['token']`. These two keys are different, meaning the Layout's interceptor will fail to find the token for authenticated requests unless `authToken` is set separately.

---

### 4.5 Context / State Management

The app uses React Context API for global state. Three contexts are composed in `Providers.jsx`:

```
<UserProvider>        ← Outer-most
  <LoginProvider>
    <FormProvider>    ← Inner-most
      {children}
    </FormProvider>
  </LoginProvider>
</UserProvider>
```

#### UserContext ([`context/UserContext.jsx`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonUi/src/context/UserContext.jsx))

| Value | Type | Description |
|---|---|---|
| `user` | object \| null | Current user `{id, phone_number}` |
| `setUser` | fn | Update user state |
| `isLogin` | boolean | Whether user is logged in |
| `setIsLogin` | fn | Update login state |

**On mount:** Reads `localStorage['token']`, calls `GET /app/user/` with Bearer token. If successful, sets `user` and `isLogin = true`.

---

#### LoginContext ([`context/LoginContext.jsx`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonUi/src/context/LoginContext.jsx))

| Value | Type | Description |
|---|---|---|
| `isLogin` | null \| boolean | Login state (separate from UserContext.isLogin) |
| `setIsLogin` | fn | Update login state |

> ⚠️ **Redundancy:** Both `UserContext` and `LoginContext` have an `isLogin` state. `UserContext.isLogin` is used for conditional rendering in components like `LoginSignup`. `LoginContext.isLogin` is used in `Navbar`. They are not synchronized — a login action in `LoginSignup` updates `UserContext.isLogin` but `LoginContext.isLogin` may remain stale.

---

#### FormContext ([`context/FormContext.jsx`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonUi/src/context/FormContext.jsx))

| Value | Type | Description |
|---|---|---|
| `closeForm` | boolean | Controls visibility of the Login/Signup modal (`true` = closed) |
| `setCloseForm` | fn | Toggle the modal |
| `closeSpecial` | boolean | Controls the mobile hamburger menu/special section (`true` = hidden) |
| `setCloseSpecial` | fn | Toggle the special section |

---

### 4.6 Pages

All pages are in [`jalgaonUi/src/pages/`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonUi/src/pages/)

#### Home (`Home.jsx`)
The landing page. Assembles multiple section components:
```
<Stocktickle />        ← Top finance ticker strip
<Advertise />          ← Carousel + banner ads
<Services />           ← Feature/service highlights
<Categorytile />       ← Category browsing grid
<Releatedarticles />   ← Active article slider
<LoginSignup />        ← Modal (hidden by default)
<SpecialSections />    ← Quick-links to external Jalgaon govt. sites
```

#### CategoryPage (`CategoryPage.jsx`)
Browsing businesses within a specific main category.
- URL params: `:mainCategoryId`, `:mainCategory`
- On mount: `GET /app/filtered-business/?mainCategoryId=<id>`
- Renders `<Filtercategory>` (sub-category filter sidebar) and `<Categorysection>` (grid of business cards)
- `filterSubCategory` state passed between components to filter the displayed businesses

#### BusinessDetailsPage (`BusinessDetailsPage.jsx`)
Full detail view of a single business.
- URL param: `:productId`
- On mount: `GET /app/business-view/?productId=<id>`
- Renders: breadcrumb nav → `<BusinessDetailsCard>` → `<CompanyWork>` + `<BusinessContact>` side by side

#### Account (`Account.jsx`)
User account dashboard.
- Renders `<AccountCompo>` which has a sidebar (`AccountLinks`) and main content area (`AccountMainCompo`)
- Three sub-sections: **My Profile**, **Liked Pages**, **Listings**

#### AddListingPage (`AddListingPage.jsx`)
Page for submitting a new business listing.
- Renders `<AddListingForm is_edit={false} />`

#### AddAdvertise (`AddAdvertise.jsx`)
Page for submitting an advertisement request.
- Renders `<AddAdvertiseForm />`

#### ArticlesPage (`ArticlesPage.jsx`)
Lists all articles.
- Renders `<Articles />` component.

#### ArticleViewPage (`ArticleViewPage.jsx`)
Detailed view of a single article.
- URL param: `:articleId`
- Renders `<ArticleView />` component.

#### SearchPage (`SearchPage.jsx`)
Displays search results passed via React Router state.
- Does **not** make an API call — data is passed in `location.state.searchData` from the `Search` component
- Renders `<SearchSection searchData={searchData} />`

#### AboutPage, ContactPage, TermsPage
Static informational pages. Render their respective components.

---

### 4.7 Components

All components are in [`jalgaonUi/src/components/`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonUi/src/components/)

#### Navbar (`Navbar/Navbar.jsx`)
Top navigation bar.
- Logo with home link
- Navigation links: Home, Add Listing, Advertise, News
- Heart icon (non-functional)
- Conditional: shows user phone number + Account link if logged in, else "Signup/Login" button that opens `FormContext.closeForm`
- Hamburger menu icon toggles `FormContext.closeSpecial`
- Contains `<Search />` component below the nav bar

#### Search (`Navbar/Search.jsx`)
Search input with city selector (city selection is non-functional placeholder).
- On submit or Enter key: `GET /app/searchResult/?search=<query>`
- On success: navigates to `/searchResults` with data in React Router state

#### Bottomnav (`Bottomnav/Bottomnav.jsx`)
Mobile bottom navigation. Provides mobile-friendly access to Home, Categories, Account, and other key sections.

#### Advertise (`Advertise/Advertise.jsx`)
Home page ad section:
1. **Carousel** — fetches from `/app/crousel-ads/`, auto-slides every 3 seconds with dot indicators
2. **Banner Ads** — fetches from `/app/banner-ads/`, renders `banner_add_home_one` and `banner_add_home_two`

#### Stocktickle (`Stocktickle/Stocktickle.jsx`)
Horizontal scrolling strip of stock/finance data.
- Fetches from `/app/finance-data/`
- Each item shows: title, price, up/down indicator (colored arrow icon), change, percentage

#### Categorytile (`Categorytile/Categorytile.jsx` + `Category.jsx`)
Home page category grid.
- `Categorytile` fetches all main categories from `/app/categorys/`
- For each main category, renders a `Category` component
- `Category` fetches sub-categories filtered by main category name, displays them as image cards

#### Filtercategory (`Filtercategory/Filtercategory.jsx`)
Sub-category filter sidebar on the category browsing page.
- Fetches sub-categories filtered by the current `mainCategory` name
- Clicking a sub-category calls `setFilterSubCategory(categoryId)` which is lifted to `CategoryPage`

#### Categorysection (`Categorysection/`)
| File | Purpose |
|---|---|
| `Categorysection.jsx` | Grid of business cards; filters by `filterSubCategory` if selected |
| `BusinessCard.jsx` | Individual business card with name, address, category, like button, edit button |
| `SearchSection.jsx` | Same layout as Categorysection but for search results |

#### Businesscompo (`Businesscompo/`)
| File | Purpose |
|---|---|
| `BusinessDetailsCard.jsx` | Hero card: business name, rating display, address, contact CTAs (Call, WhatsApp, Direction, Share) |
| `CompanyWork.jsx` | Sub-domains/products list, company profile info (origin, DOB, GST), description, review form, reviews list |
| `BusinessContact.jsx` | Social links: Instagram, Facebook, Website; map link |

#### LoginSignup (`LoginSignup/LoginSignup.jsx`)
Modal form that handles both Registration and Login in one component.
- State `isNumber` toggles between Register form and Login form
- **Register flow:** `POST /app/register/` then automatically calls login
- **Login flow:** `POST /app/login/` → stores JWT as `localStorage['token']` → calls `POST /app/tokenKey/` → stores DRF token as `localStorage['tokenKey']`
- Visibility controlled by `FormContext.closeForm`

#### AccountCompo (`AccountCompo/`)
| File | Purpose |
|---|---|
| `AccountCompo.jsx` | Container with sidebar + content area, manages `activeLink` state |
| `AccountLinks.jsx` | Sidebar navigation: My Profile, Liked Pages, Listings, Log Out. Logout removes `token` and `tokenKey` from localStorage |
| `AccountMainCompo.jsx` | Renders sub-component based on `activeLink` |
| `MyProfile.jsx` | Displays current user's phone number |
| `Likedpage.jsx` | Fetches and displays liked shops (`GET /app/likedShops/?user_id=<id>`) |
| `Listingspage.jsx` | Fetches and displays user's own shop listings (`GET /app/listedShops/?user_id=<id>`) |

#### AllForms (`AllForms/`)
| File | Purpose |
|---|---|
| `AddListingForm.jsx` | Large multi-section form for creating/editing business listings. 908 lines. Has two form modes (`is_edit` prop). |
| `AddAdvertiseForm.jsx` | Shorter form for submitting ad placement requests. |

**AddListingForm features:**
- Fetches categories + sub-categories on mount
- If `is_edit=true` and `shopId` param: pre-fills form from `/app/editShopsData/`
- Category selection via `react-select` (searchable dropdowns)
- Image upload for banner + 3 gallery photos (currently all set to same file)
- Geolocation button: uses `navigator.geolocation` to get Google Maps URL
- Submit: `POST /app/shopListing/` with `Authorization: Token <tokenKey>`
- Edit submit: `PUT /app/updateShop/?shop_id=<id>` with `Authorization: Token <tokenKey>`

#### Releatedarticles (`Releatedarticles/`)
| File | Purpose |
|---|---|
| `Releatedarticles.jsx` | Horizontal scrollable article card strip; fetches from `/app/active-articles/`; prev/next scroll buttons |
| `BlogSlider.jsx` | Individual article card with title, image, short description, link to article view |
| `Articles.jsx` | Full article list (for `/allarticlse` page) |
| `ArticleView.jsx` | Full article content renderer |

#### SpecialSections (`SpecialSections/SpecialSections.jsx`)
Two-version quick-access section:
1. **Desktop version** — horizontal button row
2. **Mobile version** — dropdown menu (toggled by `FormContext.closeSpecial`)
Both link to:
- [Jalgaon NGOs](https://jalgaon.gov.in/public-utility-category/ngos/)
- [Jalgaon Directory](https://jalgaon.gov.in/telephone/)
- [Jalgaon Tourist Places](https://jalgaon.gov.in/tourist-places/)
- Events (non-functional, links to `/`)

#### Services (`Services/Services.jsx`)
Static section on the home page describing platform features/services.

#### Footer (`Footer/Footer.jsx`)
Site footer with:
- Logo and site description
- Useful Links: About, Article, News (empty), Contact, Events (empty), Directory (empty), NGO (empty), Add Listing, Feedback (empty), Terms & Conditions
- Copyright notice
- Social media links (Facebook, Instagram, Twitter — empty hrefs)

#### CompanyInfo (`CompanyInfo/`)
Additional company information component (likely used in business detail views).

---

### 4.8 Utility Functions

#### `utils/auth.js`
```js
setAuthToken(token)   // localStorage.setItem('authToken', token)
getAuthToken()        // localStorage.getItem('authToken')
clearAuthToken()      // localStorage.removeItem('authToken')
```
> ⚠️ These functions use `'authToken'` key, but the login flow in `LoginSignup.jsx` uses `'token'` key. These utilities are defined but appear to be **unused** in the main login flow.

#### `utils/csrf.js`
```js
getCsrfToken()  // GET /app/csrf-token/ → returns csrfToken string
```
> This is also implemented inline within each component that needs CSRF. The utility module exists but each component has its own duplicate `getCsrfToken` function.

---

## 5. Mobile App — Android via Capacitor

**Config File:** [`jalgaonUi/capacitor.config.json`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonUi/capacitor.config.json)

```json
{
  "appId": "com.jalgaon.app",
  "appName": "Jalgaon.Com",
  "webDir": "dist"
}
```

**How it works:**
1. Run `npm run build` → generates `/dist` folder
2. Capacitor wraps the `/dist` web build in a WebView inside an Android app
3. The Android project in `/android/` is opened in Android Studio to build the APK/AAB
4. The app runs as `capacitor://localhost` internally

**CORS allowance for Android:** The Django backend explicitly allows `'capacitor://localhost'` in `CORS_ALLOWED_ORIGINS`, enabling the WebView to make API calls.

**Build commands:**
```bash
npm run build                    # Build React app
npx cap sync android             # Sync web build to Android
npx cap open android             # Open in Android Studio
```

---

## 6. Data Flow & Request/Response Cycles

### Home Page Load Sequence

```
Browser loads /
    │
    ├─ UserContext mounts → GET /app/user/ (with Bearer token if exists)
    │   └─ Sets user state globally
    │
    ├─ LoginSignup mounts → same user check (redundant)
    │
    ├─ Stocktickle mounts → GET /app/finance-data/
    │   └─ Renders stock ticker rows
    │
    ├─ Advertise mounts → GET /app/crousel-ads/
    │                    → GET /app/banner-ads/
    │   └─ Renders carousel + banner images
    │
    ├─ Categorytile mounts → GET /app/categorys/
    │   └─ For each category → GET /app/subCategorys/ (N+1 pattern ⚠️)
    │      └─ Renders sub-category cards
    │
    └─ Releatedarticles mounts → GET /app/active-articles/
        └─ Renders article cards
```

### Business Search Flow

```
User types in Search input and presses Enter
    │
    ├─ GET /app/searchResult/?search=<query>
    │   └─ Backend: ShopSearchView (SearchFilter on business_name)
    │
    └─ Navigate to /searchResults with data in router state
        └─ SearchPage renders SearchSection with results
```

### Add Business Listing Flow

```
User fills AddListingForm and submits
    │
    ├─ On mount: GET /app/categorys/ + GET /app/subCategorys/
    │
    ├─ On file select: handleFileChange sets all 4 image fields to same file
    │
    ├─ Optional: getUserLocation() → browser geolocation → Google Maps URL
    │
    ├─ GET /app/csrf-token/ → csrfToken
    │
    └─ POST /app/shopListing/ (multipart/form-data)
        Headers: X-CSRFToken, Authorization: Token <tokenKey>
        Body: All form fields as FormData
```

---

## 7. Authentication Flow (Detailed)

```
User clicks "Signup/Login" in Navbar
    │
    └─ FormContext.setCloseForm(false) → LoginSignup modal appears

User submits form:

  [Register path]:
    POST /app/register/ {phone_number, password}
    → 201 Created → automatically calls login

  [Login path]:
    POST /app/login/ {phone_number, password}
    → 200 OK → { user: {id, phone_number}, token: <jwt_access_token> }
    → localStorage['token'] = jwt_access_token
    → localStorage['user'] = JSON.stringify(user)
    → UserContext: setUser(user), setIsLogin(true)
    → FormContext: setCloseForm(true) (close modal)
    
    POST /app/tokenKey/ {phone_number, password}
    → 200 OK → { token: <drf_token> }
    → localStorage['tokenKey'] = drf_token

Logout (AccountLinks):
    localStorage.removeItem('token')
    localStorage.removeItem('tokenKey')
    navigate('/') + window.location.reload()
```

---

## 8. Third-Party Integrations

| Service | Purpose | Config Location |
|---|---|---|
| **Twilio** | Listed in requirements.txt but not used in any view | `requirements.txt` |
| **Fast2SMS** | OTP SMS sending | `app/utils.py` (API key hardcoded, function unused) |
| **BoxIcons** | Icon library (loaded via CDN in `index.html`) | `index.html` |
| **Google Maps** | Deep links for business direction (`gmap_link` field) | `BusinessDetailsCard.jsx` |
| **WhatsApp** | Click-to-chat links via `wa.me` | `BusinessDetailsCard.jsx` |
| **Jalgaon Government** | External links in SpecialSections | `SpecialSections.jsx` |
| **PostgreSQL** | Primary database | `settings.py` (credentials hardcoded ⚠️) |

---

## 9. Configuration & Environment Setup

### Backend Setup

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run migrations
cd jalgaonApi
python manage.py migrate

# 4. Create superuser
python manage.py createsuperuser
# Enter phone number (e.g., 9876543210) and password

# 5. Start development server
python manage.py runserver
# API available at http://127.0.0.1:8000

# 6. (Optional) Load fixture data
python manage.py loaddata data.json
```

**For local development, update `settings.py` database to SQLite:**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Frontend Setup

```bash
cd jalgaonUi

# 1. Install dependencies
npm install

# 2. Configure for local dev (edit .env)
# Change: VITE_DJANGO_API=http://127.0.0.1:8000

# 3. Start development server
npm run dev
# App available at http://localhost:5173
```

> **Note:** For local development, you also need to add `http://localhost:5173` to Django's `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` in `settings.py`.

---

## 10. Deployment Considerations

### Current Production Setup
- **Backend API:** `api.jalgaon.com` (Django)
- **Frontend:** `www.jalgaon.com` (static files served — likely Nginx)
- **Database:** Remote PostgreSQL at `65.1.52.6`

### Critical Production Requirements Not Met

> [!CAUTION]
> The following issues **MUST** be fixed before production deployment:

1. **`DEBUG = True`** — Must be `False`. Exposes stack traces.
2. **Hardcoded `SECRET_KEY`** — Must be moved to environment variable.
3. **Hardcoded database credentials** — Must be moved to environment variables.
4. **Hardcoded Fast2SMS API key** — Must be secured.
5. **Media serving** — In DEBUG mode, media files are served by Django. In production, Nginx should serve `/media/`.
6. **`ALLOWED_HOSTS`** — Currently allows `127.0.0.1` and `localhost` in production settings — should be removed.

### Recommended `.env` pattern for backend:
```env
DJANGO_SECRET_KEY=<secret>
DB_NAME=jalgaon_database
DB_USER=jalgaon-app
DB_PASSWORD=<password>
DB_HOST=65.1.52.6
DB_PORT=5432
FAST2SMS_API_KEY=<key>
```

---

## 11. Known Issues & Technical Debt

### Bugs
| Issue | Location | Severity |
|---|---|---|
| `localStorage['authToken']` vs `localStorage['token']` inconsistency | `Layout.jsx` interceptor vs `LoginSignup.jsx` | High — auth may fail |
| `UserContext.isLogin` vs `LoginContext.isLogin` not synchronized | Both contexts | Medium — stale UI state |
| `ShopReviewCreateSerializer` defined twice | `serializers.py` L153 & L159 | Low — second overwrites first |
| `get_shop_reviews` view ignores `shop_listing` filter param | `views.py` L383-387 | Medium — returns all reviews |
| `searchResult` URL duplicated 3 times | `app/urls.py` L46, 48, 52 | Low — harmless redundancy |
| `data.json` fixture — `para_trhee` typo | `models.py` L175 | Low — cosmetic |
| Route path typos: `/addListig`, `/allarticlse` | `main.jsx` | Low — internal URLs work |
| `addListig` navbar link and "News" both point to same route | `Navbar.jsx` | Medium — UX confusion |
| Image compression code commented out | `AddListingForm.jsx` L171-202 | Medium — large image uploads |
| All 4 business images set to same file on upload | `AddListingForm.jsx handleFileChange` | Medium — gallery broken |
| `is_valid` field never checked in views | `models.py`, `views.py` | High — unapproved listings show publicly |

### Architecture Concerns
- **N+1 query problem:** `Categorytile` → `Category` makes one API call per main category for sub-categories. Should be combined into one call.
- **Dual auth token system:** JWT + DRF Token creates confusion. Should standardize on one.
- **Duplicate auth route:** `/api/` mirrors `/app/` for auth-only routes without clear reason.
- **`api/views.py` is empty:** The `api` Django app only has a `urls.py` that imports views from `app.views`.
- **No pagination:** `ShopListing`, articles, etc. return all records without pagination.
- **No input sanitization/validation:** User-supplied HTML in descriptions is not sanitized.

---

## 12. Key Business Logic Summary

### Business Listings Approval
- Businesses are listed by users, but have `is_valid=False` by default
- There is **no automatic approval** — an admin must manually set `is_valid=True` via the admin panel
- However, the API views **never filter by `is_valid`** — all shops appear publicly regardless of approval status

### Category Navigation
- The home page shows **main categories** (e.g., "Healthcare", "Food")
- Clicking a category navigates to `/categories/:mainCategoryId/:mainCategory`
- The category page fetches businesses filtered by `mainCategoryId` and shows a sub-category filter sidebar
- Sub-category filtering happens **client-side** (data is fetched all at once, filtered in React)

### Article Publication Control
- `ArticleModel` stores all articles
- Only articles linked via `ActiveArticle` appear on the home page
- `/app/articles/` returns all articles; `/app/active-articles/` returns only active ones

### Finance Ticker
- Finance data is managed manually through the Django admin
- It represents a stock-market style ticker for local business/economic data
- Not connected to any live financial API

### Advertisement System
- Two ad positions: **Carousel** (full-width slideshow) and **Banner** (static image slots)
- Businesses can submit ad requests via the `/advertise` page (`AdsListing` model)
- Admin manually uploads the actual ad images to `HomeCrouselAds` and `BannerAds` models
- The `AdsListing` submission and the actual ads shown are separate — user requests don't automatically appear

---

*Documentation generated: June 2026 | Project: Jalgaon.com | Stack: Django 5 + React 18 + Capacitor 6*
