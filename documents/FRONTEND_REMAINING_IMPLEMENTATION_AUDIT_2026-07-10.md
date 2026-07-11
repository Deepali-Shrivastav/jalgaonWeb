# Frontend Remaining Implementation Audit

Audit date: 2026-07-10
Workspace: `D:\jalgaonWeb`
Primary frontend audited: `New-JalgaonUI` (Next.js)
Secondary frontend checked for context: `jalgaonUi` (legacy Vite)
Backend checked: `jalgaonApi` (Django REST API)

## Executive summary

The active Next.js frontend is no longer just a static mock. Many major areas are already connected to backend APIs: auth modal, listings, search, categories, news, blog, jobs, events, ads, startups, clubs, account pages, notifications, analytics, and most admin pages.

The remaining frontend work is concentrated in five areas:

1. Fix current compile blocker in `BusinessProfile.tsx`.
2. Replace still-static pages/forms with real API flows where backend APIs exist.
3. Correct broken or assumed API calls, especially NGO admin and some admin actions.
4. Add missing pages/routes that the UI links to.
5. Finish UX gaps such as real map directions, contact/help flows, profile password reset, empty states, and stronger error handling.

Current verification result:

| Check | Result |
| --- | --- |
| `New-JalgaonUI`: `npx tsc --noEmit` | Fails |
| Compile blocker | `src/components/BusinessProfile.tsx(604,16): JSX element 'div' has no corresponding closing tag.` |
| Code changes made during audit | None |

## Priority 0 - Must fix before frontend can be trusted

### 1. `BusinessProfile.tsx` has a JSX syntax error

Evidence:
- `npx tsc --noEmit` fails at `New-JalgaonUI/src/components/BusinessProfile.tsx(604,16)`.
- Around the review modal, the `Rating` wrapper `<div>` is opened but not closed before the next review text `<div>`.

Impact:
- TypeScript compilation stops at this file.
- Build/lint results after this point may hide more errors.

Implementation needed:
- Close the rating field `<div>` correctly inside the review modal.
- Re-run `npx tsc --noEmit` and then `npm run build`.

## Priority 1 - Broken or wrong frontend API work

### 2. NGO admin page calls wrong/assumed endpoints

Frontend evidence:
- `New-JalgaonUI/src/app/admin/ngos/page.tsx:29` calls public `GET /api/v1/ngo/?page=...` for admin management.
- `New-JalgaonUI/src/app/admin/ngos/page.tsx:55` calls assumed `PATCH /api/v1/ngo/${id}/verify/`.
- `New-JalgaonUI/src/app/admin/ngos/page.tsx:75` calls `DELETE /api/v1/ngo/${id}/`.

Backend evidence:
- `jalgaonApi/apps/ngo/urls.py` mounts `admin/ngos` and `admin/categories` through DRF router.
- There is no `ngo/<id>/verify/` URL in the route map.
- Public NGO detail is slug-based: `path('<slug:slug>/')`.

Impact:
- NGO admin verification and delete actions will fail or hit the wrong route.
- Admin page may only show verified public NGOs, not the full moderation queue.

Implementation needed:
- Use `/api/v1/ngo/admin/ngos/` for admin list/create/update/delete.
- If verification should be a one-click action, either add a backend action such as `/api/v1/ngo/admin/ngos/{id}/verify/` or PATCH an existing editable status/verification field if supported by serializer.
- Add admin category management coverage if needed through `/api/v1/ngo/admin/categories/`.

### 3. Footer links point to missing or placeholder pages

Evidence:
- `New-JalgaonUI/src/components/Footer.tsx:45` links to `/directory`, but only `/directory/[slug]` exists. The directory listing lives through `/search` or `/category/[slug]`.
- `New-JalgaonUI/src/components/Footer.tsx:55` links Help Center to `/`.
- `New-JalgaonUI/src/components/Footer.tsx:56` links Contact Us to `/`.

Impact:
- Users clicking footer navigation are sent to the wrong screen or a 404/missing route.

