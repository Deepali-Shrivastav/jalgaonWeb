# Frontend-to-Backend API Connection Audit

Audit date: 2026-07-05  
Workspace: `D:\jalgaonWeb`  
Backend: `jalgaonApi` (Django REST Framework)  
Frontends: `New-JalgaonUI` (Next.js) and `jalgaonUi` (React/Vite)

## Audit basis and counting rules

This is a read-only source audit. No application code was changed. Routes were enumerated from the live Django URL resolver, then matched against every `fetch`, Axios/client call, form, page, component, route guard, and environment/config file in both frontends. Request fields were checked against serializers/models and responses against the fields each UI reads.

- One backend **path** is counted once even when it supports several methods.
- One path + method is one **operation**.
- DRF `.json` format aliases are not counted separately.
- `working` is not inferred from a matching URL. The report uses **tested**, **source-aligned**, **mixed**, **broken**, **unused**, and **unclear**.
- The 17 backend tests cover events and ads, not the full API surface.

## 1. Project API overview

| Measure | Result |
| --- | ---: |
| Django business API paths under `/api/v1/` | 115 |
| Method-specific Django operations | 161 |
| API documentation routes (`/api/schema/`, `/api/docs/`, `/api/redoc/`) | 3 |
| Next route-handler APIs | 3 (`/api/dashboard`, `/api/businesses`, `/api/businesses/[id]`) |
| Frontend network call expressions | 272 (136 in each frontend) |
| Unique `/api/v1/` literal route shapes in frontend source | 110 |
| Backend paths with at least one contract-aligned frontend consumer | 101 |
| Backend paths never referenced by a compatible frontend call | 9 |
| Backend paths referenced only incorrectly | 5 |
| Mixed paths (one correct consumer and another broken consumer) | 4 |
| Actionable missing/static frontend integrations found | 18 |
| Concrete wrong/broken integration findings | 20 |

The frontend and backend are **not fully connected**. Core public lists, authentication login/register, most admin CRUD, listing creation, ad submission, event submission, job submission, claims, reports, and several account lists are connected. Logout, profile update, the primary Next directory review form, Next job application, NGO administration, several list-page buttons, pagination/filtering, and static contact/NGO/tourism flows are not complete.

### Verification results

| Check | Result | Meaning |
| --- | --- | --- |
| `python manage.py check` with SQLite | Pass | Django configuration imports successfully |
| `python manage.py test --noinput` | Pass: 17/17 | Events and ads tests pass; other domains remain largely untested |
| `jalgaonUi: npm run build` | Pass | Legacy Vite frontend compiles |
| `New-JalgaonUI: npx tsc --noEmit` | Fail | Eight account pages import missing `@/components/admin/UserProfileContent` |
| `New-JalgaonUI: npm run build` | Fail | Same eight missing imports; Google-font network fetch also fails in the restricted build environment |

## 2. Backend API inventory

Access labels: `Public`, `JWT`, `Admin` (`super_admin`/`admin`), `Content` (`super_admin`/`admin`/`content_manager`), `Moderator` (also `moderator`), `News` (also `news_editor`), and `JobsAdmin` (also `moderator`). Standard paginated responses are `{count,next,previous,results}`. Plain lists are arrays.

### 2.1 Authentication — `apps/accounts/urls.py`, `views.py`, `serializers.py`; tables `app_user`, `auth_login_attempt`, JWT blacklist tables

| Method and endpoint | Input / parameters | Auth | Expected response | Frontend status |
| --- | --- | --- | --- | --- |
| POST `/api/v1/auth/register/` | JSON `phone_number`, `password` | Public | `201 {user:{id,phone_number,...}}` | Source-aligned in both frontends |
| POST `/api/v1/auth/login/` | JSON `phone_number`, `password` | Public | `{user,access,refresh}`; 401/429 errors | Source-aligned in both frontends |
| POST `/api/v1/auth/logout/` | JSON `refresh`; bearer token | JWT | `{message}` | **Broken:** callers omit required auth and/or refresh |
| POST `/api/v1/auth/logout-all/` | No body | JWT | `{message}` | Unused |
| POST `/api/v1/auth/token/` | JSON `phone_number`, `password` | Public | `{access,refresh}` | Unused duplicate login path |
| POST `/api/v1/auth/token/refresh/` | JSON `refresh` | Public | rotated `{access,refresh}` | Mixed: Vite interceptor is correct; two Next retries discard rotated refresh |
| GET `/api/v1/auth/user/` | None | JWT | `{user:{id,phone_number,first_name,...}}` | Mixed: correct session checks; account settings reads the wrapper incorrectly |
| GET `/api/v1/auth/csrf-token/` | None | Public | `{csrfToken}` and cookie | Connected, though unnecessary for bearer-only calls |

No register-via-OTP, forgot-password, reset-password, email verification, or phone verification endpoints are routed.

### 2.2 Directory/listings — `apps/directory/urls.py`, `views.py`, `serializers.py`; tables `app_maincategory`, `app_subcategory`, `app_shoplisting`, `app_likedshops`, `app_businessclaim`, `app_businessreport`, `app_businessphoto`

| Method and endpoint | Input / query / path | Auth | Expected response | Frontend status |
| --- | --- | --- | --- | --- |
| GET `/api/v1/listings/categories/` | None | Public | plain category array with nested `subcategories` | Connected broadly |
| GET `/api/v1/listings/` | `category`, `subcategory`, `sort`, `lat`, `lng`, `radius`, `page`, `page_size` | Public | paginated `ListingListSerializer` | Connected; some UIs read absent fields |
| GET `/api/v1/listings/search/` | `q`, optional category/location/radius, pagination | Public | active listing page | Connected by Vite search |
| GET `/api/v1/listings/trending/` | None | Public | up to 10 listing objects | Connected |
| POST `/api/v1/listings/create/` | multipart; required `business_name`, `business_address`, `business_banner`, `business_description`, `business_no`, `business_email`, `main_category`, `sub_category` | JWT | created listing | Connected; field-length/UI validation gaps |
| GET `/api/v1/listings/{slug}/` | slug | Public; owner can see own non-active record with JWT | `ListingDetailSerializer`; increments active view count | Connected |
| PUT/PATCH `/api/v1/listings/{slug}/update/` | partial/full listing payload | JWT owner/staff | updated listing | PATCH connected in Next; PUT unused |
| DELETE `/api/v1/listings/{slug}/delete/` | slug | JWT owner/staff | 204 | Connected in Next account |
| GET `/api/v1/listings/{slug}/reviews/` | slug, pagination | Public | approved review page | Unused |
| POST `/api/v1/listings/{slug}/reviews/create/` | JSON `rating_star`, `user_review` | JWT | created review | Mixed: one correct caller, one wrong-payload caller |
| POST `/api/v1/listings/{slug}/claim/` | JSON `message`, `contact_number` | JWT | created pending claim | Connected |
| POST `/api/v1/listings/{slug}/report/` | JSON `reason`, optional `description` | Public; token optional | created pending report | Connected |
| GET `/api/v1/listings/user/my-listings/` | pagination | JWT | current user's listing page | Connected |
| GET/POST `/api/v1/listings/user/favorites/` | GET pagination; POST JSON `shop_listing_id` | JWT | favorites page / created favorite | Mixed: Next correct; Vite uses wrong path and payload |

### 2.3 Search and legacy reviews

