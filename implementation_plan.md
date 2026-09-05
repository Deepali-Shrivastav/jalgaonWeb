# YouTube Video Section — Implementation Plan for Jalgaon.com

> **Based on deep analysis of the actual codebase.** No assumptions. Every decision traces back to what was found in the project.

> [!NOTE]
> **All decisions confirmed. Ready to implement.** Channel ID to be provided when coding begins.

---

## 1. Current Architecture Analysis

### Backend (Django)
- **Framework**: Django 5.0.7 + Django REST Framework 3.15.2
- **Auth**: JWT via `djangorestframework-simplejwt`. Public endpoints use `AllowAny`, protected use `IsAuthenticated`.
- **URL routing**: All API routes live under `/api/v1/<app>/` via `include()` in `jalgaonApi/urls.py`. Every feature has its own Django app under `jalgaonApi/apps/`.
- **Pattern**: Every app follows → `models.py` → `serializers.py` → `views.py` → `urls.py`. Views use `generics.ListAPIView`, `generics.RetrieveAPIView`, and `viewsets.ModelViewSet`.
- **Permissions**: `core/permissions.py` defines `IsNewsEditor`, `IsContentManager`, `IsAdminRole`, etc.
- **Logging**: `logging.getLogger(__name__)` used in views.
- **Caching**: ❌ **No caching layer exists.** No Redis, no Django `CACHES` setting. The Next.js `api/dashboard/route.ts` uses a manual JS in-memory dict (`marketCache`), but Django itself uses the default `DummyCache` (no-op).
- **Database**: PostgreSQL in production, SQLite via `USE_SQLITE` env var.
- **Environment**: `.env` loaded via `python-dotenv`. Third-party keys like `FAST2SMS_API_KEY` are stored in `.env` and loaded via `os.getenv()`.
- **External HTTP**: `requests==2.32.3` is already installed.
- **Server**: Ubuntu → Nginx → Gunicorn (Unix socket) → Django. Architecture: `CloudFront → Lightsail (Nginx → Gunicorn)`.

### Frontend (Next.js)
- **Framework**: Next.js 16.2.9, React 19, TypeScript 5.
- **Styling**: Tailwind CSS v4. Custom design system in `globals.css` via `@theme {}`. Primary: `#0081C7`. Font: `Plus Jakarta Sans`.
- **API fetching — two coexisting patterns**:
  1. **Server Components** (`page.tsx`): `fetch()` with `{ next: { revalidate: N } }` for ISR.
  2. **Client Components** (`LatestNews.tsx`): `useState` + `useEffect` + `fetch()`.
- **Page structure**: `page.tsx` (Server Component — metadata + JSON-LD) + `*Portal.tsx` / `*Client.tsx` (Client Component — state/fetch/UI).
- **Env**: `NEXT_PUBLIC_API_URL` is the only Django-pointing env var. Secret-only vars (`ALPHA_VANTAGE_API_KEY`, `WEATHERAPI_KEY`) live WITHOUT `NEXT_PUBLIC_` prefix in `.env.production` on the server — never sent to the browser.
- **Next.js API Routes**: `/api/businesses/` (mock) and `/api/dashboard/` (real Alpha Vantage + Weather calls). Dashboard route uses server-only env vars and a manual in-memory JS cache.
- **SEO**: `generateMetadata()`, JSON-LD, Open Graph, Twitter cards, `sitemap.ts` (dynamic, fetches from Django), `robots.ts`.
- **Reusable components**: `SkeletonCard`, `Pagination`, `Header`, `Footer`, `CarouselAds`. All sections use loading/error/data pattern.
- **Header nav**: `[Home, News, Events, Blog, Jobs, Startups]`. No "Videos" link yet.

### Infrastructure
- Production: Nginx on AWS Lightsail behind CloudFront CDN.
- Services: `gunicorn_jalgaon.service` + `nextjs_jalgaon.service`.
- Next.js secrets: `EnvironmentFile=/home/ubuntu/jalgaonWeb/New-JalgaonUI/.env.production` in systemd — not committed to git.

---

## 2. Existing Relevant Files / Components

