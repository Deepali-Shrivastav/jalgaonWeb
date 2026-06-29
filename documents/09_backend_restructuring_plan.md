# Jalgaon.com — Full-Stack Restructuring Plan

> **Purpose:** Split monolithic `app/` into 21 Django apps inside `apps/` folder + update all frontend API calls  
> **Current State:** All backend in `jalgaonApi/app/`, all frontend calls use `/app/` prefix

---

## 1. Target Backend Structure

All 21 modules go inside an `apps/` directory (not directly in `jalgaonApi/`):

```
jalgaonApi/
├── apps/                          ← All modules live here
│   ├── __init__.py
│   ├── accounts/                  ← Auth, User, OTP, Sessions
│   ├── directory/                 ← Categories, Listings, Favorites
│   ├── search/                    ← Full-text, Geo, Autocomplete
│   ├── reviews/                   ← Ratings & Reviews
│   ├── news/                      ← News Portal
│   ├── blog/                      ← Blog Module
│   ├── jobs/                      ← Job Portal
│   ├── events/                    ← Event Module
│   ├── ads/                       ← Advertisement System
│   ├── payments/                  ← Razorpay, Subscriptions
│   ├── notifications/             ← Email, SMS, In-App
│   ├── dashboard/                 ← User Dashboard APIs
│   ├── admin_panel/               ← Admin Dashboard APIs
│   ├── cms/                       ← City Information Pages
│   ├── media_lib/                 ← Media Upload & CDN
│   ├── audit/                     ← Audit Logs
│   ├── analytics/                 ← Analytics & Reports
│   ├── startups/                  ← Startup Ecosystem
│   ├── clubs/                     ← Club Activities
│   ├── tourism/                   ← Tourist Places
│   ├── ngo/                       ← NGO Directory
│   └── finance/                   ← Finance Data
├── core/                          ← Shared utilities, permissions, mixins
├── jalgaonApi/                    ← Django project config
│   ├── settings.py
│   └── urls.py
└── manage.py
```

Each app structure:
```
apps/accounts/
├── __init__.py
├── apps.py              ← name = 'apps.accounts'
├── models.py
├── views.py
├── serializers.py
├── urls.py
├── admin.py
├── permissions.py       (if needed)
├── tasks.py             (Celery, if needed)
├── tests/
└── migrations/
```

---

## 2. Code Migration Map (Backend)

### 2.1 `apps/accounts/` — Auth & User

| Source (`app/`) | Code | Target |
|-----------------|------|--------|
| models.py L6–37 | `UserManager`, `User` | apps/accounts/models.py |
| serializers.py L6–39 | `UserRegisterSerializer`, `UserLoginSerializer`, `UserSerializer` | apps/accounts/serializers.py |
| views.py L16–66 | `UserRegister`, `UserLogin`, `UserLogout`, `UserView`, `get_csrf_token` | apps/accounts/views.py |
| views.py L146–161 | `ObtainTokenKeyView` | apps/accounts/views.py |
| utils.py L1–22 | `send_otp()` | apps/accounts/utils.py |
| admin.py L4–22 | `CustomUserAdmin` | apps/accounts/admin.py |

**Settings:** `AUTH_USER_MODEL = 'accounts.User'`  
**DB preservation:** `class Meta: db_table = 'app_user'`

### 2.2 `apps/directory/` — Categories + Listings + Favorites

| Source (`app/`) | Code | Target |
|-----------------|------|--------|
| models.py L40–107 | `CategoryImg`, `MainCategory`, `SubCategory`, `ShopListing` | apps/directory/models.py |
| models.py L187–192 | `LikedShops` | apps/directory/models.py |
| serializers.py L44–98, L137–151 | Category + Listing + Liked serializers | apps/directory/serializers.py |
| views.py L69–93 | `CategoryView`, `SubCategoryView` | apps/directory/views.py |
| views.py L100–131 | `ShopListingCreateView`, `shop_listing` | apps/directory/views.py |
| views.py L208–358 | `get_products_by_category`, `ProductDetailView`, `LikedShopsView`, `UserListedShops`, `UserListedShopsEdit`, `UpdateShopListingView` | apps/directory/views.py |
| admin.py L26–29, L36 | Category + Listing + LikedShops registrations | apps/directory/admin.py |