| Method and endpoint | Backend file/model | Contract | Status |
| --- | --- | --- | --- |
| GET `/api/v1/search/` | `apps/search/views.py`; `ShopListing` | DRF `search` over `business_name`; plain array unless global pagination is added | Connected, but backend returns all statuses and can expose pending/rejected listings |
| POST `/api/v1/reviews/` | `apps/reviews/views.py`; `ShopReview` | Token-auth legacy body `shop_listing`, `rating_star`, `user_review` | **Broken backend + caller:** JWT is rejected and `shop_listing` is not passed to `serializer.save()` |
| GET `/api/v1/reviews/by-shop/` | same | Token-auth; currently ignores shop query and returns all reviews | **Broken:** JWT caller, ignored filter, incompatible response mapping |

### 2.4 News — `apps/news/urls.py`, `views.py`, `serializers.py`; legacy `app_articlemodel`/`app_activearticle`, current `news_*` tables

| Method and endpoint | Input / purpose | Auth | Response / status |
| --- | --- | --- | --- |
| GET `/api/v1/news/articles/` | legacy list | Public | Legacy array; connected in Vite |
| GET `/api/v1/news/active/` | legacy active list | Public | Legacy array; connected in Vite |
| GET `/api/v1/news/detail/?articleId={id}` | legacy detail | Public | Legacy object; connected in Vite |
| GET `/api/v1/news/categories/` | active categories | Public | category array; connected |
| GET `/api/v1/news/breaking/` | up to 5 published breaking items | Public | array; connected |
| GET `/api/v1/news/trending/` | top 5 by views | Public | array; connected |
| GET `/api/v1/news/latest/` | `category`, DRF `search`, `ordering` | Public | published article array | Connected; frontend `page` has no effect |
| GET `/api/v1/news/{slug}/` | slug | Public | detail with approved comments; increments views | Connected |
| GET/POST `/api/v1/news/{slug}/comments/` | POST JSON `body` | GET public; POST JWT | array / created comment | Connected; backend default makes comments approved immediately despite UI saying pending |
| GET `/api/v1/news/` | DRF router root | JWT by default | endpoint index, not article data | **Wrongly used by Vite as the news list** |
| GET/POST `/api/v1/news/admin/articles/` | list/create; multipart supported | News | admin article objects | Connected |
| GET/PUT/PATCH/DELETE `/api/v1/news/admin/articles/{id}/` | CRUD | News; delete intends Admin only | Connected except generic PATCH unused; non-admin delete can 500 because `exceptions` is not imported |
| PATCH `/api/v1/news/admin/articles/{id}/status/` | JSON valid `status` | Content | `{status}` | Connected |
| PATCH `/api/v1/news/admin/articles/{id}/breaking/` | JSON `is_breaking` | Content | `{is_breaking}` | Unused |
| GET/POST `/api/v1/news/admin/categories/` | category list/create | News | array/object | Connected |
| GET/PUT/PATCH/DELETE `/api/v1/news/admin/categories/{id}/` | category CRUD | News | object/204 | PUT+DELETE connected; GET/PATCH unused |
| GET/POST `/api/v1/news/admin/comments/` | comment list/create | News | array/object | GET connected; POST unused |
| GET/PUT/PATCH/DELETE `/api/v1/news/admin/comments/{id}/` | moderation CRUD | News | object/204 | PATCH+DELETE connected; GET/PUT unused |

### 2.5 Events — `apps/events/urls.py`, `views.py`, `serializers.py`; tables `events_event`, `events_eventcategory`

| Method and endpoint | Input / query | Auth | Response / frontend status |
| --- | --- | --- | --- |
| GET `/api/v1/events/` | `category`, `featured`, `from`, `to`, DRF search/order | Public | upcoming array; connected, `page` ignored |
| GET `/api/v1/events/past/` | category/search/order | Public | past array; connected in Vite |
| GET `/api/v1/events/categories/` | None | Public | category array; connected |
| GET `/api/v1/events/{slug}/` | slug | Public | detail; connected |
| POST `/api/v1/events/submit/` | multipart; required title, description, short description, organizer name, venue name/address, start time | JWT | pending event | Connected; Next form does not require all backend-required fields |
| GET `/api/v1/events/my-events/` | optional `status` | JWT | user's events array | Connected |
| GET/POST `/api/v1/events/admin/events/` | list/create | Content | array/object | GET connected; POST unused |
| GET/PUT/PATCH/DELETE `/api/v1/events/admin/events/{id}/` | CRUD | Content | object/204 | DELETE connected; GET/PUT/PATCH unused |
| PATCH `/api/v1/events/admin/events/{id}/approve/` | empty body | Content | status/message | Connected and tested |
| PATCH `/api/v1/events/admin/events/{id}/reject/` | required `rejection_reason` | Content | status/reason | Connected and tested |
| PATCH `/api/v1/events/admin/events/{id}/feature/` | empty body | Admin | toggled boolean | Connected and tested |
| GET/POST `/api/v1/events/admin/categories/` | list/create | Content | array/object | Connected |
| GET/PUT/PATCH/DELETE `/api/v1/events/admin/categories/{id}/` | CRUD | Content | object/204 | DELETE connected; GET/PUT/PATCH unused |

### 2.6 Ads and finance

Backend files: `apps/ads/urls.py`, `views.py`, `serializers.py`, `models.py`; tables `app_adslisting`, `app_adslot`, legacy carousel/banner tables. Finance uses `apps/finance/*` and `app_financedata`.

| Method and endpoint | Input / query | Auth | Status |
| --- | --- | --- | --- |
| GET `/api/v1/ads/carousel/` | None | Public | Connected in Vite; response `{ads}` |
| GET `/api/v1/ads/banners/` | None | Public | Connected in Vite; single banner object |
| POST `/api/v1/ads/submit/` | multipart required name/contact/ad type/target/package/image | JWT | Connected and tested |
| GET `/api/v1/ads/my-ads/` | optional `shop_id` | JWT | Connected in Vite |
| GET `/api/v1/ads/list/` | None | Public | Connected in Vite |
| GET `/api/v1/ads/by-slot/?slot=...` | slot | Public | `{slot,is_enabled,ads}`; connected and tested |
| GET `/api/v1/ads/my-analytics/` | None | JWT | aggregate counts/CTR/ads; connected in Vite and tested |
| POST `/api/v1/ads/{ad_id}/track-impression/` | id | Public | message; connected and tested |
| POST `/api/v1/ads/{ad_id}/track-click/` | id | Public | message; connected and tested |
| GET `/api/v1/finance/data/` | None | Public | `{financeData:[...]}`; connected only in Vite |

### 2.7 Jobs — `apps/jobs/urls.py`, `views.py`, `serializers.py`; tables `jobs_job`, `jobs_jobcategory`, `jobs_jobapplication`, `jobs_savedjob`