| File | Relevance |
|------|-----------|
| `jalgaonApi/jalgaonApi/urls.py` | Root URL config — add `path('api/v1/youtube/', ...)` |
| `jalgaonApi/jalgaonApi/settings.py` | Add `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`, `CACHES` |
| `jalgaonApi/.env` / `.env.example` | YouTube key goes here (backend env) |
| `New-JalgaonUI/src/app/news/page.tsx` | Template for videos page structure (metadata + JSON-LD) |
| `New-JalgaonUI/src/app/news/[slug]/page.tsx` | Template for video detail page |
| `New-JalgaonUI/src/components/SkeletonCard.tsx` | Reusable loading skeleton — reuse for video cards |
| `New-JalgaonUI/src/components/Pagination.tsx` | Reusable pagination — reuse for videos list |
| `New-JalgaonUI/src/components/Header.tsx` | Add "Videos" nav link |
| `New-JalgaonUI/src/components/Footer.tsx` | Add "Videos" in Explore column |
| `src/components/HomeClient.tsx` | Import and render `<JalgaonGlimpse />` BEFORE `<TrendingListings />` |
| `New-JalgaonUI/src/app/page.tsx` | Home server component — fetch latest videos |
| `New-JalgaonUI/src/app/sitemap.ts` | Add `/videos` and `/videos/[id]` entries |
| `New-JalgaonUI/src/app/robots.ts` | No changes needed |
| `New-JalgaonUI/.env.production` | No YouTube key here (key is backend-only) |
| `deploy/systemd/nextjs_jalgaon.service` | Already loads `.env.production` — no change needed |
| `deploy/nginx/jalgaon-api.conf` | No changes needed |

---

## 3. Recommended YouTube Integration Architecture

```
YouTube Data API v3
        ↓  (HTTPS, server-to-server — API key never leaves the server)
Django Backend  →  new apps/youtube app
  - YouTubeService class (fetches from YouTube API)
  - Django LocMemCache (30-minute TTL)
  - Views: ListAPIView, RetrieveAPIView
  - URL: /api/v1/youtube/
        ↓  (via NEXT_PUBLIC_API_URL → api.jalgaon.com)
Next.js Frontend
  - /videos page (listing)
  - /videos/[id] page (detail + embed)
  - JalgaonGlimpse (homepage widget)
        ↓
www.jalgaon.com/videos
```

**Key architectural decisions — driven by the actual codebase:**

1. **YouTube API key lives in Django.** Django already handles all third-party API keys (`FAST2SMS_API_KEY`). The YouTube API key must NEVER reach the browser.
2. **No Redis.** The project has no Redis. Django `LocMemCache` is the correct choice — zero new dependencies, built into Django.
3. **New `apps/youtube` Django app.** Consistent with the project's one-app-per-domain-feature pattern.
4. **No database model.** YouTube hosts the videos. We cache API responses. No migrations, no sync jobs, no stale data problems.
5. **No AWS S3/CloudFront for videos.** YouTube hosts the videos. AWS is not needed for this feature.

---

## 4. Data Flow Diagram

```
USER BROWSER
    |
    | GET /videos
    ↓
NEXT.JS SERVER COMPONENT (page.tsx)
    |
    | fetch(`${NEXT_PUBLIC_API_URL}/api/v1/youtube/videos/`)
    | { next: { revalidate: 1800 } }   ← Next.js ISR (30-minute page cache)
    ↓
DJANGO VIEW (YouTubeVideoListView)
    |
    | Check Django LocMemCache
    | ├─ HIT  → return cached JSON (zero YouTube API quota used)
    | └─ MISS → call YouTubeService.fetch_channel_videos()
    |                |
    |                | HTTPS GET googleapis.com/youtube/v3/search
    |                | ?key=YOUTUBE_API_KEY  ← server env var, never in browser
    |                | &channelId=YOUTUBE_CHANNEL_ID
    |                | &part=snippet&type=video&order=date&maxResults=12
    |                ↓
    |            YouTube Data API v3
    |                ↓
    |         YouTubeService normalizes response → standard dict
    |         Store in LocMemCache (TTL: 30 minutes)
    ↓
DJANGO SERIALIZER (YouTubeVideoSerializer)
    ↓  { results: [...], next_page_token, count }
NEXT.JS SERVER COMPONENT → passes as props
    ↓
NEXT.JS CLIENT COMPONENT (VideosPortal.tsx)
    ↓
USER SEES video grid (thumbnails, titles, dates, links)
```

---

## 5. API Flow

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `GET /api/v1/youtube/videos/` | GET | AllowAny | All videos incl. Shorts (paginated, cached, sorted by date) |
| `GET /api/v1/youtube/videos/<video_id>/` | GET | AllowAny | Single video metadata |
| `GET /api/v1/youtube/channel/` | GET | AllowAny | Channel info (title, subscribers) |

