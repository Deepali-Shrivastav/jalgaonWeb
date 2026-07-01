# Jalgaon.com — SEO Strategy

> **Source:** PRD v1.0 | **Purpose:** Complete SEO implementation plan — technical, on-page, local, and structured data

---

## 1. Technical SEO

### 1.1 Rendering Strategy

| Page Type | Rendering | Revalidation | Caching |
|-----------|-----------|-------------|---------|
| Homepage | SSR (Server-Side Rendering) | Real-time | CDN 5 min |
| Business Profile | ISR (Incremental Static Regen) | On change / 1 hour | CDN |
| Category Pages | ISR | On change / 1 hour | CDN |
| News Articles | SSR | Real-time | CDN 15 min |
| Blog Posts | ISR | On change / 1 hour | CDN |
| Job Listings | SSR | Real-time | CDN 5 min |
| Event Pages | SSR | Real-time | CDN 5 min |
| Static/CMS Pages | SSG (Static Site Gen) | On deploy | CDN long |

### 1.2 URL Architecture

| Page | URL Pattern | Example |
|------|-------------|---------|
| Homepage | `/` | `jalgaon.com/` |
| Category | `/business/{city}/{category}` | `/business/jalgaon/healthcare` |
| Subcategory | `/business/{city}/{category}/{subcategory}` | `/business/jalgaon/healthcare/hospitals` |
| Business Profile | `/business/{city}/{category}/{slug}` | `/business/jalgaon/healthcare/city-hospital-jalgaon` |
| News Index | `/news` | `/news` |
| News Article | `/news/{slug}` | `/news/jalgaon-monsoon-festival-2026` |
| Blog Index | `/blog` | `/blog` |
| Blog Post | `/blog/{slug}` | `/blog/best-restaurants-jalgaon` |
| Job Index | `/jobs` | `/jobs` |
| Job Detail | `/jobs/{slug}` | `/jobs/software-developer-simplesphere` |
| Events Index | `/events` | `/events` |
| Event Detail | `/events/{slug}` | `/events/diwali-mela-jalgaon-2026` |
| Tourist Place | `/tourist-places/{slug}` | `/tourist-places/ajanta-caves` |
| NGO | `/ngo/{slug}` | `/ngo/jalgaon-welfare-foundation` |

### 1.3 Meta Tags Implementation

Every page must have via `generateMetadata()` in Next.js:

```
- <title> — Unique, descriptive, 50-60 characters
- <meta name="description"> — Compelling, 150-160 characters
- <link rel="canonical"> — Canonical URL
- <meta property="og:title"> — Open Graph title
- <meta property="og:description"> — OG description
- <meta property="og:image"> — OG image (1200x630px)
- <meta property="og:type"> — website/article/place
- <meta property="og:url"> — Page URL
- <meta name="twitter:card"> — summary_large_image
- <meta name="twitter:title"> — Twitter title
- <meta name="twitter:description"> — Twitter description
- <meta name="robots"> — index,follow (or noindex for admin)
```

### 1.4 Crawling & Indexing

| Item | Implementation |
|------|---------------|
| **sitemap.xml** | Auto-generated, includes all public URLs, submitted to Google Search Console |
| **robots.txt** | Allow all content pages; block `/admin/`, `/api/`, `/dashboard/` |
| **301 Redirects** | Old URL structures → new SEO-friendly URLs |
| **Canonical URLs** | Set on every page to prevent duplicate content |
| **Pagination** | `rel="next"` and `rel="prev"` on paginated listings |
| **Hreflang** | Not needed initially (single language: English) |

### 1.5 Performance (Core Web Vitals)

| Metric | Target | Strategy |
|--------|--------|----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | ISR caching, next/image optimization, CDN |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Fixed image dimensions, font-display: swap |
| **INP** (Interaction to Next Paint) | < 200ms | Code splitting, React 18 concurrent features |
| **TTFB** (Time to First Byte) | < 800ms | SSR optimization, edge caching |

**Frontend Optimizations:**
- `next/image` with automatic WebP conversion and srcSet
- Route-level code splitting — each page bundle < 150KB gzipped
- `next/font` with preload and `font-display: swap`
- Critical CSS inlined; non-critical lazy-loaded
- Intersection Observer for below-fold lazy loading

---

## 2. Schema.org Structured Data (JSON-LD)

### 2.1 Schema Types by Page

| Schema Type | Pages Applied | Key Properties |
|-------------|---------------|----------------|
| **LocalBusiness** | Every business profile | name, address, hours, rating, phone, geo, image, priceRange |
| **NewsArticle** | Every news article | headline, author, datePublished, image, publisher, articleBody |
| **BlogPosting** | Every blog post | author, datePublished, mainEntityOfPage, keywords, description |
| **Event** | Every event page | name, startDate, endDate, location, organizer, image |
| **JobPosting** | Every job listing | title, datePosted, validThrough, salary, employmentType, hiringOrganization |
| **BreadcrumbList** | All content pages | Hierarchical navigation path |
| **Organization** | Homepage & About | org name, logo, social profiles, contact |
| **FAQPage** | Category/City pages | Common questions for featured snippets |
| **WebSite** | Homepage | Search action for sitelinks searchbox |