| Method and endpoint | Input / query | Auth | Response / status |
| --- | --- | --- | --- |
| GET `/api/v1/jobs/` | search/order plus `category`, `job_type`, `location`, `salary_min` | Public | active jobs array; connected but Next maps wrong field names and ignores visible filters |
| GET `/api/v1/jobs/categories/` | None | Public | category array; connected |
| GET `/api/v1/jobs/featured/` | None | Public | up to 5 jobs; connected, same Next mapping issue |
| GET `/api/v1/jobs/{slug}/` | slug | Public | job detail; connected |
| POST `/api/v1/jobs/submit/` | multipart Job fields | JWT with allowed role | created active job | Connected |
| POST `/api/v1/jobs/{slug}/apply/` | multipart required `resume` <=500KB; optional `cover_letter` | JWT | application | Mixed: Vite correct; Next omits resume |
| POST `/api/v1/jobs/{slug}/save/` | no body; toggles save | JWT | `{status:saved|unsaved}` | Connected on detail page; list bookmark is disconnected |
| GET `/api/v1/jobs/saved/` | None | JWT | saved jobs array | Connected |
| GET `/api/v1/jobs/my-applications/` | None | JWT | application array | Connected |
| GET `/api/v1/jobs/my-jobs/` | None | allowed submitter role | user's jobs | Connected |
| GET `/api/v1/jobs/my-jobs/{id}/applications/` | job id | owner role | application array | Connected |
| PATCH `/api/v1/jobs/my-jobs/{id}/applications/{app_id}/status/` | JSON valid `status` | owner role | `{status}` | Connected |
| GET/POST `/api/v1/jobs/admin/jobs/` | list/create | JobsAdmin | GET connected; POST unused; frontend `search` query is ignored by backend |
| GET/PUT/PATCH/DELETE `/api/v1/jobs/admin/jobs/{id}/` | CRUD | JobsAdmin | DELETE connected; GET/PUT/PATCH unused |
| PATCH `/api/v1/jobs/admin/jobs/{id}/status/` | JSON `status` | JobsAdmin | `{status}` | Connected |
| GET/POST `/api/v1/jobs/admin/categories/` | list/create | JobsAdmin | Connected |
| GET/PUT/PATCH/DELETE `/api/v1/jobs/admin/categories/{id}/` | CRUD | JobsAdmin | PUT+DELETE connected; GET/PATCH unused |
| GET `/api/v1/jobs/admin/applications/` | optional backend `job`; frontend sends unsupported `search` | JobsAdmin | application array | Connected with ignored search |
| GET `/api/v1/jobs/admin/applications/{id}/` | id | JobsAdmin | application detail | Unused |

### 2.8 Admin panel — `apps/admin_panel/urls.py`, `views.py`, `serializers.py`; user/listing/claim/report/ad tables and `admin_panel_moderation_queue`

| Method and endpoint | Contract | Auth | Status |
| --- | --- | --- | --- |
| GET `/api/v1/admin-panel/stats/` | aggregate counts | Admin | Connected for admins |
| GET `/api/v1/admin-panel/users/` | `search`, `role`, pagination | Admin | Connected |
| GET/PATCH `/api/v1/admin-panel/users/{user_id}/` | detail/update name, active/staff fields | Admin | Unused |
| PATCH `/api/v1/admin-panel/users/{user_id}/role/` | JSON `role` | Super Admin | Connected and UI-gated |
| GET `/api/v1/admin-panel/listings/` | search/status/trending/category/page | Admin | Connected; sidebar wrongly exposes it to non-admin roles |
| GET/PATCH/DELETE `/api/v1/admin-panel/listings/{listing_id}/` | detail; action `approve|reject`; delete | Admin | Connected |
| PATCH `/api/v1/admin-panel/listings/{listing_id}/trending/` | `is_trending`, priority, optional until | Admin | Connected |
| GET/POST `/api/v1/admin-panel/categories/` | list with subcategories; multipart create | Admin | Connected |
| GET/PATCH/DELETE `/api/v1/admin-panel/categories/{category_id}/` | detail/update/delete | Admin | Connected |
| POST `/api/v1/admin-panel/subcategories/` | multipart, image required | Admin | Connected |
| PATCH/DELETE `/api/v1/admin-panel/subcategories/{subcategory_id}/` | update/delete | Admin | Connected |
| GET `/api/v1/admin-panel/business-claims/` | status/page | Moderator | Connected |
| PATCH `/api/v1/admin-panel/business-claims/{claim_id}/` | action `approve|reject` | Moderator | Connected |
| GET `/api/v1/admin-panel/business-reports/` | status/page | Moderator | Connected |
| PATCH `/api/v1/admin-panel/business-reports/{report_id}/` | action `resolve|dismiss` | Moderator | Connected |
| GET `/api/v1/admin-panel/moderation/` | status/type/page | Moderator | Connected |
| PATCH `/api/v1/admin-panel/moderation/{item_id}/` | action, optional reason/notes | Moderator | Connected |
| GET `/api/v1/admin-panel/ads/` | status/page | Admin | Connected |
| PATCH `/api/v1/admin-panel/ads/{ad_id}/` | approve/reject/request_revision plus schedule/slot/package | Admin | Connected |
| GET `/api/v1/admin-panel/ad-slots/` | None | Admin | Connected only in Vite |
| PATCH `/api/v1/admin-panel/ad-slots/{slot_id}/` | partial slot object | Admin | Connected only in Vite |

### 2.9 NGO — `apps/ngo/urls.py`, `views.py`, `serializers.py`; `ngo_ngo`, `ngo_ngocategory`

| Method and endpoint | Contract | Auth | Status |
| --- | --- | --- | --- |
| GET `/api/v1/ngo/` | verified NGOs | Public | Connected only in homepage spotlight; main NGO page is static JSON |
| GET `/api/v1/ngo/categories/` | category array | Public | Connected to submission form |
| GET `/api/v1/ngo/{slug}/` | verified NGO detail | Public | No correct frontend consumer; admin wrongly sends DELETE by numeric id |
| POST `/api/v1/ngo/submit/` | multipart `name`, `category_id`, description, address, phone/email; optional metadata/logo | JWT | Connected |
| GET `/api/v1/ngo/my-ngos/` | None | JWT | Connected |
| GET/POST `/api/v1/ngo/admin/ngos/` | admin list/create | Content | Unused |
| GET/PUT/PATCH/DELETE `/api/v1/ngo/admin/ngos/{id}/` | admin CRUD | Content | Unused; `is_verified` is read-only, so verification still needs a backend action |
| GET/POST `/api/v1/ngo/admin/categories/` | category list/create | Content | Unused |
| GET/PUT/PATCH/DELETE `/api/v1/ngo/admin/categories/{id}/` | category CRUD | Content | Unused |

### 2.10 Next route handlers and unrouted backend apps

| Route/app | File | Status |
| --- | --- | --- |
| GET `/api/dashboard` | `New-JalgaonUI/src/app/api/dashboard/route.ts` | Used by `MarketWeatherDashboard.tsx`; server-side CommodityPriceAPI/Frankfurter/WeatherAPI aggregation |
| GET `/api/businesses` | `New-JalgaonUI/src/app/api/businesses/route.ts` | Unused mock-data API |
| GET `/api/businesses/[id]` | `New-JalgaonUI/src/app/api/businesses/[id]/route.ts` | Unused mock-data API |
| `payments`, `notifications`, `dashboard`, `tourism`, `cms`, `media_lib`, `analytics`, `blog`, `clubs`, `startups` | `jalgaonApi/apps/*` | Installed or scaffolded, but no mounted REST routes; most model/view files are empty |

There are no backend PDF/export, billing/payment, notification, tourism, contact-message, donation, or generic file-library APIs. File upload exists only inside listing, ad, event, job application, NGO, profile, category, and news serializers.

## 3. Frontend API usage list

This table lists the principal call sites. Repeated card/banner calls are consolidated, but all unique backend paths are covered by the backend inventory.

