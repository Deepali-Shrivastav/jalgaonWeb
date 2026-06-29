# Jalgaon.com — Complete Backend API Reference & Integration Guide

> **Purpose:** This document contains everything you need to safely connect a redesigned UI to the existing backend.
> It is derived entirely from reading the actual source code — nothing is assumed.
>
> **Backend Base URL (Production):** `https://api.jalgaon.com`
> **Frontend Source:** `VITE_DJANGO_API=https://api.jalgaon.com` (from `.env`)

---

## Table of Contents

| # | Section |
|---|---------|
| 1 | [Project Architecture Overview](#1-project-architecture-overview) |
| 2 | [Database Schema — All 12 Models](#2-database-schema--all-12-models) |
| 3 | [Authentication Systems](#3-authentication-systems) |
| 4 | [Complete API Endpoint Reference (25 Endpoints)](#4-complete-api-endpoint-reference) |
| 5 | [Request / Response Data Formats](#5-request--response-data-formats) |
| 6 | [File Upload & Media Handling](#6-file-upload--media-handling) |
| 7 | [CORS Configuration](#7-cors-configuration) |
| 8 | [Frontend API Call Patterns](#8-frontend-api-call-patterns) |
| 9 | [Error Handling Patterns](#9-error-handling-patterns) |
| 10 | [Confirmed Bugs & Issues](#10-confirmed-bugs--issues) |
| 11 | [Production-Safe UI Migration Strategy](#11-production-safe-ui-migration-strategy) |

---

## 1. Project Architecture Overview

```
Browser / Android App (Capacitor)
        │
        ▼  HTTPS
┌─────────────────────────────┐
│         Nginx               │  Serves static React dist/ AND
│   www.jalgaon.com           │  proxies /app/* and /api/* to Gunicorn
└────────────┬────────────────┘
             │ proxy_pass
             ▼
┌─────────────────────────────┐
│    Gunicorn (WSGI server)   │  Runs Django application
│    api.jalgaon.com          │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│     Django 5.0.7            │
│   - Django REST Framework   │
│   - Simple JWT              │
│   - DRF Token Auth          │
│   - corsheaders             │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│   PostgreSQL Database        │  Separate Lightsail instance
│   Host: 65.1.52.6            │  DB: jalgaon_database
│   Port: 5432                 │  User: jalgaon-app
└─────────────────────────────┘
```

### Two Django Apps

| App | Folder | Role |
|-----|--------|------|
| `app` | `jalgaonApi/app/` | Main application — all business logic, models, views, URLs |
| `api` | `jalgaonApi/api/` | **Duplicate** of auth endpoints from `app` — only Register/Login/Logout/User/Token |

> ⚠️ **BUG:** The `api/` app routes (`/api/register/`, `/api/login/`) are duplicates of `app/` routes (`/app/register/`, `/app/login/`). Both are registered in `jalgaonApi/urls.py`. Only `app/` URLs are actually used by the frontend.

---

## 2. Database Schema — All 12 Models

> **Source File:** [`jalgaonApi/app/models.py`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonApi/app/models.py)

### 2.1 Entity Relationship Diagram

```
User (custom)
│
├──< ShopListing (many shops per user)
│       ├── MainCategory (FK)
│       ├── SubCategory (FK)
│       ├──< ShopReview (many reviews per shop)
│       └──< LikedShops (many users can like a shop)
│
├──< LikedShops
├──< ShopReview
└──< AdsListing

MainCategory
└── CategoryImg (FK — one image per main category)

SubCategory
└── MainCategory (FK)

ArticleModel
└──< ActiveArticle (FK — marks an article as active/visible)

HomeCrouselAds   (standalone)
BannerAds        (standalone, always single row)
FinanceData      (standalone — stock ticker data)
```

---

### 2.2 Model: `User`
> Custom user model — replaces Django's default `User`. Authentication uses **phone_number** instead of username.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | BigAutoField (PK) | auto | Primary key |
| `phone_number` | CharField(13) | unique, required | Used as USERNAME_FIELD |
| `first_name` | CharField(50) | null, blank | Optional |
| `last_name` | CharField(50) | null, blank | Optional |
| `profile_pic` | ImageField | null, blank | Uploads to `media/profile_pic/` |
| `is_active` | BooleanField | default True | Inherited from AbstractUser |
| `is_staff` | BooleanField | default False | Inherited |
| `is_superuser` | BooleanField | default False | Inherited |
| `date_joined` | DateTimeField | auto | Inherited |
| `last_login` | DateTimeField | null | Inherited |

**Auth Config in settings.py:**
```python
AUTH_USER_MODEL = 'app.User'
```

---

### 2.3 Model: `CategoryImg`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | BigAutoField (PK) | auto | |
| `category_img` | ImageField | required | Uploads to `static/assets/category_img` ⚠️ |
| `img_name` | CharField(50) | null, blank | Display name |

> ⚠️ **BUG:** `upload_to='static/assets/category_img'` — saves inside the `static/` folder instead of `media/`. This means the image is NOT served through Django's `MEDIA_URL` mechanism. Category images are effectively broken in production unless Nginx is configured to serve that exact path.

---

### 2.4 Model: `MainCategory`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | BigAutoField (PK) | auto | |
| `category_img` | ForeignKey(CategoryImg) | CASCADE | Nested in serializer |
| `main_category` | CharField(50) | required | Category name |

---

### 2.5 Model: `SubCategory`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | BigAutoField (PK) | auto | |
| `main_category` | ForeignKey(MainCategory) | CASCADE | Parent category |
| `sub_category` | CharField(50) | required | Subcategory name |
| `sub_category_img` | ImageField | required | Uploads to `static/assets/category_img` ⚠️ |

> ⚠️ Same upload path bug as `CategoryImg` above.

---

### 2.6 Model: `ShopListing` *(Core Model)*

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | BigAutoField (PK) | auto | |
| `user` | ForeignKey(User) | CASCADE | Owner of the listing |
| `main_category` | ForeignKey(MainCategory) | CASCADE | |
| `sub_category` | ForeignKey(SubCategory) | CASCADE | |
| `business_name` | CharField(50) | required | |
| `business_rating` | IntegerField | default=0 | Not auto-calculated from reviews |
| `business_address` | CharField(100) | required | Text address |
| `business_banner` | ImageField | required | Uploads to `static/assets/listedShops` ⚠️ |
| `sub_domain_one` | CharField(50) | null, blank | Tag/keyword 1 |
| `sub_domain_two` | CharField(50) | null, blank | Tag/keyword 2 |
| `sub_domain_three` | CharField(50) | null, blank | Tag/keyword 3 |
| `sub_domain_four` | CharField(50) | null, blank | Tag/keyword 4 |
| `sub_domain_five` | CharField(50) | null, blank | Tag/keyword 5 |
| `sub_domain_six` | CharField(50) | null, blank | Tag/keyword 6 |
| `sub_domain_seven` | CharField(50) | null, blank | Tag/keyword 7 |
| `business_origin` | CharField(50) | default="India" | Country of origin |
| `business_dob` | CharField(50) | default="N/A" | Year of establishment |
| `business_gst` | CharField(50) | default="N/A" | GST number |
| `business_description` | CharField(1000) | required | Up to 1000 chars |
| `business_img_one` | ImageField | required | Gallery image 1 |
| `business_img_two` | ImageField | required | Gallery image 2 |
| `business_img_three` | ImageField | required | Gallery image 3 |
| `business_no` | CharField(15) | required | Business phone |
| `business_email` | CharField(50) | required | Business email |
| `insta_link` | CharField(1000) | null, blank | Instagram URL |
| `facebook_link` | CharField(1000) | null, blank | Facebook URL |
| `website_link` | CharField(1000) | null, blank | Website URL |
| `gmap_link` | CharField(1000) | null, blank | Google Maps URL |
| `is_valid` | BooleanField | default=False | Admin approval flag |

> ⚠️ `is_valid` field is present in the model but **never checked** in any view. Unapproved listings are still returned in all API responses.

---

### 2.7 Model: `HomeCrouselAds`

| Field | Type | Notes |
|-------|------|-------|
| `id` | BigAutoField (PK) | |
| `crousel_add_img` | ImageField | Uploads to `static/assets/AdsImages` ⚠️ |

---

### 2.8 Model: `BannerAds`

| Field | Type | Notes |
|-------|------|-------|
| `id` | BigAutoField (PK) | |
| `banner_add_home_one` | ImageField | Home page banner 1 |
| `banner_add_home_two` | ImageField | Home page banner 2 |
| `banner_add_category_one` | ImageField | Category page banner 1 |
| `banner_add_category_two` | ImageField | Category page banner 2 |
| `banner_add_category_three` | ImageField | Category page banner 3 |
| `banner_add_category_four` | ImageField | Category page banner 4 |

> ⚠️ `BannerAdsView` uses `.first()` — only ever returns the first row. Multiple rows in this table will be silently ignored.

---

### 2.9 Model: `FinanceData`

| Field | Type | Notes |
|-------|------|-------|
| `id` | BigAutoField (PK) | |
| `stock_title` | CharField(50) | e.g. "SENSEX" |
| `stock_price` | CharField(50) | Current price as string |
| `isUp` | BooleanField | Price direction |
| `stock_change` | CharField(50) | Change value |
| `stock_price_percentage` | CharField(50) | % change |

> ⚠️ Finance data is manually entered in admin. There is no integration with a live stock feed API.

---

### 2.10 Model: `AdsListing`

| Field | Type | Notes |
|-------|------|-------|
| `id` | BigAutoField (PK) | |
| `user` | ForeignKey(User) | CASCADE |
| `name` | CharField(255) | Advertiser name |
| `contact_number` | CharField(15) | |
| `contact_email` | CharField(255) | |
| `ad_type` | CharField(2) | Choices: `'BA'` (Banner), `'CA'` (Carousel) |
| `ad_image` | ImageField | Uploads to `static/assets/ads_images` ⚠️ |

---

### 2.11 Model: `ArticleModel`

| Field | Type | Notes |
|-------|------|-------|
| `id` | BigAutoField (PK) | |
| `title` | CharField(50) | Article title |
| `short_desc` | CharField(100) | Summary |
| `blog_img` | ImageField | Uploads to `static/assets/article_imgs` ⚠️ |
| `para_one` | CharField(1000) | Article body paragraph 1 |
| `para_two` | CharField(1000) | Paragraph 2 |
| `para_trhee` | CharField(1000) | Paragraph 3 (**typo in field name**) |
| `para_four` | CharField(1000) | Paragraph 4 |
| `para_five` | CharField(1000) | Paragraph 5 |

> ⚠️ `para_trhee` — this is a real field name with a **typo**. Any new UI rendering this must use the typo'd field name (`para_trhee`) to match the API response.

---

### 2.12 Model: `ActiveArticle`

| Field | Type | Notes |
|-------|------|-------|
| `id` | BigAutoField (PK) | |
| `article` | ForeignKey(ArticleModel) | CASCADE — links to an article |

> Articles are NOT shown on the frontend unless they have a corresponding `ActiveArticle` entry. This is the visibility toggle mechanism.

---

### 2.13 Model: `LikedShops`

| Field | Type | Notes |
|-------|------|-------|
| `id` | BigAutoField (PK) | |
| `user` | ForeignKey(User) | CASCADE |
| `shop_listing` | ForeignKey(ShopListing) | CASCADE |

> No `unique_together` constraint — the view checks for duplicates in Python code, not at the DB level.

---

### 2.14 Model: `ShopReview`

| Field | Type | Notes |
|-------|------|-------|
| `id` | BigAutoField (PK) | |
| `user` | ForeignKey(User) | CASCADE |
| `shop_listing` | ForeignKey(ShopListing) | CASCADE |
| `rating_star` | CharField(5) | Stored as string, not integer |
| `user_review` | CharField(2000) | Review text |
| `timestamp` | DateTimeField | auto_now_add — set on creation |

> ⚠️ `rating_star` is a `CharField` not an `IntegerField` or `DecimalField`. Sorting and averaging ratings requires string-to-number conversion.

---

## 3. Authentication Systems

> **Two separate systems** exist simultaneously. This causes confusion and inconsistency.
> Source: [`settings.py`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonApi/jalgaonApi/settings.py), [`views.py`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonApi/app/views.py)

```python
# settings.py — Both systems active simultaneously
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',   # System 1
        'rest_framework.authentication.SessionAuthentication',          # System 2
        'rest_framework.authentication.TokenAuthentication',            # System 3
    ),
}
```

### 3.1 System A — Simple JWT (Used by Login + UserView)

| Parameter | Value |
|-----------|-------|
| Token Type | JWT (JSON Web Token) |
| Access Token Lifetime | **1 day** |
| Refresh Token Lifetime | **90 days** |
| Rotation | Enabled (new refresh token on each refresh) |
| Blacklist after rotation | Enabled |
| Algorithm | HS256 |
| Header | `Authorization: Bearer <access_token>` |
| Prefix | `Bearer` |

**How login works:**
1. `POST /app/login/` → Returns `{ user, token }` where `token` = JWT access token
2. Frontend stores JWT in `localStorage` under key **`'token'`**
3. JWT is sent as `Authorization: Bearer <token>` on protected requests

**JWT Token Lifetime Issue:** Access token expires in 1 day, but there is **no refresh logic** in the frontend. Once the token expires, users are silently logged out with no error message shown.

---

### 3.2 System B — DRF Token Auth (Used by Shop Listing + Ads)

| Parameter | Value |
|-----------|-------|
| Token Type | DRF Static Token (not JWT) |
| Lifetime | **Never expires** |
| Header | `Authorization: Token <token_key>` |
| Prefix | `Token` |
| Storage | `localStorage` under key **`'tokenKey'`** |

**How it works:**
1. After JWT login succeeds, frontend immediately calls `POST /app/tokenKey/`
2. `tokenKey` view authenticates with `username=phone_number` (uses Django's `authenticate()`)
3. Returns `{ token: <drf_static_token> }`
4. Frontend stores this in `localStorage` as **`'tokenKey'`**
5. `shopListing`, `adsListing`, and `updateShop` endpoints require `Authorization: Token <tokenKey>`

---

### 3.3 localStorage Key Summary

| Key | Contains | Used By |
|-----|----------|---------|
| `'token'` | JWT access token | `UserView`, `editShopsData`, `UserListedShops`, `LikedShops` |
| `'tokenKey'` | DRF static token | `shopListing` (create), `adsListing`, `updateShop` |
| `'user'` | JSON stringified `{ id, phone_number }` | Display purposes only |

---

### 3.4 Complete Auth Flow Diagram

```
User submits phone + password
          │
          ▼
POST /app/register/  (if new user)
          │
          ▼
POST /app/login/
   → Returns JWT access token ("token")
   → localStorage.setItem('token', jwt)
   → localStorage.setItem('user', JSON.stringify(user))
          │
          ▼
POST /app/tokenKey/  (called immediately after login)
   → Returns DRF static token
   → localStorage.setItem('tokenKey', drfToken)
          │
          ▼
User is now fully authenticated with both tokens
```

---

### 3.5 CSRF Token Flow

The frontend fetches a CSRF token before every mutating request:

```javascript
// Called before register, login, shopListing, adsListing
const response = await axios.get(`${djangoApi}/app/csrf-token/`);
const csrfToken = response.data.csrfToken;
// Then added to request headers as: 'X-CSRFToken': csrfToken
```

> ⚠️ **Issue:** CORS + CSRF together create complexity. The `csrf-token` endpoint uses `@ensure_csrf_cookie`, but since the API runs on a different subdomain (`api.jalgaon.com`) from the frontend (`www.jalgaon.com`), CSRF cookie sharing across subdomains requires `CSRF_COOKIE_DOMAIN` to be set. This is NOT set in `settings.py`, which may cause intermittent CSRF failures.

---

## 4. Complete API Endpoint Reference

> **All endpoints are prefixed with the base URL: `https://api.jalgaon.com`**
> **All app endpoints are under `/app/`**
> **All api (duplicate) endpoints are under `/api/`**

---

### 4.1 Authentication Endpoints

#### `POST /app/register/`
**Purpose:** Create a new user account.
**Auth Required:** No
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "phone_number": "9876543210",
  "password": "yourpassword"
}
```

**Success Response — 201 Created:**
```json
{
  "user": {
    "id": 5,
    "phone_number": "9876543210"
  }
}
```

**Error Response — 400 Bad Request:**
```json
{
  "phone_number": ["user with this phone number already exists."]
}
```

---

#### `POST /app/login/`
**Purpose:** Log in a user; returns a JWT access token.
**Auth Required:** No
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "phone_number": "9876543210",
  "password": "yourpassword"
}
```

**Success Response — 200 OK:**
```json
{
  "user": {
    "id": 5,
    "phone_number": "9876543210"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> ⚠️ The field `"token"` contains the **JWT Access Token**, NOT the DRF static token. Despite being named generically "token", it is specifically a Simple JWT access token. Frontend stores it under `localStorage.setItem('token', token)`.

**Error Response — 400 Bad Request:**
```json
{
  "non_field_errors": ["Invalid credentials"]
}
```

---

#### `POST /app/logout/`
**Purpose:** Log out. Uses Django session logout.
**Auth Required:** Session auth (not JWT)
**Content-Type:** `application/json`

**Success Response — 200 OK:** (empty body)

> ⚠️ **BUG:** This calls Django's `logout(request)` which clears the **session**, but the frontend stores auth in JWT + localStorage — not sessions. So calling this endpoint does NOT invalidate the JWT token. The user's JWT remains valid for the rest of its 1-day lifetime even after logout.

---

#### `GET /app/user/`
**Purpose:** Get the currently authenticated user's data.
**Auth Required:** Yes — `Authorization: Bearer <jwt_token>`

**Success Response — 200 OK:**
```json
{
  "user": {
    "id": 5,
    "phone_number": "9876543210"
  }
}
```

---

#### `POST /app/tokenKey/`
**Purpose:** Get a DRF static token (used for shop listing and ads endpoints).
**Auth Required:** No (but requires valid credentials)
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "phone_number": "9876543210",
  "password": "yourpassword"
}
```

**Success Response — 200 OK:**
```json
{
  "token": "a1b2c3d4e5f6..."
}
```

**Error Response — 400 Bad Request:**
```json
{
  "error": "Invalid phone number or password"
}
```

---

#### `GET /app/csrf-token/`
**Purpose:** Get a CSRF token cookie.
**Auth Required:** No
**Returns:**
```json
{
  "csrfToken": "abc123..."
}
```

---

#### JWT Standard Endpoints (from `simplejwt`):
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /app/token/` | POST | Obtain JWT token pair (access + refresh) |
| `POST /app/token/refresh/` | POST | Refresh an expired access token |

> ⚠️ These standard JWT endpoints exist but are **never used** by the frontend. The frontend uses the custom `/app/login/` endpoint instead.

---

### 4.2 Category Endpoints

#### `GET /app/categorys/`
**Purpose:** Get all main categories with their images.
**Auth Required:** No

**Success Response — 200 OK:**
```json
{
  "categories": [
    {
      "id": 1,
      "main_category": "Restaurants",
      "category_img": {
        "id": 1,
        "category_img": "static/assets/category_img/restaurant.jpg",
        "img_name": "Restaurants Icon"
      }
    }
  ]
}
```

---

#### `GET /app/subCategorys/`
**Purpose:** Get all sub-categories with their parent category name.
**Auth Required:** No

**Success Response — 200 OK:**
```json
{
  "categories": [
    {
      "id": 1,
      "sub_category": "Fast Food",
      "sub_category_img": "static/assets/category_img/fastfood.jpg",
      "main_category": "Restaurants"
    }
  ]
}
```

> Note: `main_category` here is a **string** (name), not an ID. This is due to the `SerializerMethodField` in `SubCategorySerializer`.

---

### 4.3 Business Listing Endpoints

#### `GET /app/filtered-business/?mainCategoryId=<id>`
**Purpose:** Get all shop listings for a given main category.
**Auth Required:** No
**Query Param:** `mainCategoryId` (integer, required)

**Success Response — 200 OK:**
Returns a raw JSON array of all shop listing fields (uses Django's `.values()` — not a serializer):
```json
[
  {
    "id": 3,
    "user_id": 2,
    "main_category_id": 1,
    "sub_category_id": 2,
    "business_name": "Sharma Sweets",
    "business_rating": 0,
    "business_address": "Main Road, Jalgaon",
    "business_banner": "static/assets/listedShops/banner.jpg",
    "sub_domain_one": "sweets",
    "sub_domain_two": "mithai",
    "...": "...",
    "is_valid": false
  }
]
```

> ⚠️ This endpoint uses `.values()` which returns a plain dict — NOT the `ShopListingSerializer`. So image URL format may differ from other shop endpoints. Also returns `is_valid: false` listings without filtering.

---

#### `GET /app/business-view/?productId=<id>`
**Purpose:** Get full details of one specific business/shop.
**Auth Required:** No
**Query Param:** `productId` (integer, required)

**Success Response — 200 OK:**
```json
{
  "id": 3,
  "user": 2,
  "main_category": 1,
  "sub_category": 2,
  "business_name": "Sharma Sweets",
  "business_rating": 0,
  "business_address": "Main Road, Jalgaon",
  "business_banner": "/media/static/assets/listedShops/banner.jpg",
  "sub_domain_one": "sweets",
  "sub_domain_two": "mithai",
  "sub_domain_three": null,
  "sub_domain_four": null,
  "sub_domain_five": null,
  "sub_domain_six": null,
  "sub_domain_seven": null,
  "business_origin": "India",
  "business_dob": "N/A",
  "business_gst": "N/A",
  "business_description": "Best sweets in Jalgaon.",
  "business_img_one": "/media/static/assets/listedShops/img1.jpg",
  "business_img_two": "/media/static/assets/listedShops/img2.jpg",
  "business_img_three": "/media/static/assets/listedShops/img3.jpg",
  "business_no": "9876543210",
  "business_email": "sharma@example.com",
  "insta_link": "https://instagram.com/sharma",
  "facebook_link": null,
  "website_link": null,
  "gmap_link": "https://www.google.com/maps/...",
  "is_valid": false
}
```

**Error Responses:**
```json
// 404 — product not found
{ "error": "Product not found" }

// 400 — missing query param
{ "error": "productId parameter is missing" }
```

---

#### `POST /app/shopListing/`
**Purpose:** Create a new business listing.
**Auth Required:** Yes — `Authorization: Token <drf_tokenKey>`
**Content-Type:** `multipart/form-data`

**Request Form Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `user` | integer | Yes | User's ID |
| `main_category` | integer | Yes | MainCategory ID |
| `sub_category` | integer | Yes | SubCategory ID |
| `business_name` | string | Yes | Max 50 chars |
| `business_address` | string | Yes | Max 100 chars |
| `business_description` | string | Yes | Max 1000 chars |
| `business_banner` | file | Yes | Image file |
| `business_img_one` | file | Yes | Image file |
| `business_img_two` | file | Yes | Image file |
| `business_img_three` | file | Yes | Image file |
| `business_no` | string | Yes | Phone number |
| `business_email` | string | Yes | Email |
| `sub_domain_one` to `seven` | string | No | Tags/keywords |
| `business_origin` | string | No | Default: "India" |
| `business_dob` | string | No | Default: "N/A" |
| `business_gst` | string | No | Default: "N/A" |
| `insta_link` | string | No | |
| `facebook_link` | string | No | |
| `website_link` | string | No | |
| `gmap_link` | string | No | |
| `business_rating` | integer | No | Default: 0 |
| `is_valid` | boolean | No | Default: false |

> ⚠️ **BUG:** Despite `@permission_classes([IsAuthenticated])` decorator being applied at class level, `ShopListingCreateView` uses class-level decorators which do not work for class-based views. However, there is also a separate function-based view `shop_listing` at `/app/shopListing/` that has NO auth. The URL routes to `ShopListingCreateView` (class-based). The decoration is broken — currently anyone can create a shop listing without authentication.

**Success Response — 201 Created:** Returns the complete serialized `ShopListing` object.

---

#### `PUT /app/updateShop/?shop_id=<id>`
**Purpose:** Update an existing shop listing.
**Auth Required:** `Authorization: Token <drf_tokenKey>`
**Content-Type:** `multipart/form-data`
**Query Param:** `shop_id` (integer)

> Same form fields as `shopListing/` POST. All fields are optional (partial update).

**Success Response — 200 OK:** Returns updated `ShopListing` object.
**Error Response — 404:** `{ "error": "ShopListing not found" }`

---

#### `GET /app/listedShops/?user_id=<id>`
**Purpose:** Get all shop listings created by a specific user.
**Auth Required:** Yes — `Authorization: Bearer <jwt_token>`
**Query Param:** `user_id` (integer)

**Success Response — 200 OK:** Array of `ShopListing` objects.

---

#### `GET /app/editShopsData/?shop_id=<id>`
**Purpose:** Get a single shop listing for editing (same as business-view but uses shop_id).
**Auth Required:** Yes — `Authorization: Bearer <jwt_token>`
**Query Param:** `shop_id` (integer)

**Success Response — 200 OK:** Single `ShopListing` serialized object.

---

#### `GET /app/searchResult/?search=<query>`
**Purpose:** Search shops by business name.
**Auth Required:** No
**Query Param:** `search` (string)
**Filter Backend:** DRF `SearchFilter` on `business_name` field.

**Success Response — 200 OK:**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    { ...ShopListing object... }
  ]
}
```

> ⚠️ **BUG:** `searchResult/` URL is registered **3 times** in `urls.py` (lines 46, 48, 52). This is harmless but indicates messy code.

---

### 4.4 Ads Endpoints

#### `POST /app/adsListing/`
**Purpose:** Submit an advertisement listing request.
**Auth Required:** Yes — `Authorization: Token <drf_tokenKey>`
**Content-Type:** `multipart/form-data`

**Request Form Fields:**

| Field | Type | Required |
|-------|------|----------|
| `user` | integer | Yes |
| `name` | string | Yes |
| `contact_number` | string | Yes |
| `contact_email` | string | Yes |
| `ad_type` | string | Yes — `'BA'` or `'CA'` |
| `ad_image` | file | Yes |

**Success Response — 201 Created:** Serialized `AdsListing` object.

---

#### `GET /app/crousel-ads/`
**Purpose:** Get all home page carousel ad images.
**Auth Required:** No

**Success Response — 200 OK:**
```json
{
  "ads": [
    {
      "id": 1,
      "crousel_add_img": "/media/static/assets/AdsImages/ad1.jpg"
    }
  ]
}
```

---

#### `GET /app/banner-ads/`
**Purpose:** Get the first banner ad set (home + category banners).
**Auth Required:** No

**Success Response — 200 OK:**
```json
{
  "id": 1,
  "banner_add_home_one": "/media/static/assets/AdsImages/home1.jpg",
  "banner_add_home_two": "/media/static/assets/AdsImages/home2.jpg",
  "banner_add_category_one": "/media/static/assets/AdsImages/cat1.jpg",
  "banner_add_category_two": "/media/static/assets/AdsImages/cat2.jpg",
  "banner_add_category_three": "/media/static/assets/AdsImages/cat3.jpg",
  "banner_add_category_four": "/media/static/assets/AdsImages/cat4.jpg"
}
```

---

### 4.5 Articles Endpoints

#### `GET /app/articles/`
**Purpose:** Get all articles (regardless of active status).
**Auth Required:** No
**Response:** DRF standard paginated list of `ArticleModel` objects.

---

#### `GET /app/active-articles/`
**Purpose:** Get only published/active articles.
**Auth Required:** No

**Success Response — 200 OK:**
```json
[
  {
    "article": {
      "id": 1,
      "title": "Jalgaon News",
      "short_desc": "Brief summary",
      "blog_img": "/media/static/assets/article_imgs/article1.jpg",
      "para_one": "First paragraph text...",
      "para_two": "Second paragraph text...",
      "para_trhee": "Third paragraph text...",
      "para_four": "Fourth paragraph text...",
      "para_five": "Fifth paragraph text..."
    }
  }
]
```

> ⚠️ Note the typo `"para_trhee"` — this is the actual API key name. Your new UI **must use this exact key**.

---

#### `GET /app/articleGet/?articleId=<id>`
**Purpose:** Get a single article by ID.
**Auth Required:** No
**Query Param:** `articleId` (integer)

**Success Response — 200 OK:** Single `ArticleModel` object (no wrapper key).

---

### 4.6 Finance / Stock Ticker Endpoint

#### `GET /app/finance-data/`
**Purpose:** Get the stock ticker data shown at the top of the homepage.
**Auth Required:** No

**Success Response — 200 OK:**
```json
{
  "financeData": [
    {
      "id": 1,
      "stock_title": "SENSEX",
      "stock_price": "78540.00",
      "isUp": true,
      "stock_change": "+240.50",
      "stock_price_percentage": "+0.31%"
    }
  ]
}
```

---

### 4.7 Liked Shops Endpoints

#### `GET /app/likedShops/?user_id=<id>`
**Purpose:** Get all shops liked by a user.
**Auth Required:** Yes — `Authorization: Bearer <jwt_token>`

**Success Response — 200 OK:**
```json
[
  {
    "user": 5,
    "shop_listing": {
      // Full ShopListing nested object
    }
  }
]
```

---

#### `POST /app/likedShops/`
**Purpose:** Like a shop.
**Auth Required:** Yes — `Authorization: Bearer <jwt_token>`
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "user": 5,
  "shop_listing": 3
}
```

**Success Response — 201 Created:**
```json
{
  "user": 5,
  "shop_listing": { ...full nested shop object... }
}
```

**Error — 400 (already liked):**
```json
{ "error": "This shop listing is already liked by this user" }
```

---

### 4.8 Shop Reviews Endpoints

#### `POST /app/shop_reviews/`
**Purpose:** Submit a review for a shop.
**Auth Required:** Yes — `Authorization: Token <drf_tokenKey>`
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "shop_listing": 3,
  "rating_star": "4",
  "user_review": "Great service and amazing food!"
}
```

> Note: `user` is NOT sent in the request body. The view extracts it from `request.user`.

**Success Response — 201 Created:**
```json
{
  "user": 5,
  "shop_listing": 3,
  "rating_star": "4",
  "user_review": "Great service and amazing food!",
  "timestamp": "2024-10-15T12:30:00Z"
}
```

> ⚠️ **BUG:** `serializer.save(user=user)` is called, but `ShopReviewCreateSerializer` does not accept `user` as a kwarg to `save()`. This will raise a `TypeError` in production. The `user` field must be included in `validated_data`, not passed to `save()`.

---

#### `GET /app/get_shop_reviews/`
**Purpose:** Get all reviews (supposed to filter by shop, but the filter is commented out).
**Auth Required:** Yes — `Authorization: Token <drf_tokenKey>`

> ⚠️ **CRITICAL BUG:** The view reads `shop_id = request.data.get('shop_listing')` but this is a GET request — `request.data` is always empty for GET. The filter `ShopReview.objects.filter(shop_listing=shop_id)` line is **commented out**. Currently this endpoint returns **ALL reviews for ALL shops** regardless of what's passed.

---

### 4.9 Complete Endpoint Quick Reference

| # | Method | URL | Auth | Purpose |
|---|--------|-----|------|---------|
| 1 | POST | `/app/register/` | None | Register new user |
| 2 | POST | `/app/login/` | None | Login, get JWT |
| 3 | POST | `/app/logout/` | Session | Logout (session only) |
| 4 | GET | `/app/user/` | Bearer JWT | Get current user |
| 5 | POST | `/app/tokenKey/` | None | Get DRF static token |
| 6 | GET | `/app/csrf-token/` | None | Get CSRF token |
| 7 | POST | `/app/token/` | None | JWT obtain pair (unused) |
| 8 | POST | `/app/token/refresh/` | None | Refresh JWT (unused) |
| 9 | GET | `/app/categorys/` | None | All main categories |
| 10 | GET | `/app/subCategorys/` | None | All sub-categories |
| 11 | POST | `/app/shopListing/` | Token DRF | Create shop listing |
| 12 | PUT | `/app/updateShop/` | Token DRF | Update shop listing |
| 13 | GET | `/app/filtered-business/` | None | Shops by category |
| 14 | GET | `/app/business-view/` | None | Single shop detail |
| 15 | GET | `/app/editShopsData/` | Bearer JWT | Get shop for editing |
| 16 | GET | `/app/listedShops/` | Bearer JWT | User's shops |
| 17 | GET | `/app/likedShops/` | Bearer JWT | User's liked shops |
| 18 | POST | `/app/likedShops/` | Bearer JWT | Like a shop |
| 19 | POST | `/app/shop_reviews/` | Token DRF | Submit review |
| 20 | GET | `/app/get_shop_reviews/` | Token DRF | Get reviews (broken) |
| 21 | GET | `/app/articles/` | None | All articles |
| 22 | GET | `/app/active-articles/` | None | Active articles only |
| 23 | GET | `/app/articleGet/` | None | Single article by ID |
| 24 | GET | `/app/finance-data/` | None | Stock ticker data |
| 25 | GET | `/app/crousel-ads/` | None | Carousel ad images |
| 26 | GET | `/app/banner-ads/` | None | Banner ad images |
| 27 | POST | `/app/adsListing/` | Token DRF | Submit ad request |
| 28 | GET | `/app/searchResult/` | None | Search shops by name |

---

## 5. Request / Response Data Formats

### 5.1 Common Response Structure Patterns

| Pattern | Example Endpoint | Wrapper Key |
|---------|-----------------|-------------|
| Keyed object `{ "user": {...} }` | `/app/user/`, `/app/login/` | `"user"` |
| Keyed list `{ "categories": [...] }` | `/app/categorys/`, `/app/subCategorys/` | `"categories"` |
| Keyed list `{ "ads": [...] }` | `/app/crousel-ads/` | `"ads"` |
| Keyed list `{ "financeData": [...] }` | `/app/finance-data/` | `"financeData"` |
| Raw flat object | `/app/business-view/`, `/app/banner-ads/` | None |
| Raw array | `/app/filtered-business/` | None |
| DRF paginated | `/app/searchResult/` | `count`, `next`, `previous`, `results` |

> ⚠️ **Inconsistency:** There is no standardized wrapper pattern across endpoints. Some return `{ "key": data }`, others return raw objects or arrays. Each endpoint must be handled individually.

---

### 5.2 Image URL Format

Images are returned as **relative paths** like:
```
"business_banner": "static/assets/listedShops/banner.jpg"
```

The frontend must prepend the base API URL to form a full URL:
```javascript
const imageUrl = `${import.meta.env.VITE_DJANGO_API}/media/${imagePath}`;
// OR sometimes without /media/:
const imageUrl = `${import.meta.env.VITE_DJANGO_API}/${imagePath}`;
```

> ⚠️ **Critical Issue:** Because all upload paths start with `static/assets/...` instead of using `media/`, images uploaded through the admin are stored under `jalgaonApi/media/static/assets/...`. The file path returned by the API starts with `static/...`, so the full serving URL becomes `https://api.jalgaon.com/media/static/assets/...`. This is non-standard and fragile.

In settings.py:
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```
And in `urls.py`, media files are only served in DEBUG mode:
```python
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```
> ⚠️ **CRITICAL BUG:** In production, `DEBUG = True` (which is itself a bug), so media files ARE being served by Django — but this is wrong. In production, Nginx should serve media files directly for performance and security. Django should never serve media files in production.

---

## 6. File Upload & Media Handling

### 6.1 How File Uploads Work

All file uploads use `multipart/form-data`. The frontend builds a `FormData` object and sends it with the appropriate auth header:

```javascript
const data = new FormData();
data.append('business_banner', file);
// ...
await axios.post('/app/shopListing/', data, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Token ${tokenKey}`,
  }
});
```

### 6.2 Upload Destinations

| Model Field | `upload_to` Value | Actual Disk Path |
|-------------|-------------------|------------------|
| `User.profile_pic` | `'profile_pic'` | `media/profile_pic/` |
| `CategoryImg.category_img` | `'static/assets/category_img'` | `media/static/assets/category_img/` |
| `SubCategory.sub_category_img` | `'static/assets/category_img'` | `media/static/assets/category_img/` |
| `ShopListing.business_banner` | `'static/assets/listedShops'` | `media/static/assets/listedShops/` |
| `ShopListing.business_img_one/two/three` | `'static/assets/listedShops'` | `media/static/assets/listedShops/` |
| `HomeCrouselAds.crousel_add_img` | `'static/assets/AdsImages'` | `media/static/assets/AdsImages/` |
| `BannerAds.*` | `'static/assets/AdsImages'` | `media/static/assets/AdsImages/` |
| `AdsListing.ad_image` | `'static/assets/ads_images'` | `media/static/assets/ads_images/` |
| `ArticleModel.blog_img` | `'static/assets/article_imgs'` | `media/static/assets/article_imgs/` |

### 6.3 Image Compression

`browser-image-compression` package is installed but **commented out** in `AddListingForm.jsx` (lines 171-202). No image compression occurs before upload. Large images are uploaded raw.

---

## 7. CORS Configuration

> **Source:** [`settings.py`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonApi/jalgaonApi/settings.py) lines 151–158

```python
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'https://api.jalgaon.com',
    'https://www.jalgaon.com',
    'capacitor://localhost'       # Android app origin
]
```

### 7.1 What This Means

| Setting | Value | Implication |
|---------|-------|-------------|
| `CORS_ALLOW_CREDENTIALS` | `True` | Cookies/auth headers are forwarded cross-origin |
| Allowed Origins | 3 specific origins | Only these origins can call the API |
| `capacitor://localhost` | Included | Android Capacitor app is allowed |
| `http://localhost:5173` | **NOT included** | Local development calls will fail with CORS error |

> ⚠️ **For local development:** You need to either add `http://localhost:5173` to `CORS_ALLOWED_ORIGINS` OR use `CORS_ALLOW_ALL_ORIGINS = True` temporarily.

### 7.2 CORS Middleware Position

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # ⚠️ Should be at the TOP
]
```

> ⚠️ **BUG:** `corsheaders.middleware.CorsMiddleware` must be placed **as high as possible**, particularly before `CommonMiddleware`. Currently it is at the bottom of the middleware list. This means CORS headers may not be correctly applied in all cases (e.g., for OPTIONS preflight requests that short-circuit before `CommonMiddleware`).

---

## 8. Frontend API Call Patterns

### 8.1 Axios Configuration

Set up in [`Layout.jsx`](file:///e:/Deepali/Internship/Simplesphere/Projects/Jalgaon_web/jalgaonWeb/jalgaonUi/src/Layout.jsx):

```javascript
// Global axios defaults
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

// Client with base URL and JWT interceptor
const client = axios.create({ baseURL: import.meta.env.VITE_DJANGO_API });
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');  // ⚠️ Wrong key — should be 'token'
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
```

> ⚠️ **BUG in Layout.jsx:** The interceptor reads `localStorage.getItem('authToken')` but the actual key used by `LoginSignup.jsx` is `localStorage.setItem('token', token)`. The key mismatch means this interceptor **never attaches the Authorization header**. Auth works in `LoginSignup.jsx` and `UserContext.jsx` because they manually specify the correct key.

### 8.2 Environment Variable

```bash
# .env (committed to git ⚠️)
VITE_DJANGO_API=https://api.jalgaon.com
```

All components access this as:
```javascript
const djangoApi = import.meta.env.VITE_DJANGO_API;
// Used as: `${djangoApi}/app/endpoint/`
```

### 8.3 Frontend Routes

| Route | Component | API Calls Made |
|-------|-----------|----------------|
| `/` | `Home.jsx` | Renders Stocktickle, Advertise, Categorytile, Articles components |
| `/categories/:mainCategoryId/:mainCategory` | `CategoryPage.jsx` | `GET /app/filtered-business/` |
| `/productView/:productId` | `BusinessDetailsPage.jsx` | `GET /app/business-view/` |
| `/account` | `Account.jsx` | `GET /app/user/`, `GET /app/listedShops/`, `GET /app/likedShops/` |
| `/addListig` | `AddListingPage.jsx` | `GET /app/categorys/`, `POST /app/shopListing/` |
| `/editForm/:shopId` | `AddListingForm (edit mode)` | `GET /app/editShopsData/`, `PUT /app/updateShop/` |
| `/advertise` | `AddAdvertise.jsx` | `POST /app/adsListing/` |
| `/allarticlse` | `ArticlesPage.jsx` | `GET /app/active-articles/` |
| `/articleView/:articleId` | `ArticleViewPage.jsx` | `GET /app/articleGet/` |
| `/searchResults` | `SearchPage.jsx` | `GET /app/searchResult/` |
| `/about` | `AboutPage.jsx` | None |
| `/contact` | `ContactPage.jsx` | None |
| `/termsAndCondition` | `TermsPage.jsx` | None |

> ⚠️ **Typo in route:** `/allarticlse` (line 30 in `main.jsx`) — the 'e' and 's' are swapped in "articles". If your new UI links to `/allarticles`, it will 404.

---

## 9. Error Handling Patterns

### 9.1 Backend Error Response Formats

The backend has **inconsistent** error response formats:

| Scenario | Format |
|----------|--------|
| DRF Validation Error | `{ "field_name": ["error message"] }` |
| Custom validation | `{ "error": "message" }` |
| Non-field DRF error | `{ "non_field_errors": ["message"] }` |
| Function views | `{ "error": "message" }` or `JsonResponse({'error': ...})` |

### 9.2 Frontend Error Handling

Currently very minimal. Most errors are:
1. `console.error(...)` — logged to browser console only
2. `setErrorMessage(...)` — sets local component state for inline display
3. `alert("Something went wrong")` — native browser popup (not user-friendly)

No centralized error handling, no toast notifications, no HTTP error interceptors in the new codebase.

### 9.3 Missing Error States

The following scenarios have **no user-facing error handling**:
- API request timeout
- Network failure
- 401 Unauthorized (expired JWT)
- 403 Forbidden (insufficient permissions)
- 500 Internal Server Error

---

## 10. Confirmed Bugs & Issues

> All issues below are directly proven from source code. Severity: 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low/Code Quality

### Security Issues

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 1 | 🔴 | `settings.py:15` | `DEBUG = True` in production — exposes full tracebacks, enables Django debug toolbar |
| 2 | 🔴 | `settings.py:12` | `SECRET_KEY` hardcoded in source code — anyone with repo access can forge sessions/tokens |
| 3 | 🔴 | `settings.py:111` | Database password hardcoded in source code |
| 4 | 🔴 | `utils.py:5` | Fast2SMS API key hardcoded |
| 5 | 🔴 | `.env:5` | `.env` file committed to git and set to production API URL — exposes API endpoint to all contributors |
| 6 | 🟠 | `settings.py:112` | DB connects via public IP (`65.1.52.6`) — should use private/internal Lightsail IP |
| 7 | 🟠 | `settings.py:45` | `CorsMiddleware` placed at bottom of middleware list — should be at top |

### Authentication & Auth Flow Issues

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 8 | 🔴 | `views.py:41-47` | `UserLogout` only clears Django session — JWT token remains valid after logout |
| 9 | 🟠 | `Layout.jsx:20` | Auth interceptor reads `'authToken'` but login stores as `'token'` — interceptor never works |
| 10 | 🟠 | No frontend code | No JWT refresh logic — when 1-day token expires, user is silently logged out |
| 11 | 🟡 | `views.py:102` | `@permission_classes` decorator doesn't work on class-based views — `ShopListingCreateView` is effectively unauthenticated |

### Data & Business Logic Issues

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 12 | 🔴 | `views.py:375` | `serializer.save(user=user)` passes user as kwarg but serializer doesn't support it — `submit_review` will raise `TypeError` |
| 13 | 🟠 | `views.py:383-385` | `get_shop_reviews` reads `request.data` on a GET request (always empty); filter is commented out — returns ALL reviews |
| 14 | 🟠 | `models.py:103` | `ShopListing.is_valid` exists but is never checked in views — invalid/unapproved listings shown to all users |
| 15 | 🟠 | `views.py:197` | `BannerAds.objects.first()` — only ever returns one row; multiple banner sets impossible |
| 16 | 🟡 | `models.py:175` | `para_trhee` field typo — UI must match this exact typo |

### Code Quality Issues

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 17 | 🟡 | `serializers.py:153-165` | `ShopReviewCreateSerializer` is **defined twice** — second definition silently overrides first |
| 18 | 🟡 | `urls.py:46,48,52` | `searchResult/` URL registered 3 times |
| 19 | 🟡 | `api/urls.py` | `api/` app is a complete duplicate of `app/` auth URLs — dead code |
| 20 | 🟡 | `main.jsx:30` | Route `/allarticlse` has a typo — should be `/allarticles` |
| 21 | 🔵 | `models.py:197` | `rating_star` stored as `CharField` not `IntegerField` — prevents meaningful numeric operations |
| 22 | 🔵 | `AddListingForm.jsx:7` | `imageCompression` imported but functionality commented out — dead import |

---

## 11. Production-Safe UI Migration Strategy

### 11.1 The Golden Rule

> **The backend does not change during a UI redesign.**
> All new UI components must consume the **same API endpoints** with the **same request/response format**.
> The redesign is purely a frontend (React) change.

### 11.2 Recommended Pre-Migration Steps

Before touching any UI, address these backend issues to avoid integration problems:

| Priority | Action | Risk if Skipped |
|----------|--------|-----------------|
| 1 | Add `http://localhost:5173` to `CORS_ALLOWED_ORIGINS` in a local dev copy | Frontend cannot call API locally |
| 2 | Move `CorsMiddleware` to top of middleware list | CORS errors on some browsers |
| 3 | Note the `localStorage` key inconsistency (`'token'` vs `'authToken'`) | Auth headers never attached in new UI |
| 4 | Note the `para_trhee` typo — use it as-is in new article components | Article paragraph 3 won't render |
| 5 | Note that `rating_star` comes back as a string | Rating display needs `parseInt()` or `parseFloat()` |

### 11.3 Safe Deployment Workflow (Zero-Downtime)

```
Step 1: Create feature branch
  git checkout -b feature/ui-redesign-v2

Step 2: Develop and test locally
  npm run dev  (in jalgaonUi/)
  → Point VITE_DJANGO_API to https://api.jalgaon.com (or local backend)

Step 3: Build and preview locally
  npm run build
  npm run preview
  → Test all routes, auth flows, image loading

Step 4: Backup production dist on server (via SSH)
  cp -r /path/to/jalgaonApi/dist /path/to/jalgaonApi/dist_backup_YYYYMMDD

Step 5: Copy new dist to backend folder
  # In jalgaonUi/:
  npm run build
  # Then copy dist/ to jalgaonApi/dist/

Step 6: Commit and push
  git add .
  git commit -m "feat: UI redesign v2 from Stitch"
  git push origin feature/ui-redesign-v2

Step 7: On server — pull and verify
  git pull origin feature/ui-redesign-v2
  # Test live site immediately

Step 8: Rollback if needed (< 30 seconds)
  rm -rf jalgaonApi/dist
  mv jalgaonApi/dist_backup_YYYYMMDD jalgaonApi/dist
  # Site is instantly restored — no server restart needed
```

### 11.4 What You Can Safely Change in the New UI

✅ All CSS styling, colors, typography, layout, spacing
✅ Component structure and file organization
✅ Adding new reusable UI components
✅ Improving error handling and user feedback (toasts instead of alerts)
✅ Adding loading states and skeleton screens
✅ Improving form UX (better validation messages)
✅ Mobile responsiveness improvements

### 11.5 What Must NOT Be Changed Without Backend Coordination

❌ Do not change API endpoint URLs — backend is live
❌ Do not change the `VITE_DJANGO_API` environment variable without testing
❌ Do not change the `localStorage` key names (`'token'`, `'tokenKey'`, `'user'`) without updating all consumers
❌ Do not change the article field name `para_trhee` — it is the real DB field name
❌ Do not add new API calls that require new backend endpoints without creating them first

---

*Document generated from complete codebase analysis on 2026-06-20.*
*Source files analyzed: `models.py`, `views.py`, `serializers.py`, `urls.py` (app + api + project), `settings.py`, `utils.py`, `admin.py`, `Layout.jsx`, `LoginSignup.jsx`, `AddListingForm.jsx`, `AddAdvertiseForm.jsx`, `UserContext.jsx`, `LoginContext.jsx`, `Providers.jsx`, `main.jsx`, `.env`*