**DB preservation:** `db_table = 'app_categoryimg'`, `'app_maincategory'`, `'app_subcategory'`, `'app_shoplisting'`, `'app_likedshops'`

### 2.3 `apps/search/`

| Source | Code | Target |
|--------|------|--------|
| views.py L391–398 | `ShopSearchView` | apps/search/views.py |

### 2.4 `apps/reviews/`

| Source | Code | Target |
|--------|------|--------|
| models.py L194–203 | `ShopReview` | apps/reviews/models.py |
| serializers.py L153–173 | `ShopReviewCreateSerializer`, `ShopReviewSerializer` | apps/reviews/serializers.py |
| views.py L360–387 | `submit_review`, `get_shop_reviews` | apps/reviews/views.py |
| admin.py L37 | `ShopReview` registration | apps/reviews/admin.py |

**DB preservation:** `db_table = 'app_shopreview'`

### 2.5 `apps/news/`

| Source | Code | Target |
|--------|------|--------|
| models.py L169–185 | `ArticleModel`, `ActiveArticle` | apps/news/models.py |
| serializers.py L124–135 | `ArticleModelSerializer`, `ActiveArticleSerializer` | apps/news/serializers.py |
| views.py L247–279 | `ArticleListView`, `ActiveArticleListView`, `get_article_by_id` | apps/news/views.py |
| admin.py L34–35 | Article registrations | apps/news/admin.py |

**DB preservation:** `db_table = 'app_articlemodel'`, `'app_activearticle'`

### 2.6 `apps/ads/`

| Source | Code | Target |
|--------|------|--------|
| models.py L114–165 | `HomeCrouselAds`, `BannerAds`, `AdsListing` | apps/ads/models.py |
| serializers.py L101–121 | Ad serializers | apps/ads/serializers.py |
| views.py L179–244 | `HomeCrouselAdsView`, `BannerAdsView`, `AdsListingCreateAPIView` | apps/ads/views.py |
| admin.py L31–33 | Ad registrations | apps/ads/admin.py |

**DB preservation:** `db_table = 'app_homecrouselads'`, `'app_bannerads'`, `'app_adslisting'`

### 2.7 `apps/finance/`

| Source | Code | Target |
|--------|------|--------|
| models.py L130–138 | `FinanceData` | apps/finance/models.py |
| serializers.py L111–114 | `FinanceDataSerializer` | apps/finance/serializers.py |
| views.py L165–176 | `FinanceTickleView` | apps/finance/views.py |
| admin.py L30 | `FinanceData` registration | apps/finance/admin.py |

**DB preservation:** `db_table = 'app_financedata'`

### 2.8 Skeleton Apps (No existing code — built in later phases)

| App | Phase | Key Models to Build |
|-----|-------|---------------------|
| `apps/blog/` | Phase 3 | BlogPost, BlogCategory, BlogTag |
| `apps/jobs/` | Phase 3 | Job, JobApplication, JobCategory |
| `apps/events/` | Phase 3 | Event, EventCategory |
| `apps/payments/` | Phase 2 | Payment, Subscription, Invoice, Package |
| `apps/notifications/` | Phase 2 | Notification, NotificationTemplate |
| `apps/dashboard/` | Phase 2 | (aggregates from other apps) |
| `apps/admin_panel/` | Phase 1 | AdminSetting, ModerationQueue |
| `apps/cms/` | Phase 3 | Page, PageCategory |
| `apps/media_lib/` | Phase 2 | MediaFile, MediaFolder |
| `apps/audit/` | Phase 2 | AuditLog |
| `apps/analytics/` | Phase 4 | AnalyticsEvent, Report |
| `apps/startups/` | Phase 3 | Startup, Founder |
| `apps/clubs/` | Phase 3 | Club, ClubActivity |
| `apps/tourism/` | Phase 3 | TouristPlace, TouristReview |
| `apps/ngo/` | Phase 3 | NGO, NGOCategory |