| Frontend file/page | API called | Method / trigger | Loading / error / success / token | Status |
| --- | --- | --- | --- | --- |
| `New-JalgaonUI/src/components/LoginSignup.tsx` | auth CSRF, register, login | modal submit | loading + field/login error; stores access/refresh/user | Aligned |
| `New-JalgaonUI/src/context/AuthContext.tsx` | none | mount reads localStorage only | no token validation/refresh | Incomplete session handling |
| `New-JalgaonUI/src/components/admin/AdminTopbar.tsx` | auth logout | logout click | catches network error; no token/body | Broken |
| `New-JalgaonUI/src/app/account/DashboardClient.tsx` | my listings, favorites, jobs, applications, events, NGOs, user, listing delete | tab load/buttons | loading/error; token attached | Mixed; profile and logout broken |
| `New-JalgaonUI/src/components/BusinessListings.tsx` | global search or listing list | load/category/search/page | loading/error; public | Request aligned; response/filter gaps |
| `New-JalgaonUI/src/components/BusinessProfile.tsx` | listing detail, favorite, review, claim | load/buttons/forms | toasts + token where required | Aligned |
| `New-JalgaonUI/src/app/directory/[slug]/BusinessDetailClient.tsx` | listing/detail/related/review | load/review submit | loading + alert; token on review | Review payload broken |
| `New-JalgaonUI/src/app/add-listing/AddListingClient.tsx` | categories/create | load/form submit | loading/toasts; multipart+JWT | Aligned with validation gaps |
| `New-JalgaonUI/src/app/edit-listing/[slug]/EditListingClient.tsx` | categories/detail/update | load/form submit | loading/toasts; multipart+JWT | Aligned |
| `New-JalgaonUI/src/components/BusinessClaimModal.tsx` | claim | form submit | loading/error/success+JWT | Aligned |
| `New-JalgaonUI/src/components/BusinessReportModal.tsx` | report | form submit | loading/error/success; token optional | Aligned |
| `New-JalgaonUI/src/app/jobs/JobsPortal.tsx` | jobs/categories/featured | page/filter/page change | loading/error | Response fields and visible actions broken |
| `New-JalgaonUI/src/app/jobs/[slug]/JobDetailClient.tsx` | job detail/save | load/save | errors + JWT for save | Aligned |
| `New-JalgaonUI/src/components/JobApplyModal.tsx` | job apply | form submit | loading/error/success+JWT | Broken payload: no resume |
| `New-JalgaonUI/src/app/add-job/AddJobClient.tsx` | categories/job submit | load/form submit | loading/error/success+JWT | Aligned |
| `New-JalgaonUI/src/app/account/jobs/[id]/applications/ApplicationsClient.tsx` | employer applications/status | load/status button | loading/error + JWT | Aligned |
| `New-JalgaonUI/src/app/events/EventsPortal.tsx` | events/categories | load/filter/page | loading/error | List loads; detail buttons disconnected |
| `New-JalgaonUI/src/app/events/[slug]/*` | event detail | server/client load | error/empty handling | Aligned |
| `New-JalgaonUI/src/app/add-event/AddEventClient.tsx` | categories/event submit/token refresh | load/form/401 retry | loading/toasts+JWT | Mixed; required fields and rotated refresh issue |
| `New-JalgaonUI/src/app/news/NewsPortal.tsx` | categories/trending/latest | load/category/page | loading/error | Aligned; page query ignored by backend |
| `New-JalgaonUI/src/app/news/[slug]/NewsDetailClient.tsx` | detail/trending/comments | load/comment submit | loading/error/message+JWT | Aligned; approval message mismatches backend |
| `New-JalgaonUI/src/components/BreakingNews.tsx`, `LatestNews.tsx` | breaking/trending | homepage load | fallback/console warning | Aligned |
| `New-JalgaonUI/src/components/UpcomingEvents.tsx`, `JobOpenings.tsx`, `NgoSpotlight.tsx`, `TrendingListings.tsx` | event/job/NGO/listing lists | homepage load | fallback warnings | Aligned |
| `New-JalgaonUI/src/components/CarouselAds.tsx` | ads by slot/click/impression | load/rotation/click | fallback warnings | Aligned |
| `New-JalgaonUI/src/app/advertise/AdvertiseClient.tsx` | ad submit | form | loading/toasts+JWT | Aligned |
| `New-JalgaonUI/src/app/ngo/NgoClient.tsx` | none | static JSON load | fake loading state | Missing API integration |
| `New-JalgaonUI/src/app/add-ngo/AddNGOClient.tsx` | NGO categories/submit | load/form | loading/error/success+JWT | Aligned |
| `New-JalgaonUI/src/app/admin/ngos/page.tsx` | public NGO list, nonexistent verify/delete routes | page/buttons | reports success without `res.ok` | Broken |
| `New-JalgaonUI/src/app/admin/**/*.tsx` | admin panel/news/events/jobs routes | page load/CRUD/moderation | JWT; inconsistent `res.ok` checks | Mostly aligned; silent-error and RBAC issues |
| `New-JalgaonUI/src/components/ContactForm.tsx` | none | form submit | simulated timeout success | Missing API |
| `New-JalgaonUI/src/components/TouristPlacesList.tsx` | none | local filtering/pagination | static array | Missing API |
| `jalgaonUi/src/utils/apiClient.js` | token refresh | 401 interceptor | queue + rotated token storage | Aligned |
| `jalgaonUi/src/components/LoginSignup/LoginSignup.jsx` | CSRF/register/login/user | modal/mount | loading/error; stores token | Aligned |
| `jalgaonUi/src/components/Categorysection/BusinessCard.jsx` and `AccountCompo/Likedpage.jsx` | wrong favorites route | favorite click/load | console/alert; JWT | Broken endpoint and payload |
| `jalgaonUi/src/components/Businesscompo/CompanyWork.jsx` | legacy review APIs | load/submit | console only; JWT | Broken auth/backend/response contract |
| `jalgaonUi/src/components/Jobs/JobApplicationForm.jsx` | job apply | form | loading/error/success+resume+JWT | Aligned |
| `jalgaonUi/src/components/AllForms/AddListingForm.jsx` | categories/create | form | alerts; multipart+JWT | Create aligned; edit route incorrectly creates |
| `jalgaonUi/src/pages/SubmitEventPage.jsx` | event categories/submit | form | loading/field errors+JWT | Aligned |
| `jalgaonUi/src/pages/admin/*` | admin panel/news/events/jobs/ads routes | page load/actions | JWT; mostly Axios errors | Mostly aligned; same RBAC mismatch |
| `jalgaonUi/src/pages/NewsIndexPage.jsx`, `components/News/LatestNewsSection.jsx` | `/api/v1/news/` | load | console error handling | Wrong route: receives router index, not articles |

## 4. Frontend page-to-backend matching

| Page/component | Feature/action | Required API | Current API | Status | Issue / suggested fix | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| Login/signup modal | login/register | auth login/register | correct | Aligned | Keep; centralize auth client | High |
| Any logout button | invalidate refresh token | POST auth logout with bearer + `{refresh}` | missing payload/token or local-only | Broken | Send both, then clear local state; optionally add logout-all UI | High |
| Account settings | read/update profile | GET/PATCH auth user | GET wrapper misread; PATCH unsupported | Broken | Read `result.user`; add backend PATCH or remove edit UI | High |
| Account subroutes | lists/settings | existing account endpoints | compile-time missing component | Broken | Create `UserProfileContent` or route pages to `DashboardClient` | High |
| Directory search | active listing search | listings search with `q` | global search with `search` | Works but unsafe backend | Prefer `/listings/search/?q=` or filter global search to active | High |
| Directory detail | submit review | listing review create | correct endpoint, wrong JSON keys | Broken on `/directory/[slug]` | Send `rating_star`, `user_review` | High |
| `/homepage` profile | submit review/favorite/claim | listing APIs | correct | Aligned | Consolidate with directory detail to avoid drift | Medium |
| Add listing | create | listing create | correct | Aligned | Match backend 50-char name and upload constraints | Medium |
| Edit listing | update | PATCH listing update | correct in Next; Vite create endpoint | Mixed | Make Vite edit use slug detail + PATCH | High |
| Jobs list | list/filter/detail/apply/save | jobs list/detail/apply/save | list only | Broken workflow | Map real fields; wire Apply, Bookmark, card/detail links | High |
| Job application modal | apply | multipart resume+cover letter | cover letter only | Broken | Add required file upload; no profile resume exists | High |
| Events list | list/detail | events list + detail | list only | Incomplete | Preserve slug and link both View Details buttons | High |
| Add event | submit | event submit | correct | Incomplete validation | Require all serializer-required fields | High |
| News | list/detail/comments | latest/trending/detail/comments | correct in Next | Aligned | Add pagination if UI pages are desired | Medium |
| Legacy news list | list | news latest | router root | Broken | Replace `/api/v1/news/` with `/api/v1/news/latest/` | High |
| NGO public directory | verified list/detail | NGO list/detail | local JSON | Missing | Fetch `/api/v1/ngo/`; add `/ngo/[slug]` detail page | High |
| NGO admin | admin CRUD/verify | `/ngo/admin/ngos/` + verify action | public list and nonexistent routes | Broken | Use admin routes and add explicit backend verify/unverify action | High |
| Contact form | submit inquiry | no backend route | simulated timer | Missing | Create contact-message model/API and POST it | Medium |
| Tourism page | tourism list/detail/search | no backend route | local array | Missing | Implement tourism API, then replace static list | Medium |
| Ad submission/moderation | submit/approve/reject/track | ad APIs | correct | Aligned/tested | Add billing only if packages are paid | Medium |
| Reports/export | PDF/CSV download | no backend route | no action | Missing capability | Define export endpoints before adding buttons | Low |

