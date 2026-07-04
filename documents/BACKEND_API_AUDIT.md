# Jalgaon Backend API Audit

Audit date: 2026-07-03  
Backend audited: `D:\jalgaonWeb\jalgaonApi`  
Active root URL configuration: `jalgaonApi/urls.py`

## Executive summary

The Django backend currently mounts:

- **70 unique REST URL paths** under `/api/v1/`
- **98 method-specific API operations**: 51 GET, 20 POST, 6 PUT, 14 PATCH, and 7 DELETE
- **9 mounted API groups**: auth, listings, search, reviews, news, ads, finance, jobs, and admin panel
- **3 API documentation routes** (`/api/schema/`, `/api/docs/`, and `/api/redoc/`) which are not included in the 70 business API paths

Counting rule: one URL is one path even when it supports several HTTP methods. Each URL + HTTP method combination is one operation. DRF format-suffix aliases such as `.json` are not counted as separate APIs.

The frontend **cannot fetch every backend domain yet**. Events, blog, tourism, NGOs, startups, media library, CMS, payments, notifications, analytics, audit, and dashboard packages have no mounted public REST URLs. Some are only model scaffolds; others have no implemented API view at all.

## Authentication conventions

| Label | Frontend requirement |
| --- | --- |
| Public | No access token required |
| JWT | Send `Authorization: Bearer <access-token>` |
| Token | Send legacy DRF `Authorization: Token <token>`; this is incompatible with the JWT returned by the current login endpoint |
| Role | JWT plus one of the stated backend user roles |

JWT access tokens expire after 15 minutes. Refresh tokens expire after 7 days and rotate when `/api/v1/auth/token/refresh/` is called. Global throttling is 100 requests/minute for anonymous traffic and 500 requests/minute for authenticated users.

## Count by API group

| Group | Unique paths | HTTP operations |
| --- | ---: | ---: |
| Authentication | 8 | 8 |
| Listings/directory | 9 | 10 |
| Search | 1 | 1 |
| Reviews | 2 | 2 |
| News | 17 | 30 |
| Ads | 3 | 3 |
| Finance | 1 | 1 |
| Jobs | 19 | 27 |
| Admin panel | 10 | 16 |
| **Total** | **70** | **98** |

## Complete API inventory

All paths below are relative to the Django backend origin, for example `http://127.0.0.1:8000` during local development.

### Authentication: 8 paths, 8 operations

| Method | Path | Access | Input / purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register/` | Public | JSON: `phone_number`, `password`; creates a user |
| POST | `/api/v1/auth/login/` | Public | JSON: `phone_number`, `password`; returns `user`, `access`, and `refresh` |
| POST | `/api/v1/auth/logout/` | JWT | JSON: `refresh`; blacklists the supplied refresh token |
| POST | `/api/v1/auth/logout-all/` | JWT | Blacklists all refresh tokens belonging to the current user |
| POST | `/api/v1/auth/token/` | Public | SimpleJWT token pair endpoint; JSON credentials use the configured phone-number user field |
| POST | `/api/v1/auth/token/refresh/` | Public | JSON: `refresh`; returns a rotated access/refresh pair |
| GET | `/api/v1/auth/user/` | JWT | Returns the current user profile |
| GET | `/api/v1/auth/csrf-token/` | Public | Sets the CSRF cookie and returns `csrfToken`; not required for pure Bearer-JWT requests |

### Listings and directory: 9 paths, 10 operations

| Method | Path | Access | Input / purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/listings/categories/` | Public | Paginated categories; `page`, `page_size` (max 100) |
| GET | `/api/v1/listings/subcategories/` | Public | Paginated subcategories; `page`, `page_size` (max 100) |
| POST | `/api/v1/listings/` | Token | Multipart listing creation using all `ShopListing` fields |
| PUT | `/api/v1/listings/update/?shop_id={id}` | Token | Partial multipart/JSON listing update |
| GET | `/api/v1/listings/by-category/?mainCategoryId={id}` | Public | Returns businesses for a category as a plain array |
| GET | `/api/v1/listings/detail/?productId={id}` | Public | Returns one business listing |
| GET | `/api/v1/listings/my-listings/?user_id={id}` | JWT | Paginated listings for the supplied user ID |
| GET | `/api/v1/listings/edit-data/?shop_id={id}` | JWT | Returns one listing for an edit form |
| GET | `/api/v1/listings/favorites/?user_id={id}` | JWT | Paginated favorites for the supplied user ID |
| POST | `/api/v1/listings/favorites/` | JWT | JSON: `user`, `shop_listing`; creates a favorite |