### 2.9 Code to DELETE

| Source | Code | Reason |
|--------|------|--------|
| urls.py L48, L52 | Duplicate `/searchResult/` | Duplicates |
| `api/` directory | Entire app | Redundant |

---

## 3. Backend URL Changes

### New main `urls.py`:

```python
# jalgaonApi/urls.py
from django.urls import path, include

urlpatterns = [
    path('admin/',               admin.site.urls),
    path('api/v1/auth/',         include('apps.accounts.urls')),
    path('api/v1/listings/',     include('apps.directory.urls')),
    path('api/v1/search/',       include('apps.search.urls')),
    path('api/v1/reviews/',      include('apps.reviews.urls')),
    path('api/v1/news/',         include('apps.news.urls')),
    path('api/v1/blog/',         include('apps.blog.urls')),
    path('api/v1/jobs/',         include('apps.jobs.urls')),
    path('api/v1/events/',       include('apps.events.urls')),
    path('api/v1/ads/',          include('apps.ads.urls')),
    path('api/v1/payments/',     include('apps.payments.urls')),
    path('api/v1/notifications/',include('apps.notifications.urls')),
    path('api/v1/dashboard/',    include('apps.dashboard.urls')),
    path('api/v1/admin-panel/',  include('apps.admin_panel.urls')),
    path('api/v1/cms/',          include('apps.cms.urls')),
    path('api/v1/media/',        include('apps.media_lib.urls')),
    path('api/v1/analytics/',    include('apps.analytics.urls')),
    path('api/v1/startups/',     include('apps.startups.urls')),
    path('api/v1/clubs/',        include('apps.clubs.urls')),
    path('api/v1/tourism/',      include('apps.tourism.urls')),
    path('api/v1/ngo/',          include('apps.ngo.urls')),
    path('api/v1/finance/',      include('apps.finance.urls')),
]
```

### Settings INSTALLED_APPS:

```python
# Remove:
'app',
'api',

# Add:
'core',
'apps.accounts',
'apps.directory',
'apps.search',
'apps.reviews',
'apps.news',
'apps.blog',
'apps.jobs',
'apps.events',
'apps.ads',
'apps.payments',
'apps.notifications',
'apps.dashboard',
'apps.admin_panel',
'apps.cms',
'apps.media_lib',
'apps.audit',
'apps.analytics',
'apps.startups',
'apps.clubs',
'apps.tourism',
'apps.ngo',
'apps.finance',
]
```

---

## 4. Frontend API Migration Map

### Current pattern: `${djangoApi}/app/<endpoint>`
### New pattern: `${djangoApi}/api/v1/<module>/<endpoint>`

### 4.1 Complete Endpoint Mapping (Old → New)