## 5. Missing API connections and static/demo UI

| Page/component | Current UI feature | Missing API needed | Suggested endpoint/method/payload | Expected response | Priority |
| --- | --- | --- | --- | --- | --- |
| `components/ContactForm.tsx` | Shows fake success after 1 second | Contact submission | POST `/api/v1/contact/` `{name,email,subject,message}` | created ticket/message ID | High |
| `app/ngo/NgoClient.tsx` | Loads `ngo_data.json` | NGO list/search/category | GET `/api/v1/ngo/?search=&category=&page=` | paginated verified NGOs | High |
| `app/ngo/NgoClient.tsx` | Volunteer button has no handler | Volunteer lead | POST `/api/v1/ngo/{slug}/volunteer/` contact/interest | application status | Medium |
| `app/ngo/NgoClient.tsx` | Donate button has no handler | Donation/payment initiation | POST `/api/v1/ngo/{slug}/donations/` amount/payment data | payment session/order | Medium |
| `components/TouristPlacesList.tsx` | hardcoded large array | Tourism list/detail | GET `/api/v1/tourism/places/` | paginated places | Medium |
| `components/LocalWonders.tsx` | static wonder cards | Tourism highlights | GET `/api/v1/tourism/highlights/` | highlighted places | Low |
| `components/BlogSection.tsx` | static blog cards | Blog list | GET `/api/v1/blog/posts/` | published posts | Low |
| `app/jobs/JobsPortal.tsx` | Apply button has no handler | Existing apply/detail APIs | Navigate to `/jobs/{slug}` or open valid apply form | job/app result | High |
| same | Bookmark button has no handler | Existing save API | POST `/api/v1/jobs/{slug}/save/` | `{status}` | High |
| `app/events/EventsPortal.tsx` | View Details buttons do nothing | Existing event detail API | Link `/events/{slug}` | detail page | High |
| `app/admin/ngos/page.tsx` | Add NGO button does nothing | Admin create | POST `/api/v1/ngo/admin/ngos/` | NGO object | Medium |
| `app/add-listing/AddListingClient.tsx` | Get/Set location buttons do nothing | Browser geolocation + listing fields | Populate `lat`,`lng`,`gmap_link` before listing POST | coordinates | Medium |
| Account dashboard | local-only logout | Existing auth logout | POST with bearer + refresh | logout confirmation | High |
| Login modal | no forgot-password flow | Password reset APIs | request/verify/reset endpoints | reset status | Medium |
| Favorites | no remove saved listing | Backend delete/toggle capability | DELETE favorite ID or POST toggle | unsaved status | Medium |
| Admin/reporting pages | no export/download | report export API | GET `/api/v1/admin-panel/.../export/` | CSV/PDF stream | Low |
| Global UI | no notifications | notification APIs | GET/read/unread endpoints | notification page/count | Low |
| Ads packages | package pricing but no checkout | payment/billing APIs | create order/webhook/status endpoints | payment/order status | Medium if packages are paid |

## 6. Backend APIs not used correctly in frontend

### Never referenced by a compatible call

| Backend endpoint | Method(s) | Purpose/file | Intended frontend | Priority |
| --- | --- | --- | --- | --- |
| `/api/v1/auth/logout-all/` | POST | all-device logout; accounts views | account security settings | Medium |
| `/api/v1/auth/token/` | POST | duplicate SimpleJWT login | none if custom login remains | Low/cleanup |
| `/api/v1/listings/{slug}/reviews/` | GET | paginated full review list | listing review pagination | Medium |
| `/api/v1/news/admin/articles/{id}/breaking/` | PATCH | breaking toggle | admin news table/edit page | Medium |
| `/api/v1/jobs/admin/applications/{id}/` | GET | application detail | admin application drawer/page | Low |
| `/api/v1/ngo/admin/ngos/` | GET/POST | admin NGO list/create | admin NGOs | High |
| `/api/v1/ngo/admin/ngos/{id}/` | GET/PUT/PATCH/DELETE | admin NGO CRUD | admin NGOs/edit | High |
| `/api/v1/ngo/admin/categories/` | GET/POST | NGO categories | admin NGO categories | Medium |
| `/api/v1/ngo/admin/categories/{id}/` | GET/PUT/PATCH/DELETE | category CRUD | admin NGO categories | Medium |

### Referenced only incorrectly

| Backend endpoint | Intended method | Wrong frontend usage | Priority |
| --- | --- | --- | --- |
| `/api/v1/auth/logout/` | POST bearer + refresh body | Next/Vite omit required data; account is local-only | High |
| `/api/v1/news/` | GET router metadata | Vite treats it as article list | High |
| `/api/v1/reviews/` | legacy Token-auth POST | Vite sends JWT; backend save is incomplete | High |
| `/api/v1/reviews/by-shop/` | legacy Token-auth GET | Vite sends JWT and an ignored filter | High |
| `/api/v1/ngo/{slug}/` | public GET | admin sends DELETE with numeric ID | High |

Method-level unused operations also exist inside otherwise-used CRUD paths: generic admin create/edit/detail methods for events/jobs, user detail GET/PATCH, news generic PATCH and comment creation, event-category edit, and listing PUT.

## 7. Wrong or broken API connections