`ShopListing` data includes IDs for user/category/subcategory, business name/rating/address, banner, seven optional sub-domain fields, origin, date-of-business, GST, description, three images, phone, email, social/website/map links, and `is_valid`.

### Search: 1 path, 1 operation

| Method | Path | Access | Input / purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/search/?search={business_name}` | Public | Searches `business_name`; with no search value it currently returns all listings |

### Reviews: 2 paths, 2 operations

| Method | Path | Access | Input / purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/reviews/` | Token | JSON/multipart: `shop_listing`, `rating_star`, `user_review`; user comes from auth |
| GET | `/api/v1/reviews/by-shop/` | Token | Despite its name, currently returns **all reviews** and ignores any shop query parameter |

### News: 17 paths, 30 operations

| Method | Path | Access | Input / purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/news/articles/` | Public | Legacy article list |
| GET | `/api/v1/news/active/` | Public | Legacy active-article list |
| GET | `/api/v1/news/detail/?articleId={id}` | Public | Legacy article detail |
| GET | `/api/v1/news/categories/` | Public | Active news categories |
| GET | `/api/v1/news/breaking/` | Public | Up to five published breaking articles |
| GET | `/api/v1/news/trending/` | Public | Up to five published articles ordered by views |
| GET | `/api/v1/news/` | **Broken for public list** | Router API root currently wins the URL collision and requires authentication |
| GET | `/api/v1/news/{slug}/` | Public | Published article detail; increments view count |
| GET | `/api/v1/news/{slug}/comments/` | Public | Approved comments for an article |
| POST | `/api/v1/news/{slug}/comments/` | JWT | JSON: `body`; submits a pending comment |
| GET, POST | `/api/v1/news/admin/articles/` | Role: news editor | List/create news articles |
| GET, PUT, PATCH, DELETE | `/api/v1/news/admin/articles/{id}/` | Role: news editor; DELETE is admin-only in view logic | Read/update/delete article |
| PATCH | `/api/v1/news/admin/articles/{id}/breaking/` | Role: content manager | JSON: `is_breaking` |
| PATCH | `/api/v1/news/admin/articles/{id}/status/` | Role: content manager | JSON: `status` |
| GET, POST | `/api/v1/news/admin/categories/` | Role: news editor | List/create categories |
| GET, PUT, PATCH, DELETE | `/api/v1/news/admin/categories/{id}/` | Role: news editor | Category CRUD |
| GET, POST | `/api/v1/news/admin/comments/` | Role: news editor | List/create comments |
| GET, PUT, PATCH, DELETE | `/api/v1/news/admin/comments/{id}/` | Role: news editor | Comment moderation CRUD |

The intended public list supports `category`, `search`, and `ordering` (`published_at` or `view_count`), but it is unreachable until the `/api/v1/news/` route collision is fixed.

### Ads: 3 paths, 3 operations

| Method | Path | Access | Input / purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/ads/carousel/` | Public | Returns `{ "ads": [...] }` |
| GET | `/api/v1/ads/banners/` | Public | Returns the first banner object; returns 404 when none exists |
| POST | `/api/v1/ads/submit/` | Token | Multipart ad submission using all `AdsListing` fields |

### Finance: 1 path, 1 operation