> [!NOTE]
> The separate `/api/v1/youtube/shorts/` endpoint is **removed** (Shorts appear in the main grid). The `is_short` flag is still included in every video response so the frontend can render the `#Shorts` badge.

**Query parameters for list endpoints:**
- `?page_token=<token>` — YouTube cursor-based pagination
- `?max_results=12` — results per page (default 12, max 50)

**Response structure** (following existing DRF convention):
```json
{
  "count": 50,
  "next_page_token": "CAUQAA",
  "prev_page_token": null,
  "results": [
    {
      "video_id": "dQw4w9WgXcQ",
      "title": "Jalgaon City Tour 2024",
      "description": "Explore the beauty of Jalgaon...",
      "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      "published_at": "2024-10-24T10:00:00Z",
      "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "embed_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "duration": "PT5M30S",
      "view_count": "12500",
      "is_short": false
    }
  ]
}
```

---

## 6. Where the YouTube API Key Will Be Stored

| Location | How | Exposed to browser? |
|----------|-----|---------------------|
| `jalgaonApi/.env` | `YOUTUBE_API_KEY=AIza...` | ❌ Never |
| `jalgaonApi/jalgaonApi/settings.py` | `YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')` | ❌ Never |
| Production server | `/home/ubuntu/jalgaonWeb/jalgaonApi/.env` (not in git) | ❌ Never |

`YOUTUBE_CHANNEL_ID` is also stored in `.env` — not hardcoded in source.

The YouTube API key is used **only** inside `apps/youtube/services.py` in Django. The Next.js frontend never receives it. The frontend only knows `NEXT_PUBLIC_API_URL` (your own Django API).

---

## 7. Backend Implementation Plan

### New Django App: `jalgaonApi/apps/youtube/`

#### `apps/youtube/apps.py`
Registers the app as `'apps.youtube'` — same pattern as every other app.

#### `apps/youtube/services.py` ← Core logic
A `YouTubeService` class responsible for all YouTube API communication.

**Methods:**
- `fetch_channel_videos(page_token=None, max_results=12)` — calls `search.list` with `type=video`, `order=date`. After getting results, calls `videos.list?part=contentDetails` in a single batch request to get durations and detect Shorts (≤ 60 s → `is_short=True`).
- `fetch_channel_info()` — calls `channels.list` for snippet + statistics
- `fetch_video_detail(video_id)` — calls `videos.list` for full metadata

> [!NOTE]
> The separate `fetch_shorts()` method is removed. Shorts detection is done inside `fetch_channel_videos()` via a single extra `videos.list` batch call (cost: 1 quota unit for the whole batch, not per video). All videos — Shorts or not — are returned together, sorted by date. The `is_short` flag is set on each item.

**YouTube API endpoints used:**
- `GET https://www.googleapis.com/youtube/v3/search` — for listings
- `GET https://www.googleapis.com/youtube/v3/videos` — for detail/duration
- `GET https://www.googleapis.com/youtube/v3/channels` — for channel info

**Shorts detection:** YouTube Shorts are videos ≤ 60 seconds. After `search.list`, call `videos.list?part=contentDetails` to get ISO 8601 durations, parse with regex (no new package needed), and flag `is_short=True`.

**Custom exceptions:**
- `YouTubeServiceError('timeout')` — on `requests.exceptions.Timeout`
- `YouTubeServiceError('connection')` — on `requests.exceptions.ConnectionError`
- `YouTubeQuotaError` — when YouTube returns `{"error": {"code": 403}}`

#### `apps/youtube/cache.py`
Uses Django's built-in `django.core.cache.cache`.

```python
CACHE_KEY_VIDEOS  = 'youtube_videos_{page_token}_{max_results}'
CACHE_KEY_CHANNEL = 'youtube_channel_info'
CACHE_KEY_VIDEO   = 'youtube_video_{video_id}'
CACHE_TIMEOUT_VIDEOS  = 30 * 60             # 30 minutes
CACHE_TIMEOUT_CHANNEL = 24 * 60 * 60        # 24 hours
CACHE_TIMEOUT_VIDEO   = 30 * 60             # 30 minutes
```

#### `apps/youtube/serializers.py`
Pure `serializers.Serializer` — no model backing (data is not stored in the database):