| Frontend file | Current API/behavior | Correct API/contract | Problem | Suggested fix | Priority |
| --- | --- | --- | --- | --- | --- |
| `New-JalgaonUI/src/components/admin/AdminTopbar.tsx` | POST logout with no headers/body | bearer + `{refresh}` | Always 401/400; refresh remains valid | Attach token and refresh; check `res.ok` | High |
| `New-JalgaonUI/src/app/account/DashboardClient.tsx` | local-only logout | same logout API | Server token not blacklisted | Call backend first | High |
| same | reads `result.first_name`; PATCH user | read `result.user`; backend currently GET-only | Blank prefill and 405 update | Fix read shape and add backend PATCH | High |
| `New-JalgaonUI/src/app/directory/[slug]/BusinessDetailClient.tsx` | `{rating,review_text}` | `{rating_star,user_review}` | DRF returns required-field 400 | Rename payload keys | High |
| `New-JalgaonUI/src/components/JobApplyModal.tsx` | only `cover_letter` | required multipart `resume` | Every submit fails validation | Add file input and <=500KB check | High |
| `New-JalgaonUI/src/app/admin/ngos/page.tsx` | GET public `/ngo/` | GET `/ngo/admin/ngos/` | Admin sees only verified public rows | Use admin route | High |
| same | PATCH `/ngo/{id}/verify/` | no route exists | 404 is treated as success | Add backend action; then call it and check response | High |
| same | DELETE `/ngo/{id}/` | DELETE `/ngo/admin/ngos/{id}/` | 405/404; row removed locally anyway | Correct route and check response | High |
| `jalgaonUi/src/components/AccountCompo/Likedpage.jsx` | GET `/listings/favorites/` | GET `/listings/user/favorites/` | 404 | Correct path; remove ignored `user_id` | High |
| `jalgaonUi/src/components/Categorysection/BusinessCard.jsx` | same wrong path; `{user,shop_listing}` | POST user favorites; `{shop_listing_id}` | 404/wrong payload | Correct both | High |
| `jalgaonUi/src/components/Businesscompo/CompanyWork.jsx` | legacy review endpoints with JWT | slug review endpoints with JWT | 401 plus broken backend legacy flow | Migrate to `/listings/{slug}/reviews*` | High |
| `jalgaonUi/src/main.jsx` + `AddListingForm.jsx` | `/editForm/:shopId` renders create-only form | detail + PATCH update | Editing creates a second listing | Implement edit mode/slug route | High |
| `jalgaonUi/src/pages/NewsIndexPage.jsx`, `LatestNewsSection.jsx` | GET `/news/` | GET `/news/latest/` | Router metadata is mapped as articles | Use latest route | High |
| `New-JalgaonUI/src/app/jobs/JobsPortal.tsx` | reads `logo`, `salary`, `posted`, `type` | `company_logo`, salary min/max, `created_at`, `job_type` | Blank/undefined cards | Map backend serializer fields | High |
| same | selected job type/experience only retrigger fetch | append supported `job_type`; backend has no experience field | Filters visually lie | Send normalized values; remove or add experience backend | High |
| `New-JalgaonUI/src/app/events/EventsPortal.tsx` | drops slug; detail buttons have no handler | retain slug and link `/events/{slug}` | View action is UI-only | Map slug and use `Link` | High |
| `New-JalgaonUI/src/app/add-event/AddEventClient.tsx` | only title/start required in UI | backend also requires descriptions, organizer, venue | avoidable 400s | Mark fields required and surface all field errors | High |
| Next admin action pages | many `await fetch(...)` calls never inspect `res.ok` | non-2xx must be errors | 400/403/404 displayed as success | Central request helper + typed errors | High |
| Next refresh retries | store only new access token | store rotated `refresh` too | next refresh uses blacklisted old token | Persist both tokens | High |
| Next client fallbacks | relative `/api/v1/...` or mixed localhost defaults | one required API base URL or Next rewrite/proxy | env omission causes Next-origin 404s | Require/document `NEXT_PUBLIC_API_URL` | High |

## 8. API base URL and environment audit

| Config file | Current value / issue | Risk | Suggested fix |
| --- | --- | --- | --- |
| `New-JalgaonUI/.env.local` | Local API is `http://127.0.0.1:8000`; file is ignored | Local setup is valid | Keep secrets ignored |
| `New-JalgaonUI/.env.example` | Missing `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_ADMIN_URL`; contains a commented secret-looking provider key | Fresh installs route some requests to Next itself; credential exposure | Add non-secret placeholders; revoke/remove any real-looking key |
| `New-JalgaonUI/next.config.ts` | No `/api/v1` rewrite/proxy | Relative fallback requests 404 on Next origin | Add rewrite or remove relative fallbacks and require env |
| Next source files | Defaults alternate between `localhost:8000`, `127.0.0.1:8000`, and empty string | SSR/browser inconsistency; CORS origin drift | Centralize `apiBaseUrl` and request helper |
| `jalgaonUi/.env.development` | tracked local API URL | Works for local dev | Acceptable; document expected port |
| `jalgaonUi/.env.production` | tracked `https://api.jalgaon.com` | Correct public value | Keep secrets out (none present) |
| `jalgaonUi/src/utils/apiClient.js` | Axios bearer interceptor + serialized refresh queue | Good pattern | Reuse this pattern in Next |
| `jalgaonUi/src/Layout.jsx` / Navbar | separate clients read obsolete `authToken`, while login stores `token` | auth header mismatch and dead code | Remove duplicates; use `apiClient` everywhere |
| `jalgaonApi/.env.example` | contains a concrete Django secret value; omits Next port 3000 from CORS/CSRF examples | Secret reuse and setup failure | Replace with placeholder; add both `localhost:3000` and `127.0.0.1:3000` |
| `jalgaonApi/jalgaonApi/settings.py` | insecure hardcoded secret fallback and DEBUG defaults true | production compromise if env missing | Fail closed in production; require secret and explicit DEBUG |
| same | actual JWT access lifetime is 1 day; refresh 7 days with rotation | long stolen-token window | Use shorter production access lifetime |
| same | current local `.env` includes both port-3000 origins | Local Next CORS is currently configured | Mirror in `.env.example` |

## 9. Authentication and authorization audit

| Feature | Frontend file | Backend API | Status | Issue / fix | Priority |
| --- | --- | --- | --- | --- | --- |
| Register | both login components | auth register | Aligned | Backend strong-password errors are shown | High |
| Login | both login components | auth login | Aligned | 429 lockout text handled as generic error | High |
| Logout | account/AdminTopbar/Vite navbar | auth logout | Broken | Include bearer and refresh; re-enable consistent UI | High |
| Logout all devices | none | auth logout-all | Missing UI | Add account security action | Medium |
| Token storage | both contexts | localStorage | Functional but XSS-readable | Consider secure cookie architecture; at minimum CSP and short access TTL | High |
| Refresh | Vite `apiClient.js` | token refresh | Aligned | Queue and rotation handled |
| Refresh | Next | token refresh | Incomplete | Only two pages retry; rotated refresh is lost | High |
| Protected routes | Next admin layout | role in stored user | Client-only | Stale/tampered local role briefly renders; APIs still enforce server RBAC | Medium |
| Protected routes | Vite `AdminGuard.jsx` | role from fetched user | Better, but broad staff guard | Per-page permissions still mismatch backend | High |
| Unauthorized handling | Next admin pages | all protected APIs | Inconsistent | Some redirect, many ignore status | Centralize 401 refresh and 403 display | High |
| Expired session | Next AuthContext | none | Missing | Validate token or call `/auth/user/` on mount | High |
| Profile update | account settings | auth user | Broken | Backend GET-only | Add PATCH serializer/view | High |
| Forgot/reset password | no UI/API | none | Missing | Implement end-to-end reset flow | Medium |

## 10. Role-based API audit

Roles found in code: `super_admin`, `admin`, `content_manager`, `news_editor`, `seo_manager`, `moderator`, `support`, `advertiser`, `business_owner`, `registered_user`, `guest`. There are no student, mentor, receptionist, patient, technician, pathologist, or center-admin roles in this project.