| Old Backend URL | New Backend URL | Module |
|----------------|-----------------|--------|
| `/app/register/` | `/api/v1/auth/register/` | accounts |
| `/app/login/` | `/api/v1/auth/login/` | accounts |
| `/app/logout/` | `/api/v1/auth/logout/` | accounts |
| `/app/user/` | `/api/v1/auth/user/` | accounts |
| `/app/token/` | `/api/v1/auth/token/` | accounts |
| `/app/token/refresh/` | `/api/v1/auth/token/refresh/` | accounts |
| `/app/csrf-token/` | `/api/v1/auth/csrf-token/` | accounts |
| `/app/tokenKey/` | `/api/v1/auth/token-key/` | accounts |
| `/app/categorys/` | `/api/v1/listings/categories/` | directory |
| `/app/subCategorys/` | `/api/v1/listings/subcategories/` | directory |
| `/app/shopListing/` | `/api/v1/listings/` | directory |
| `/app/updateShop/` | `/api/v1/listings/update/` | directory |
| `/app/filtered-business/` | `/api/v1/listings/by-category/` | directory |
| `/app/business-view/` | `/api/v1/listings/detail/` | directory |
| `/app/listedShops/` | `/api/v1/listings/my-listings/` | directory |
| `/app/editShopsData/` | `/api/v1/listings/edit-data/` | directory |
| `/app/likedShops/` | `/api/v1/listings/favorites/` | directory |
| `/app/searchResult/` | `/api/v1/search/` | search |
| `/app/shop_reviews/` | `/api/v1/reviews/` | reviews |
| `/app/get_shop_reviews/` | `/api/v1/reviews/by-shop/` | reviews |
| `/app/articles/` | `/api/v1/news/articles/` | news |
| `/app/active-articles/` | `/api/v1/news/active/` | news |
| `/app/articleGet/` | `/api/v1/news/detail/` | news |
| `/app/crousel-ads/` | `/api/v1/ads/carousel/` | ads |
| `/app/banner-ads/` | `/api/v1/ads/banners/` | ads |
| `/app/adsListing/` | `/api/v1/ads/submit/` | ads |
| `/app/finance-data/` | `/api/v1/finance/data/` | finance |

### 4.2 Frontend Files to Update (File-by-File)

#### `src/utils/csrf.js`
```
OLD: ${djangoApi}/app/csrf-token/
NEW: ${djangoApi}/api/v1/auth/csrf-token/
```

#### `src/context/UserContext.jsx`
```
OLD: ${djangoApi}/app/user/
NEW: ${djangoApi}/api/v1/auth/user/
```

#### `src/components/LoginSignup/LoginSignup.jsx` (4 calls)
```
OLD: ${djangoApi}/app/csrf-token/     →  NEW: ${djangoApi}/api/v1/auth/csrf-token/
OLD: ${djangoApi}/app/register/       →  NEW: ${djangoApi}/api/v1/auth/register/
OLD: ${djangoApi}/app/login/          →  NEW: ${djangoApi}/api/v1/auth/login/
OLD: ${djangoApi}/app/tokenKey/       →  NEW: ${djangoApi}/api/v1/auth/token-key/
OLD: client.get('/app/user/')         →  NEW: client.get('/api/v1/auth/user/')
```

#### `src/components/Navbar/Navbar.jsx`
```
OLD: client.post('/app/logout/', ...)
NEW: client.post('/api/v1/auth/logout/', ...)
```

#### `src/components/Navbar/Search.jsx` (2 calls)
```
OLD: ${djangoApi}/app/csrf-token/
NEW: ${djangoApi}/api/v1/auth/csrf-token/

OLD: ${djangoApi}/app/searchResult/?search=${query}
NEW: ${djangoApi}/api/v1/search/?search=${query}
```

#### `src/pages/CategoryPage.jsx`
```
OLD: ${djangoApi}/app/filtered-business/
NEW: ${djangoApi}/api/v1/listings/by-category/
```

#### `src/pages/BusinessDetailsPage.jsx`
```
OLD: ${djangoApi}/app/business-view/
NEW: ${djangoApi}/api/v1/listings/detail/
```

#### `src/components/Services/Services.jsx`
```
OLD: ${djangoApi}/app/categorys/
NEW: ${djangoApi}/api/v1/listings/categories/
```

#### `src/components/Categorytile/Categorytile.jsx`
```
OLD: ${djangoApi}/app/categorys/
NEW: ${djangoApi}/api/v1/listings/categories/
```

#### `src/components/Categorytile/Category.jsx`
```
OLD: ${djangoApi}/app/subCategorys/
NEW: ${djangoApi}/api/v1/listings/subcategories/
```