```python
class YouTubeVideoSerializer(serializers.Serializer):
    video_id    = serializers.CharField()
    title       = serializers.CharField()
    description = serializers.CharField()
    thumbnail_url = serializers.URLField()
    published_at  = serializers.DateTimeField()
    youtube_url   = serializers.URLField()
    embed_url     = serializers.URLField()
    duration      = serializers.CharField()
    view_count    = serializers.CharField()
    is_short      = serializers.BooleanField()
```

#### `apps/youtube/views.py`
Exact same pattern as `apps/news/views.py` and `apps/clubs/views.py`:

```python
class YouTubeVideoListView(generics.ListAPIView):   permission_classes = [AllowAny]
class YouTubeVideoDetailView(APIView):              permission_classes = [AllowAny]
class YouTubeChannelInfoView(APIView):              permission_classes = [AllowAny]
```

**Error responses** (consistent with existing project style):
```python
# Quota exceeded:
return Response({"error": "YouTube API quota exceeded. Please try again later."}, status=503)
# Timeout:
return Response({"error": "Could not reach YouTube at this time."}, status=503)
# Missing API key:
return Response({"error": "YouTube integration not configured."}, status=503)
```

#### `apps/youtube/urls.py`
```python
urlpatterns = [
    path('videos/', YouTubeVideoListView.as_view(), name='youtube-videos'),
    path('videos/<str:video_id>/', YouTubeVideoDetailView.as_view(), name='youtube-video-detail'),
    path('channel/', YouTubeChannelInfoView.as_view(), name='youtube-channel'),
]
```

---

## 8. Frontend Implementation Plan

### Page structure mirrors `/news` exactly:

```
src/app/videos/
├── page.tsx              ← Server Component: metadata + JSON-LD + 30-min ISR fetch
├── VideosPortal.tsx      ← Client Component: grid, pagination, fetch
└── [id]/
    ├── page.tsx          ← Server Component: video detail metadata + VideoObject schema
    └── VideoDetailClient.tsx  ← Client Component: embed + info
```

```
src/components/
└── JalgaonGlimpse.tsx   ← Homepage section ("Jalgaon Glimpse", 4 videos, before TrendingListings)
```

### `src/app/videos/page.tsx`
- `export const metadata` with title, description, OG tags, canonical `/videos`
- JSON-LD: `CollectionPage` schema
- `fetch(`${apiUrl}/api/v1/youtube/videos/`, { next: { revalidate: 1800 } })`
- Renders `<Header />`, `<VideosPortal initialData={videos} />`, `<Footer />`

### `src/app/videos/VideosPortal.tsx`
- `'use client'`
- Grid: 3 cols desktop, 2 tablet, 1 mobile
- Video card: thumbnail with red play-button overlay, title, published date, `#Shorts` badge, link to `/videos/[id]`
- Pagination: reuses existing `<Pagination />`
- Loading: `<SkeletonCard />` × 6
- Error: same red block + `material-symbols-outlined error` icon pattern as existing portals

### `src/app/videos/[id]/page.tsx`
- `generateMetadata()`: fetches video from Django
- JSON-LD: full `VideoObject` schema + `BreadcrumbList`

### `src/app/videos/[id]/VideoDetailClient.tsx`
- `'use client'`
- Fetches from `/api/v1/youtube/videos/<id>/`
- Embedded player: `<iframe>` with `rel=0&modestbranding=1`

### `src/components/JalgaonGlimpse.tsx` ← **Homepage section**
- Section heading: **"Jalgaon Glimpse"** with subtitle "Watch Jalgaon"
- Accepts `initialData?: YouTubeVideo[]` prop (4 videos)
- Shows 4 videos in a horizontal row
- "View All Videos →" link to `/videos`

---

## 9. Database Changes

**None required.** No model, no migration.

---

## 10. Caching Strategy

### The problem
Django `settings.py` has no `CACHES` setting → default `DummyCache` is active.

### Solution: Django LocMemCache (zero new packages)
Add to `settings.py`:
```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'jalgaon-youtube-cache',
    }
}
```

---

## 11. API Quota Strategy

YouTube Data API v3 free quota: **10,000 units/day**

| Operation | Cost per call |
;|-----------|--------------|
| `search.list` | 100 units |
| `videos.list` (duration batch) | 1 unit |
| `channels.list` | 1 unit |