| Role | Page/module | Required/current API | Status / issue | Suggested fix |
| --- | --- | --- | --- | --- |
| Super Admin | all admin + role assignment | all admin APIs | Aligned | Keep self-role-change guard |
| Admin | all admin panels | all admin APIs | Mostly aligned | Fix logout/NGO/error handling |
| Content Manager | listings/trending/ads/categories sidebar | backend requires Admin for these | 403 mismatch | Hide links or widen backend policy intentionally |
| Content Manager | news/events/jobs/NGO/moderation | matching role APIs | Mostly aligned | NGO admin routes still wrong |
| Moderator | listings/trending/ads sidebar | backend requires Admin | 403 mismatch | Hide these links |
| Moderator | events/NGO sidebar | backend requires Content (moderator excluded) | 403 mismatch | Hide or change RBAC policy |
| Moderator | news comments sidebar | backend requires News (moderator excluded) | 403 mismatch | Hide or grant explicit comment permission |
| Moderator | jobs/moderation/claims/reports | matching permissions | Aligned |
| News Editor | news CRUD | News APIs | Aligned except delete bug | Import/use `PermissionDenied`; hide delete for non-admin |
| SEO Manager | admin layout | Next layout excludes; Vite broad staff guard allows empty panel | Inconsistent | Define actual SEO endpoints/pages or deny clearly |
| Support | admin layout | Next excludes; Vite broad guard allows empty panel | Inconsistent | Define support scope |
| Advertiser | ad submit/analytics | user ad APIs | Submission connected; analytics only in Vite | Add Next account ads/analytics UI |
| Business Owner | listings/jobs/events/NGO | user APIs | Mostly aligned | Fix account compile/profile/logout |
| Registered User | save/review/apply/report | user APIs | Mixed | Next job apply and directory review need fixes |
| Guest | public lists/details/report | public APIs | Mostly aligned | Global search must filter active listings |

## 11. CRUD integration matrix

| Module | Create | List | Detail | Update | Delete | Search/filter/page | Frontend status / missing | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Users | register | admin users | backend only | role only; profile PATCH absent | none | admin search/page | Profile edit missing; user detail unused | High |
| Listings | connected | connected | connected | Next connected; Vite edit broken | Next connected | listing search/page connected | Mixed callers for review/favorite | High |
| Reviews | connected on one Next flow | embedded + unused list | embedded | none | none | pagination unused | Directory flow wrong; legacy API broken | High |
| Claims | connected | admin connected | no dedicated detail | approve/reject | none | status/page | Aligned | Medium |
| Business reports | connected | admin connected | no dedicated detail | resolve/dismiss | none | status/page | Aligned | Medium |
| News articles | admin create | public/admin connected | connected | admin PUT/status | admin delete | category/search/order; page ignored | Legacy list wrong; breaking toggle unused | High |
| News categories | admin create | connected | backend unused | PUT connected | connected | no pagination | Mostly aligned | Medium |
| News comments | connected | embedded/admin connected | backend unused | admin PATCH | connected | no filter/page backend | Approval-state message mismatch | Medium |
| Events | connected | connected | connected API, list buttons dead | admin generic unused | admin connected | category/date/search; page ignored | UI workflow incomplete | High |
| Event categories | admin create | connected | unused | unused | connected | page ignored | No edit UI | Low |
| Jobs | connected | connected | connected | status only | admin connected | public filters; admin search ignored; page ignored | List mapping/buttons broken | High |
| Job applications | Vite correct/Next broken | user/employer/admin connected | admin detail unused | employer status connected | none | admin search ignored | Resume required in Next | High |
| Job categories | admin create | connected | unused | PUT connected | connected | page ignored | Mostly aligned | Medium |
| Saved jobs | toggle connected on detail | account connected | nested | toggle | toggle | none | List bookmark dead | High |
| Ads | connected | public/user/admin connected | no dedicated detail | moderation/slot updates | no ad delete | slot/status/page | Aligned/tested; no billing | Medium |
| NGOs | connected | spotlight only; main static | API unused | admin UI wrong | admin UI wrong | no search/page | Admin/public directory incomplete | High |
| NGO categories | backend admin CRUD | submission list | backend unused | unused | unused | none | No frontend admin UI | Medium |
| Finance | none | Vite connected | none | none | none | none | Next uses independent external BFF | Low |
| Contact/tourism/payments/notifications | no API | static/none | none | none | none | none | Backend capability missing | Medium/Low |

## 12. Forms and payload audit

| Form | Frontend file | Submit API | Current payload vs backend | Issue / fix | Priority |
| --- | --- | --- | --- | --- | --- |
| Register/login | both login components | auth register/login | Exact `phone_number`,`password` | Aligned | High |
| Profile settings | `account/DashboardClient.tsx` | PATCH auth user | names + phone; backend GET-only | Add PATCH; do not send read-only phone | High |
| Add listing | Next/Vite listing forms | listing create | Required fields and multipart mostly match | Next name allows 100 vs backend 50; Vite email UI optional though backend required | Medium |
| Edit listing | Next edit form | PATCH listing update | Multipart matches | Aligned | Medium |
| Vite edit listing | `AddListingForm.jsx` | POST create | Create payload on edit route | Implement PATCH with slug | High |
| Review (`BusinessProfile`) | `BusinessProfile.tsx` | review create | correct `rating_star`,`user_review` | Aligned | Medium |
| Review (directory route) | `BusinessDetailClient.tsx` | review create | wrong `rating`,`review_text` | Rename fields | High |
| Legacy review | `CompanyWork.jsx` | legacy reviews | fields look plausible, auth/backend save broken | Migrate endpoint | High |
| Business claim | both claim components | listing claim | `message`,`contact_number` exact | Aligned | Medium |
| Business report | both report components | listing report | `reason`,`description` exact | Aligned | Medium |
| Add event (Vite) | `SubmitEventPage.jsx` | event submit | Required fields/multipart match | Aligned | Medium |
| Add event (Next) | `AddEventClient.tsx` | event submit | Sends correct names only when nonempty | Missing client-required flags for description, short description, organizer, venue name/address | High |
| Add job | Next/Vite post job | job submit | Job fields/multipart match | Aligned; frontend success says immediately active, matching current backend but not moderation expectations | Medium |
| Apply job (Vite) | `JobApplicationForm.jsx` | apply | resume + optional cover letter | Aligned, 500KB checked | High |
| Apply job (Next) | `JobApplyModal.tsx` | apply | cover letter only | Required resume missing; “profile resume” claim is false | High |
| Add NGO | `AddNGOClient.tsx` | NGO submit | exact fields + multipart logo | Aligned | Medium |
| Submit ad | both ad forms | ad submit | exact fields + image | Aligned; backend has no upload-size validation | Medium |
| News comment | `NewsDetailClient.tsx` | comments POST | exact `body` | Aligned; status messaging wrong | Medium |
| Admin news create/edit | admin news pages | article CRUD | multipart field names match serializer | Aligned; many calls do not check response | High |
| Admin listing moderation | admin listing pages | listing action | action/rejection reason match | Aligned; status checks inconsistent | High |
| Admin NGO verify/delete | admin NGO page | nonexistent/wrong paths | payload cannot be accepted | Add verify action and correct admin delete | High |
| Contact | `ContactForm.tsx` | none | local object only | Fake success; create API | High |

Date inputs use browser `datetime-local` values. DRF accepts ISO-like input, but the frontend does not explicitly attach an offset; verify timezone handling against the backend's UTC setting before production.

## 13. Response-handling audit

| API endpoint | Frontend file | Field used | Actual backend field | Issue / fix |
| --- | --- | --- | --- | --- |
| GET auth user | `account/DashboardClient.tsx` | `result.first_name` etc. | `result.user.first_name` | Read wrapper correctly |
| GET listing list | `BusinessListings.tsx` | `business_email`, `is_verified` | not in `ListingListSerializer` | Remove display or add serializer fields |
| GET my listings | `DashboardClient.tsx` | `business_description` | not in list serializer | Add field or stop rendering it |
| GET jobs/featured | `JobsPortal.tsx` | `logo`,`salary`,`posted`,`type` | `company_logo`,`salary_min/max`,`created_at`,`job_type` | Add mapping layer |
| GET events | `EventsPortal.tsx` | no retained `slug` | response includes `slug` | Preserve it for detail links |
| GET legacy reviews | `CompanyWork.jsx` | `review.shop_listing`, `review.user.phone_number` | serializer omits both | Use current slug review serializer/fields |
| GET `/news/` | Vite news list | array of articles | router endpoint map | Call `/news/latest/` |
| Public lists jobs/events/news/NGO | Next portals | `count`, `page` | plain arrays; no pagination class | Add backend pagination or remove dead pagination |
| Admin NGO action | admin NGO page | assumes success after `fetch` | 404/405 response | Require `res.ok` before local mutation/message |
| News comment POST | News detail | “pending approval” | model default is `approved` | Make backend pending or change message |