| Method | Path | Access | Input / purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/finance/data/` | Public | Returns `{ "financeData": [...] }` from the backend table |

This is database-backed finance ticker data. It is separate from the Next.js `/api/dashboard` route that calls external weather, commodity, and currency providers.

### Jobs: 19 paths, 27 operations

| Method | Path | Access | Input / purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/jobs/` | Public | Active, non-expired jobs; filters: `category`, `job_type`, `location`, `salary_min`, `search`, `ordering` |
| GET | `/api/v1/jobs/categories/` | Public | Active job categories |
| GET | `/api/v1/jobs/featured/` | Public | Up to five active featured jobs |
| GET | `/api/v1/jobs/{slug}/` | Public | Job detail; increments view count |
| POST | `/api/v1/jobs/{slug}/apply/` | JWT | Multipart: `resume`, optional `cover_letter` |
| POST | `/api/v1/jobs/{slug}/save/` | JWT | Toggles saved/unsaved state |
| GET | `/api/v1/jobs/saved/` | JWT | Current user's saved jobs |
| GET | `/api/v1/jobs/my-applications/` | JWT | Current user's applications |
| POST | `/api/v1/jobs/submit/` | Role: authenticated allowed job-submitter | Creates an active job; uses job serializer fields |
| GET | `/api/v1/jobs/my-jobs/` | Role: job submitter | Jobs posted by current user |
| GET | `/api/v1/jobs/my-jobs/{id}/applications/` | Role: job submitter and owner | Applications for one owned job |
| PATCH | `/api/v1/jobs/my-jobs/{id}/applications/{app_id}/status/` | Role: job submitter and owner | JSON: `status` |
| GET, POST | `/api/v1/jobs/admin/jobs/` | Role: job manager | List/create all jobs |
| GET, PUT, PATCH, DELETE | `/api/v1/jobs/admin/jobs/{id}/` | Role: job manager | Job CRUD |
| PATCH | `/api/v1/jobs/admin/jobs/{id}/status/` | Role: job manager | JSON: `status` |
| GET, POST | `/api/v1/jobs/admin/categories/` | Role: job manager | List/create job categories |
| GET, PUT, PATCH, DELETE | `/api/v1/jobs/admin/categories/{id}/` | Role: job manager | Job category CRUD |
| GET | `/api/v1/jobs/admin/applications/` | Role: job manager | All applications; optional `job={id}` filter |
| GET | `/api/v1/jobs/admin/applications/{id}/` | Role: job manager | One application |

Job submitter roles: `super_admin`, `admin`, `content_manager`, `news_editor`, `business_owner`, and `registered_user`. Job manager roles: `super_admin`, `admin`, `content_manager`, and `moderator`.

### Admin panel: 10 paths, 16 operations