#### `src/components/Filtercategory/Filtercategory.jsx`
```
OLD: ${djangoApi}/app/subCategorys/
NEW: ${djangoApi}/api/v1/listings/subcategories/
```

#### `src/components/Categorysection/Categorysection.jsx`
```
OLD: ${djangoApi}/app/banner-ads/
NEW: ${djangoApi}/api/v1/ads/banners/
```

#### `src/components/Categorysection/SearchSection.jsx`
```
OLD: ${djangoApi}/app/banner-ads/
NEW: ${djangoApi}/api/v1/ads/banners/
```

#### `src/components/Categorysection/BusinessCard.jsx`
```
OLD: ${djangoApi}/app/likedShops/
NEW: ${djangoApi}/api/v1/listings/favorites/
```

#### `src/components/Businesscompo/CompanyWork.jsx` (3 calls)
```
OLD: ${djangoApi}/app/get_shop_reviews/  →  NEW: ${djangoApi}/api/v1/reviews/by-shop/
OLD: ${djangoApi}/app/csrf-token/        →  NEW: ${djangoApi}/api/v1/auth/csrf-token/
OLD: ${djangoApi}/app/shop_reviews/      →  NEW: ${djangoApi}/api/v1/reviews/
```

#### `src/components/Releatedarticles/Releatedarticles.jsx`
```
OLD: ${djangoApi}/app/active-articles/
NEW: ${djangoApi}/api/v1/news/active/
```

#### `src/components/Releatedarticles/ArticleView.jsx`
```
OLD: ${djangoApi}/app/articleGet/
NEW: ${djangoApi}/api/v1/news/detail/
```

#### `src/components/Releatedarticles/Articles.jsx`
```
OLD: ${djangoApi}/app/articles/
NEW: ${djangoApi}/api/v1/news/articles/
```

#### `src/components/Advertise/Advertise.jsx`
```
OLD: ${djangoApi}/app/crousel-ads/   →  NEW: ${djangoApi}/api/v1/ads/carousel/
OLD: ${djangoApi}/app/banner-ads/    →  NEW: ${djangoApi}/api/v1/ads/banners/
```

#### `src/components/AllForms/AddAdvertiseForm.jsx` (2 calls)
```
OLD: ${djangoApi}/app/adsListing/    →  NEW: ${djangoApi}/api/v1/ads/submit/
OLD: ${djangoApi}/app/csrf-token/    →  NEW: ${djangoApi}/api/v1/auth/csrf-token/
```

#### `src/components/AllForms/AddListingForm.jsx` (5 calls)
```
OLD: ${djangoApi}/app/categorys/      →  NEW: ${djangoApi}/api/v1/listings/categories/
OLD: ${djangoApi}/app/subCategorys/   →  NEW: ${djangoApi}/api/v1/listings/subcategories/
OLD: ${djangoApi}/app/editShopsData/  →  NEW: ${djangoApi}/api/v1/listings/edit-data/
OLD: ${djangoApi}/app/csrf-token/     →  NEW: ${djangoApi}/api/v1/auth/csrf-token/
OLD: ${djangoApi}/app/shopListing/    →  NEW: ${djangoApi}/api/v1/listings/
OLD: ${djangoApi}/app/updateShop/     →  NEW: ${djangoApi}/api/v1/listings/update/
```

#### `src/components/AccountCompo/Likedpage.jsx`
```
OLD: ${djangoApi}/app/likedShops/
NEW: ${djangoApi}/api/v1/listings/favorites/
```

#### `src/components/AccountCompo/Listingspage.jsx`
```
OLD: ${djangoApi}/app/listedShops/
NEW: ${djangoApi}/api/v1/listings/my-listings/
```

#### `src/components/Stocktickle/Stocktickle.jsx`
```
OLD: ${djangoApi}/app/finance-data/
NEW: ${djangoApi}/api/v1/finance/data/
```