### 2.2 LocalBusiness Schema Example

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "City Hospital Jalgaon",
  "description": "Multi-specialty hospital in Jalgaon...",
  "image": "https://jalgaon.com/images/city-hospital.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "MG Road",
    "addressLocality": "Jalgaon",
    "addressRegion": "Maharashtra",
    "postalCode": "425001",
    "addressCountry": "IN"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 21.0077, "longitude": 75.5626 },
  "telephone": "+91-9876543210",
  "openingHoursSpecification": [...],
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.2", "reviewCount": "128" },
  "url": "https://jalgaon.com/business/jalgaon/healthcare/city-hospital-jalgaon"
}
```

---

## 3. Local SEO Strategy

### 3.1 Priority Keywords

| Target Keyword | Search Volume (Est.) | Target Page | Competition |
|---------------|---------------------|-------------|-------------|
| Hospitals in Jalgaon | High | Category + profiles | Medium |
| IT companies in Jalgaon | Medium | Category + profiles | Low |
| Restaurants in Jalgaon | High | Category + profiles | Medium |
| Schools in Jalgaon | High | Category + profiles | Medium |
| Events in Jalgaon | Medium | Events index | Low |
| Jobs in Jalgaon | High | Job portal index | Medium |
| Tourist places in Jalgaon | Medium | Tourist places index | Low |
| Real estate agents Jalgaon | Medium | Category page | Medium |
| Best hotels in Jalgaon | Medium | Hospitality category | Medium |
| SimpleSphere Technologies | Low | Company profile | Low |

### 3.2 Content SEO Strategy

| Content Type | Frequency | Purpose |
|-------------|-----------|---------|
| Blog Posts | 2–3 per week | Long-tail keyword targeting, internal linking |
| City Guides | Monthly | "Best X in Jalgaon" comprehensive guides |
| News Articles | Daily | Fresh content signal, local relevance |
| FAQ Pages | Per category | Featured snippet targeting |
| Landing Pages | Per category/subcategory | Category keyword targeting |

### 3.3 On-Page SEO Checklist

- [x] Unique `<title>` tag per page (50–60 chars)
- [x] Unique meta description per page (150–160 chars)
- [x] Single `<h1>` per page with primary keyword
- [x] Heading hierarchy (H1 → H2 → H3) for content structure
- [x] Image `alt` text mandatory on all listing photos
- [x] Internal linking between related listings/categories
- [x] Breadcrumbs with BreadcrumbList schema
- [x] SEO-friendly URL slugs (lowercase, hyphens, no special chars)
- [x] Lazy loading for below-fold images
- [x] Mobile-first responsive design

---

## 4. SEO Admin Tools

The Admin Dashboard includes an SEO Manager module:

| Feature | Description |
|---------|-------------|
| Meta Editor | Edit meta title, description per page |
| Slug Editor | Customize URL slugs for any content |
| Canonical URL Manager | Set/override canonical URLs |
| Robots Directives | Per-page index/noindex, follow/nofollow |
| Sitemap Manager | View auto-generated sitemap, force regeneration |
| Redirect Manager | Create/manage 301 redirects |
| Schema Validator | Preview JSON-LD output per page |
| Google Search Console | Integration for indexing status and errors |

---

## 5. SEO Monitoring & KPIs

| Metric | Tool | Target |
|--------|------|--------|
| Page 1 Rankings | Google Search Console | 500+ keywords in 9 months |
| Organic Traffic | Google Analytics 4 | 50,000+ MAU in 12 months |
| Core Web Vitals | Lighthouse CI | All "Good" thresholds |
| Indexed Pages | Search Console | 100% public pages indexed |
| Rich Results | Rich Results Test | All schema validated |
| Mobile Usability | Search Console | Zero errors |
| Lighthouse Score | Lighthouse CI | > 85 mobile performance |

---

## 6. SEO Implementation Timeline

| Phase | Tasks | Timeline |
|-------|-------|----------|
| Phase 1 | Sitemap, robots.txt, meta tags, canonical URLs, basic schema | Month 1–2 |
| Phase 2 | LocalBusiness schema, breadcrumbs, image optimization | Month 3–4 |
| Phase 3 | News/Blog/Job/Event schema, FAQ pages, AMP | Month 5–6 |
| Phase 4 | Advanced analytics, A/B testing, content strategy scale | Month 7+ |

---

*Document Version: 1.0 | Derived from Jalgaon.com PRD v1.0*