1. **30-minute Cache** — Limits API calls to ~48/day (4,800 units) for the list view, comfortably under the 10,000/day limit.
2. **Next.js ISR** — Set to `1800s` (30 minutes) to offload the Django server.
3. **`max_results` cap** — Default 12, maximum 50. Never exceed 50 per call.
4. **Quota exceeded handling** — When the service gets a `403` from YouTube, the view returns the last cached data even if stale with a `X-Cache-Stale: true` response header. If no stale data exists, returns graceful 503.

---

## 12. Security Strategy

| Concern | Solution |
|---------|---------|
| API key reaches browser | Never. Key is in `jalgaonApi/.env`. Never in any response body. |
| API key committed to git | `jalgaonApi/.gitignore` already excludes `.env`. |
| Google Cloud Console restriction | HTTP referrers restriction: `api.jalgaon.com/*`. |
| SSRF via `video_id` param | Regex validation `^[a-zA-Z0-9_-]{11}$`. |

---

## 13. Step-by-Step Implementation Order

### Phase 1 — Backend Foundation
1. Add `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`, `CACHES` to `settings.py`
2. Add keys to `.env` (locally) and `.env.example`
3. Create `apps/youtube/`
4. Write `apps/youtube/services.py` (`YouTubeService` with `fetch_channel_videos`)
5. Write `apps/youtube/cache.py`
6. Write `apps/youtube/serializers.py`
7. Write `apps/youtube/views.py` — `YouTubeVideoListView`, `YouTubeChannelInfoView`
8. Write `apps/youtube/urls.py`
9. Register in `jalgaonApi/urls.py`
10. ✅ Test: `curl http://localhost:8000/api/v1/youtube/videos/`

### Phase 2 — Video Detail
11. Add `videos.list?part=contentDetails` batch call for duration parsing
12. Add `fetch_video_detail()` to `YouTubeService`
13. Add `YouTubeVideoDetailView` to views + urls
14. ✅ Test: `curl http://localhost:8000/api/v1/youtube/videos/VIDEO_ID/`

### Phase 3 — Frontend Videos Page
15. Create `src/types/youtube.ts`
16. Create `src/app/videos/page.tsx` (server component, 30-min ISR)
17. Create `src/app/videos/VideosPortal.tsx` (client component, grid with #Shorts)
18. ✅ Test: `localhost:3000/videos`

### Phase 4 — Frontend Video Detail Page
19. Create `src/app/videos/[id]/page.tsx` (generateMetadata, VideoObject schema)
20. Create `src/app/videos/[id]/VideoDetailClient.tsx` (16:9 embed + info)
21. ✅ Test: `localhost:3000/videos/VIDEO_ID`

### Phase 5 — Homepage Section
22. Create `src/components/JalgaonGlimpse.tsx`
23. Modify `src/app/page.tsx` — add YouTube fetch
24. Modify `src/components/HomeClient.tsx` — render `<JalgaonGlimpse />`
25. ✅ Test: homepage shows YouTube section

### Phase 6 — Navigation & SEO
26. Modify `Header.tsx` — add Videos nav link
27. Modify `Footer.tsx` — add Videos footer link
28. Modify `sitemap.ts` — add `/videos` + dynamic entries
29. ✅ Test: `localhost:3000/sitemap.xml`

### Phase 7 — Production Deployment
30. SSH → add keys to `jalgaonApi/.env`
31. `sudo systemctl restart gunicorn_jalgaon`
32. `npm run build`
33. `sudo systemctl restart nextjs_jalgaon`
34. ✅ Test: `https://www.jalgaon.com/videos`

---

## Confirmed Decisions — All Questions Answered

| # | Question | Answer |
|---|----------|--------|
| 1 | YouTube Channel ID | ⏳ To be provided when Phase 1 coding begins |
| 2 | Shorts display | ✅ Same grid as regular videos — `#Shorts` badge on thumbnail |
| 3 | Video detail page | ✅ Embedded YouTube player (16:9 iframe with `rel=0`) |
| 4 | Homepage section name & position | ✅ **"Jalgaon Glimpse"** — placed **before** `TrendingListings` |
| 5 | Homepage video count | ✅ **4 videos** |
| 6 | Cache TTL | ✅ **30 minutes** (`revalidate: 1800` in Next.js, 1800s in Django cache) |
| 7 | Google Cloud Console key restriction | ✅ Already done (key restricted to YouTube Data API v3) |