Empty/loading/error handling is present on most new public and account pages. The largest systemic gap is that many admin mutations only catch network exceptions: `fetch` does not throw on HTTP 400/401/403/404/500, so these pages can show success after a failed request.

## 14. Buttons and actions audit

| Page | Button/action | Current function | Required API | Connected | Issue / fix | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| Jobs portal | Apply Now | none | job detail/apply | No | Link/open valid resume form | High |
| Jobs portal | Bookmark | none | job save toggle | No | POST save with JWT | High |
| Events portal | View Details (both sections) | none | event detail | No | Link with retained slug | High |
| NGO directory | Volunteer | none | no backend | No | Add volunteer API/form | Medium |
| NGO directory | Donate | none | no payment API | No | Add payment/donation flow | Medium |
| Admin NGO | Add NGO | none | admin NGO create | No | Open form and POST admin route | Medium |
| Admin NGO | Verify | nonexistent route | verify action | No | Add backend action + check response | High |
| Admin NGO | Delete | wrong route/method | admin NGO DELETE | No | Correct path + response check | High |
| Contact | Send Message | timeout only | contact POST | No | Replace simulation | High |
| Add listing (Next) | Get Current Location / Set Location | no handler | geolocation/lat/lng | No | Implement handlers | Medium |
| Account | Logout | local clear only | auth logout | No | Send bearer+refresh | High |
| Admin top bar | Logout | malformed request | auth logout | No | Send correct contract | High |
| Vite navbar | Logout | handler/button commented; obsolete token key | auth logout | No | Re-enable through shared client | High |
| Vite edit route | Submit | creates listing | listing update | Wrong | PATCH existing slug | High |
| Admin CRUD buttons | mutations | correct URL in most pages | matching admin APIs | Partial | Check status and display backend errors | High |
| Export/download | absent | none | no backend export | No | Design API only if required | Low |

## 15. API error-handling audit

| API/group | Frontend file(s) | Current handling | Missing handling / fix |
| --- | --- | --- | --- |
| Auth login/register | both modals | 400/401 messages and loading | Explicit 429 lockout UX; timeout/network distinction |
| Auth refresh | Vite `apiClient.js` | queued 401 refresh; force logout | Good baseline |
| Auth refresh | Next | ad-hoc in two files | Central 401 retry, rotated refresh persistence, single-flight queue |
| Admin GETs/mutations | most Next admin pages | try/catch only; some `res.ok` | Check every non-2xx; distinguish 401/403/404/validation/500 |
| Public lists | Next components | loading/error/fallback | Add retry and honest empty-vs-failure states where fallback static data is used |
| Forms | Next add/edit pages | toast/error strings | Map every DRF field-error key beside its field |
| Job apply | Next modal | generic extraction | Required resume field error is currently inevitable |
| NGO admin | admin NGO page | network-only catch | 404/405 currently reported as success |
| Account lists | DashboardClient | 401/403 forces logout | Try refresh on 401; do not treat valid 403 as expired login |
| Network timeout | all fetch calls | no timeout/AbortController | Add shared timeout and cancellation on unmount |
| Empty response/204 | several deletes | usually no body parsed | Correct, but only after checking `res.ok` |

## 16. Backend correctness and documentation findings

| Backend file | Finding | Status / fix | Priority |
| --- | --- | --- | --- |
| `apps/reviews/views.py` | Legacy POST uses TokenAuthentication while login issues JWT; it also omits `shop_listing` in `serializer.save()` | Broken; retire or fix | High |
| same | `by-shop` ignores the shop parameter and exposes all reviews to an authenticated legacy-token caller | Broken/data-scope issue | High |
| `apps/search/views.py` | global search queryset is `ShopListing.objects.all()` | Filters can expose pending/rejected/suspended rows; filter `status='active'` | High |
| `apps/news/views.py` | `perform_destroy` references unimported `exceptions.PermissionDenied` | News-editor delete can 500; import/use DRF exception | High |
| `apps/news/models.py` / views | comment default is approved while code/UI say pending | Workflow mismatch; choose one policy | Medium |
| `apps/directory/views.py` | new listing reviews are explicitly saved approved while UI says pending moderation | Workflow mismatch | Medium |
| `apps/ngo/serializers.py` | `is_verified` is read-only and no verify action exists | Admin cannot verify through API | High |
| public event/job/news/NGO views | no pagination class | Frontend page controls and `page` query do nothing | Add standard pagination or simplify UI | Medium |
| admin job viewsets | no SearchFilter/search fields | admin search boxes send ignored `search` | Add filters or remove search UI | Medium |
| `jalgaonApi/settings.py` | `drf_spectacular` is not in `INSTALLED_APPS` | `manage.py spectacular` command unavailable | Add app if management generation is expected | Medium |
| multiple APIViews | no schema serializer/`extend_schema` | schema generation emits many errors and omits CSRF, legacy detail, and latest-news routes | Annotate views; regenerate authoritative schema | Medium |

## 17. API priority roadmap

### High priority

1. Restore Next buildability by resolving the eight missing `UserProfileContent` imports.
2. Create one Next API client with a required base URL, bearer attachment, single-flight refresh, rotated-token storage, timeout, and normalized DRF errors.
3. Fix logout and account profile GET/PATCH end to end.
4. Fix the directory review payload and Next job application resume upload.
5. Replace NGO admin's public/nonexistent routes with admin routes and add a backend verify action.
6. Wire jobs Apply/Bookmark and events View Details; correct job response mapping.
7. Fix or retire legacy review endpoints and filter global search to active listings.
8. Align sidebar RBAC with backend permissions and require `res.ok` for every admin mutation.
9. Replace Vite `/news/` calls and wrong favorite calls; make Vite edit actually update.

### Medium priority

1. Connect the public NGO page to the real API and add NGO detail pages.
2. Add contact, password-reset, notification, and—if packages/donations are paid—payment APIs.
3. Make event form requirements match the serializer.
4. Add pagination to public news/events/jobs/NGO/search endpoints or remove inactive page controls.
5. Add admin search filters and event/job edit/detail UIs for existing CRUD operations.
6. Resolve moderation-status mismatches for reviews/comments.
7. Complete environment examples and remove secret-looking values.

### Low priority

1. Connect tourism/blog static content after backend models/routes exist.
2. Add exports/PDF only after report requirements are defined.
3. Remove unused mock Next business routes and redundant auth/token paths.
4. Finish OpenAPI annotations and schema-generation tooling.

## 18. Final conclusion

The strongest connected areas are login/register, public listing/category/detail data, listing creation/update/delete in the Next app, claims/reports, ad submission/display/tracking, events backend and moderation, news in the Next app, job submission/detail/account lists, and most existing admin CRUD.

The system is not production-complete because the active Next app currently fails compilation and several core user flows are contract-broken: logout, profile settings, directory review, job application, NGO administration, job-list actions, event-list details, and some Vite legacy calls. Public NGO, contact, tourism, donation/payment, notification, forgot-password, export/PDF, and several account subpages remain static, missing, or incomplete.

Recommended implementation order is: restore the Next build; centralize API/auth handling; fix the five core user contracts; correct NGO administration and RBAC; wire dead buttons; then add missing domain APIs and pagination. After each phase, add API tests for the affected domain and run Django tests plus both frontend builds.