| Method | Path | Access | Input / purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/admin-panel/stats/` | Role: admin | User, listing, category, and moderation counts |
| GET | `/api/v1/admin-panel/users/` | Role: admin | Paginated users; `search`, `role`, `page`, `page_size` |
| GET, PATCH | `/api/v1/admin-panel/users/{user_id}/` | Role: admin | User detail/update |
| PATCH | `/api/v1/admin-panel/users/{user_id}/role/` | Role: super admin | JSON: `role` |
| GET | `/api/v1/admin-panel/listings/` | Role: admin | Paginated listings; `search`, `status`, `category`, `page`, `page_size` |
| GET, PATCH, DELETE | `/api/v1/admin-panel/listings/{listing_id}/` | Role: admin | Detail; approve/reject with `action` and optional `rejection_reason`; delete |
| GET, POST | `/api/v1/admin-panel/categories/` | Role: admin | List/create categories |
| GET, PATCH, DELETE | `/api/v1/admin-panel/categories/{category_id}/` | Role: admin | Category detail/update/delete |
| GET | `/api/v1/admin-panel/moderation/` | Role: moderator | Paginated queue; `status`, `type`, `page`, `page_size` |
| PATCH | `/api/v1/admin-panel/moderation/{item_id}/` | Role: moderator | `action`, optional `rejection_reason`, optional `notes` |

Admin roles are `super_admin` and `admin`. Moderator access also includes `content_manager` and `moderator`. News-editor and content-manager permissions are described in the news table.

## API documentation and non-REST routes

| Path | Purpose | Counted above? |
| --- | --- | --- |
| `/api/schema/` | OpenAPI schema | No |
| `/api/docs/` | Swagger UI | No |
| `/api/redoc/` | ReDoc UI | No |
| `/admin/` | Django Admin HTML site | No |
| `/media/{path}` | Development-only media serving when `DEBUG=True` | No |

The schema endpoint responds, but many `APIView` classes lack explicit schema serializers, so Swagger/ReDoc omit or underspecify request and response bodies. The source inventory above is therefore more complete than the generated documentation.

## APIs the frontend should connect

### Public website and homepage

Connect these first:

| Frontend section | Backend API |
| --- | --- |
| Industry/category grid | `GET /api/v1/listings/categories/` and `GET /api/v1/listings/subcategories/` |
| Businesses by category | `GET /api/v1/listings/by-category/?mainCategoryId={id}` |
| Business search/all-business temporary source | `GET /api/v1/search/?search={text}`; an empty search currently returns all listings |
| Business detail | `GET /api/v1/listings/detail/?productId={id}` |
| Latest news | Fix the news root collision, then `GET /api/v1/news/?ordering=-published_at` |
| Breaking news | `GET /api/v1/news/breaking/` |
| Trending news | `GET /api/v1/news/trending/` |
| News categories | `GET /api/v1/news/categories/` |
| News detail | `GET /api/v1/news/{slug}/` |
| News comments | `GET /api/v1/news/{slug}/comments/` |
| Job list/filter | `GET /api/v1/jobs/` |
| Featured jobs | `GET /api/v1/jobs/featured/` |
| Job categories | `GET /api/v1/jobs/categories/` |
| Job detail | `GET /api/v1/jobs/{slug}/` |
| Carousel and banner ads | `GET /api/v1/ads/carousel/`, `GET /api/v1/ads/banners/` |
| Stored finance ticker | `GET /api/v1/finance/data/` |

### Login and user account

Use `/api/v1/auth/login/`, store its `access` and `refresh` values, attach the access token as `Authorization: Bearer ...`, refresh through `/api/v1/auth/token/refresh/`, and load the current profile from `/api/v1/auth/user/`.

Account screens should use:

- `GET /api/v1/listings/my-listings/`
- `GET/POST /api/v1/listings/favorites/`
- `GET /api/v1/jobs/saved/`
- `GET /api/v1/jobs/my-applications/`
- `GET /api/v1/jobs/my-jobs/` for posters

The listing and favorite APIs must first be changed to derive the user from `request.user`; the frontend should not be trusted to choose an arbitrary `user_id`.

### Admin frontend

Connect the admin pages to all `/api/v1/admin-panel/*`, `/api/v1/news/admin/*`, and `/api/v1/jobs/admin/*` endpoints appropriate to the signed-in user's role. The frontend should hide actions by role, but backend permissions remain the security authority.

## Critical integration blockers and audit findings

### P0: fix before relying on the APIs

1. **Public news list is unreachable.** `DefaultRouter` registers an API root at `/api/v1/news/` before `PublicNewsListView` registers the same path. A real request returns 401 from the router root instead of published articles. Move the public list before the router include or give it an unambiguous path such as `/api/v1/news/articles-feed/`.
2. **JWT/Token authentication mismatch.** Login returns JWT Bearer tokens, but listing create/update, review create/list, and ad submit explicitly accept only DRF `TokenAuthentication`. The token-creation endpoint for that legacy token is no longer mounted. Convert these endpoints to the global JWT authentication or mount and intentionally support the legacy token flow.
3. **Ownership checks are missing.** `my-listings`, favorites, edit-data, and listing update trust IDs supplied by the client and do not consistently verify ownership. Bind queries and writes to `request.user` before exposing them in a production account UI.
4. **“Reviews by shop” leaks the entire review table.** `/api/v1/reviews/by-shop/` ignores the shop ID and returns every review. Add a `shop_listing` filter and make reading public if reviews are intended for public business pages.

### P1: required to fetch complete, reliable frontend data

1. **No proper public all-listings API.** `POST /api/v1/listings/` cannot list businesses. `/api/v1/search/` happens to return all rows when `search` is empty, but it also returns unapproved listings and is unpaginated. Add `GET /api/v1/listings/` with `is_valid=True`, pagination, search, category, subcategory, and ordering filters.
2. **Public category listing does not filter approval.** `/listings/by-category/` can expose `is_valid=False` records. Restrict it to approved listings.
3. **Large public feeds are unpaginated.** Search, news, jobs, reviews, ads, and finance responses can grow without a global pagination class. Add stable ordering and pagination to collection endpoints.
4. **Inconsistent response shapes.** Categories return DRF pagination, search/jobs/news often return arrays, ads use `ads`, and finance uses `financeData`. A shared envelope makes frontend data handling simpler.
5. **OpenAPI is incomplete.** Explicitly annotate APIViews and function views so generated clients and Swagger accurately show bodies, responses, query parameters, and permissions.

### P2: cleanup and maintainability

1. `app/urls.py` and `api/urls.py` contain old duplicate APIs but are not included by the active root URL configuration. They are dead code and are excluded from the count.
2. Category/subcategory pagination currently warns about unordered querysets; add deterministic ordering.
3. The Next.js frontend hardcodes `http://127.0.0.1:8000` in `IndustryGrids.tsx`; use an environment-based backend origin or a same-origin Next.js proxy.

## Backend domains with no mounted API

These cannot currently supply frontend data through REST:

| Domain/package | Mounted URL? | Frontend consequence |
| --- | --- | --- |
| Events | No | Upcoming/events portal must remain mock data until an API is built |
| Blog | No | Blog section cannot load backend posts |
| Tourism | No | Local wonders/tourism content cannot load from backend |
| NGO | No | NGO spotlight cannot load from backend |
| Startups | No | Startup content cannot load from backend |
| Media library | No | No media browsing API |
| CMS | No | No CMS page/block API |
| Payments | No | No payment workflow API |
| Notifications | No | No user notification API |
| Analytics | No | No analytics API |
| Audit | No public URL | Audit logs are written internally but cannot be queried via REST |
| Dashboard | No Django URL | Django dashboard package has no REST endpoint; Next.js has a separate external-data route |

## Current frontend connection status

### `New-JalgaonUI` (Next.js)

- Category/subcategory fetching is the only direct Django integration found, and it uses a hardcoded localhost origin.
- `/api/businesses` and `/api/businesses/{id}` are local Next.js mock-data routes, not Django proxies.
- The news page calls `/api/news`, but no corresponding Next.js route exists and the Django news root is currently collided.
- Jobs, homepage news, events, NGOs, tourism, and most businesses still use hardcoded frontend data.
- `/api/dashboard` is dynamic, but it calls external weather/commodity/currency providers rather than the Django backend.

### `jalgaonUi` (Vite/React)

This older frontend already calls many Django APIs through `VITE_DJANGO_API`, including auth, categories, listings, ads, finance, news, jobs, reviews, search, and admin routes. Its JWT interceptor is the correct general pattern, but calls to TokenAuthentication-only endpoints will fail until the backend auth mismatch is resolved.

## Recommended implementation order

1. Fix the news root collision and JWT/Token mismatch.
2. Secure listing/favorite ownership and fix review filtering.
3. Add a paginated, approved-only `GET /api/v1/listings/` endpoint.
4. Connect `New-JalgaonUI` to auth, directory, news, jobs, ads, and finance using one environment-based API client.
5. Build missing APIs for events, blog, tourism, and NGOs—the four visible frontend sections with no backend data path.
6. Add the remaining CMS/media/notification/payment APIs as those product flows become active.

## Verification performed

- `python manage.py check`: passed with no Django system-check issues.
- Runtime URL resolver: inspected all mounted URL patterns, including DRF router expansions.
- OpenAPI schema endpoint: returned HTTP 200; schema warnings confirmed incomplete APIView documentation.
- Read-only smoke requests were run against public and protected routes.
- Confirmed at runtime that `/api/v1/news/` returns 401 from the router collision.
- Confirmed category/subcategory, search, jobs, ads, finance, and supporting public routes resolve.