### 4.3 Frontend Summary

| Frontend File | API Calls to Update |
|--------------|-------------------|
| utils/csrf.js | 1 |
| context/UserContext.jsx | 1 |
| components/LoginSignup/LoginSignup.jsx | 5 |
| components/Navbar/Navbar.jsx | 1 |
| components/Navbar/Search.jsx | 2 |
| pages/CategoryPage.jsx | 1 |
| pages/BusinessDetailsPage.jsx | 1 |
| components/Services/Services.jsx | 1 |
| components/Categorytile/Categorytile.jsx | 1 |
| components/Categorytile/Category.jsx | 1 |
| components/Filtercategory/Filtercategory.jsx | 1 |
| components/Categorysection/Categorysection.jsx | 1 |
| components/Categorysection/SearchSection.jsx | 1 |
| components/Categorysection/BusinessCard.jsx | 1 |
| components/Businesscompo/CompanyWork.jsx | 3 |
| components/Releatedarticles/Releatedarticles.jsx | 1 |
| components/Releatedarticles/ArticleView.jsx | 1 |
| components/Releatedarticles/Articles.jsx | 1 |
| components/Advertise/Advertise.jsx | 2 |
| components/AllForms/AddAdvertiseForm.jsx | 2 |
| components/AllForms/AddListingForm.jsx | 6 |
| components/AccountCompo/Likedpage.jsx | 1 |
| components/AccountCompo/Listingspage.jsx | 1 |
| components/Stocktickle/Stocktickle.jsx | 1 |
| **Total** | **~39 API calls across 24 files** |

---

## 5. Migration Strategy

### Step 1: Create `apps/` folder with all 21 apps
### Step 2: Move models with `db_table` meta to preserve existing tables
### Step 3: Update `settings.py` (INSTALLED_APPS, AUTH_USER_MODEL)
### Step 4: Update main `urls.py` with new `/api/v1/` routes
### Step 5: Run `makemigrations` + `migrate --fake`
### Step 6: Update all 38 frontend API calls across 23 files
### Step 7: Delete old `app/`, `api/` directories
### Step 8: Test all endpoints end-to-end

### ForeignKey Cross-App References

| Model | Field | References | After Move |
|-------|-------|-----------|------------|
| ShopListing.user | FK | `settings.AUTH_USER_MODEL` | ✅ Auto-works |
| ShopListing.main_category | FK | `MainCategory` | Same app (directory) ✅ |
| ShopListing.sub_category | FK | `SubCategory` | Same app (directory) ✅ |
| LikedShops.user | FK | `settings.AUTH_USER_MODEL` | ✅ Auto-works |
| LikedShops.shop_listing | FK | `ShopListing` | Same app (directory) ✅ |
| ShopReview.user | FK | `settings.AUTH_USER_MODEL` | ✅ Auto-works |
| ShopReview.shop_listing | FK | `ShopListing` | `'directory.ShopListing'` (string ref) |
| AdsListing.user | FK | `settings.AUTH_USER_MODEL` | ✅ Auto-works |

### Estimated Timeline

| Step | Task | Risk | Time |
|------|------|------|------|
| 1 | Create `apps/` + all 21 app dirs | Low | 0.5 day |
| 2 | Move accounts code | **High** | 1 day |
| 3 | Move directory code | Medium | 1 day |
| 4 | Move reviews, news, ads, search | Low | 1 day |
| 5 | Update settings + main urls | **High** | 0.5 day |
| 6 | Run + fix migrations | **High** | 0.5 day |
| 7 | Update 38 frontend API calls | Medium | 1 day |
| 8 | Create 15 skeleton apps | Low | 0.5 day |
| 9 | Delete old app/ + api/ | Medium | 0.5 day |
| 10 | End-to-end testing | **High** | 1 day |
| **Total** | | | **~7.5 days** |

---

*Document Version: 2.0 | Updated with apps/ folder structure + frontend migration map*