Implementation needed:
- Add `src/app/directory/page.tsx` or change the footer link to `/search`.
- Add real `/contact` and `/help` pages or remove/change those footer links.
- Recheck sitemap and nav after deciding the canonical directory route.

### 4. Contact form is simulated only

Evidence:
- `New-JalgaonUI/src/components/ContactForm.tsx:11` says: `Simulate API call since no endpoint exists yet`.
- No mounted backend contact-message API was found.

Impact:
- Users see a success message, but no message reaches admins.

Implementation needed:
- Frontend-only option: mark it clearly as unavailable or wire to mailto/WhatsApp.
- Full implementation: add backend contact API, admin inbox/moderation page, and POST the form to it.

### 5. Forgot password page is UI-only

Evidence:
- `New-JalgaonUI/src/app/forgot-password/page.tsx:17` says: `Simulate API request (UI only as requested)`.
- Backend auth URLs include register/login/logout/token/user/csrf only; no forgot/reset password route is mounted.

Impact:
- Users cannot recover accounts from the current frontend.

Implementation needed:
- Add backend password reset endpoints, token generation, SMS/email delivery strategy, and frontend submit/reset pages.
- If phone number is the real identity field, the UI should not ask only for email.

## Priority 2 - Static frontend pages that should become dynamic

### 6. Public NGO page uses local JSON instead of backend API

Evidence:
- `New-JalgaonUI/src/app/ngo/NgoClient.tsx:5` imports `ngo_data.json`.
- `New-JalgaonUI/src/app/ngo/NgoClient.tsx:35` sets static NGO data.
- Backend has public NGO list/detail/categories APIs.

Impact:
- Submitted and approved NGOs do not automatically appear on the public NGO page.
- Search/category filters are client-only over stale JSON.

Implementation needed:
- Replace JSON import with `GET /api/v1/ngo/` and `GET /api/v1/ngo/categories/`.
- Add detail page if the design expects individual NGO profiles.

### 7. Tourism page is static and backend tourism is not mounted

Evidence:
- `New-JalgaonUI/src/app/tourism/page.tsx` renders hardcoded tourism content.
- `New-JalgaonUI/src/components/TouristPlacesList.tsx` contains a large inline `touristPlaces` array, including invalid `nan` placeholders.
- `jalgaonApi/apps/tourism` exists in installed apps, but `jalgaonApi/jalgaonApi/urls.py` does not mount `/api/v1/tourism/`.

Impact:
- Tourism content cannot be managed from backend/admin.
- Some data quality issues are hidden in the frontend array.

Implementation needed:
- Decide whether tourism is content-managed or static editorial.
- If dynamic, mount tourism APIs and replace hardcoded arrays with API calls.
- Remove invalid `nan` source entries either way.

### 8. Mock Next API routes remain in the frontend

Evidence:
- `New-JalgaonUI/src/app/api/businesses/route.ts:20` defines `mockListings`.
- `New-JalgaonUI/src/app/api/businesses/route.ts:91` filters mock listings.
- `New-JalgaonUI/src/app/api/businesses/[id]/route.ts` returns mock detail fallback.

Impact:
- These routes can confuse future work because real business data already comes from Django listing APIs.

Implementation needed:
- Delete these mock route handlers if unused.
- Or convert them into proxy route handlers for Django `/api/v1/listings/` if the frontend wants a Next API facade.

## Priority 3 - Feature completeness gaps

### 9. Business profile map is only a placeholder

Evidence:
- `New-JalgaonUI/src/components/BusinessProfile.tsx:567` renders `Map view coming soon`.
- The direction link always goes to generic `https://maps.google.com`.

Impact:
- Business detail pages do not provide location-specific navigation.

Implementation needed:
- Use listing map URL, latitude/longitude, or address to build a real Google Maps direction link.
- If coordinates exist, render the existing Leaflet map picker/viewer pattern in read-only mode.

### 10. Auth/session handling still needs hardening

Evidence:
- Auth exists and pages read `localStorage` tokens, but many pages individually call `localStorage.getItem("token")`.
- Some request paths check `res.ok`; others parse JSON without checking HTTP status.

Impact:
- Expired sessions can produce confusing empty states or partial failures.
- Auth refresh behavior is inconsistent across forms and admin pages.

Implementation needed:
- Centralize frontend API client behavior in `New-JalgaonUI`: attach bearer token, refresh token on 401, persist rotated refresh token, and normalize errors.
- Replace one-off fetch blocks gradually in account/admin/forms.

### 11. Account settings profile update may not be backed by a real update API

Evidence:
- `New-JalgaonUI/src/app/account/settings/page.tsx` GETs and PATCHes `/api/v1/auth/user/`.
- Backend route map shows only `path('user/', UserView.as_view())`; verify whether `UserView` supports PATCH before treating this as complete.

Impact:
- Profile form may appear editable while backend may only support read.

Implementation needed:
- Confirm `UserView` methods.
- If missing, add backend PATCH or point frontend to the correct profile update route.

### 12. Admin CRUD is broad but not complete

Already present:
- Listings, users, categories, claims, reports, moderation, ads, analytics, news, blog, jobs, events, clubs, startups pages exist.

Remaining gaps to verify/finish:
- Add/edit screens are missing for some admin resources that only support list/delete/status actions.
- Several admin pages do not check `res.ok` before treating an action as successful.
- NGO admin is currently broken as noted above.
- Role gating in admin navigation/layout should be checked against backend permission classes for each domain.

## Backend-dependent frontend work

These items cannot be fully implemented in frontend alone unless backend routes are added or confirmed:

| Feature | Current status | Needed backend/API |
| --- | --- | --- |
| Contact form | Simulated success only | Contact-message create endpoint and admin inbox |
| Forgot/reset password | Simulated success only | Password reset request/confirm endpoints and delivery |
| Tourism CMS | Static frontend | Mounted tourism public/admin APIs |
| NGO verification button | Calls non-existent assumed route | Verified/status admin action or writable admin field |
| Donations/payments | No clear frontend flow | Payment/donation APIs and provider integration |
| Language switcher/i18n | Not implemented | Can be frontend-only, but content strategy needed |

## Suggested implementation order

1. Fix `BusinessProfile.tsx` JSX compile error and rerun TypeScript/build.
2. Fix NGO admin API paths and remove assumed `/verify/` route usage.
3. Add/fix missing routes linked by footer: `/directory`, `/contact`, `/help`.
4. Replace public NGO JSON with backend data.
5. Decide backend scope for contact and forgot-password; then wire the forms honestly.
6. Clean up mock `/api/businesses` route handlers.
7. Upgrade business detail map/directions.
8. Centralize Next frontend API client and token refresh handling.
9. Convert tourism to dynamic only if the product requires admin-managed tourism content.

## Current connected areas

The following areas are already substantially implemented in the Next frontend and should be refined rather than rebuilt:

- Authentication modal: `New-JalgaonUI/src/components/LoginSignup.tsx`
- Homepage data sections: `New-JalgaonUI/src/app/page.tsx`
- Directory listing/search: `New-JalgaonUI/src/components/BusinessListings.tsx`, `New-JalgaonUI/src/app/search/page.tsx`
- Business detail: `New-JalgaonUI/src/app/directory/[slug]/page.tsx`
- Add/edit listing: `New-JalgaonUI/src/app/add-listing`, `New-JalgaonUI/src/app/edit-listing/[slug]`
- Jobs: `New-JalgaonUI/src/app/jobs`, `New-JalgaonUI/src/app/add-job`, account job pages
- Events: `New-JalgaonUI/src/app/events`, `New-JalgaonUI/src/app/add-event`, admin event pages
- News/blog: public portals, detail pages, comments, and admin pages
- Startups/clubs: public, submit, account, and admin pages
- Ads: advertise form, public ad zones, admin moderation, account analytics
- Notifications and analytics: account/admin pages are present

## Final note

The biggest change from older audit documents is that many features previously marked missing are now present. This audit is based on current source files and the current backend route map, so the main remaining work is no longer "build the frontend from scratch"; it is fixing broken contracts, removing stale mock/static islands, and hardening the connected flows.
