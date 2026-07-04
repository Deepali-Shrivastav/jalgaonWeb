# Frontend-Backend Integration Guide

This guide outlines how to fetch data from the Django backend and implement smooth, lag-free UI rendering in Next.js.

---

## 1. Environment & Network Configuration

### A. CORS (Cross-Origin Resource Sharing)
Because your Next.js application runs on a different port than the Django backend, browser security blocks cross-origin requests.
*   **Action for Backend:** Install `django-cors-headers` and configure:
    ```python
    # settings.py
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    ```

### B. Setup Environment Variables
Create or update `d:/jalgaonWeb/New-JalgaonUI/.env.local` to point to the Django API:
```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```
*Note: Prefixing variables with `NEXT_PUBLIC_` exposes them to browser JavaScript.*

---

## 2. Choosing Fetching Strategies

| Scenario | Strategy | Best Tool | Why |
| :--- | :--- | :--- | :--- |
| **SEO-Critical Pages** (Static Blogs, Initial Landing Pages) | **Server Component Fetch** | Next.js Native `fetch()` | Renders HTML on server; best SEO and faster first load. |
| **Highly Interactive Pages** (Search, Paginated Filters, Live Portals) | **Client Component Fetch** | `SWR` or `React Query` | Auto-caching, auto-revalidation, debouncing, and fluid page transitions. |

---

## 3. Data Integration Implementation

### Installing SWR (Recommended client-side fetcher)
```powershell
npm install swr
```

### A. Client-Side Implementation Pattern (Jobs, NGOs, News)
To fetch data in interactive portals with filters:

```tsx
'use client';

import React, { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function JobsPortal() {
  const [selectedType, setSelectedType] = useState('Full-time');
  const [page, setPage] = useState(1);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // SWR automatically handles loading state, caching, and revalidation
  const { data, error, isLoading } = useSWR(
    `${apiBaseUrl}/api/jobs/?type=${selectedType}&page=${page}`,
    fetcher
  );

  if (error) return <div>Failed to load jobs</div>;

  return (
    <div>
      {/* Filters */}
      <button onClick={() => setSelectedType('Full-time')}>Full-time</button>
      
      {/* List container */}
      <div className="grid gap-4">
        {isLoading ? (
          // Render skeleton loaders here
          <p>Loading jobs...</p>
        ) : (
          data?.results?.map((job: any) => (
            <div key={job.id}>
              <h3>{job.title}</h3>
              <p>{job.company}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## 4. Keeping it Lag-Free (Performance Checklist)

### 1. Paginated Endpoints
Ensure your backend engineer returns paginated responses rather than huge monolithic arrays.
*   **Django DRF setup:** Use `LimitOffsetPagination` or `PageNumberPagination`.
*   **Format:**
    ```json
    {
      "count": 142,
      "next": "http://127.0.0.1:8000/api/jobs/?page=2",
      "previous": null,
      "results": [...]
    }
    ```

### 2. Next.js Image Component (`next/image`)
Django Admin media uploads are usually unoptimized. Wrap image rendering in Next.js's `<Image />` tags so they are resized and lazy-loaded automatically:
```tsx
import Image from 'next/image';

<Image
  src={ngo.logo_url}
  alt={ngo.name}
  width={80}
  height={80}
  className="rounded-lg object-contain"
/>
```

### 3. Skeleton Loading States
Use skeleton loader screens instead of blank pages to increase perceived performance. Put a `loading.tsx` file inside route folders (like `src/app/jobs/loading.tsx`) to show initial layouts automatically during server fetches.

### 4. Virtuoso/Virtual Lists
For directories containing thousands of items (e.g. business lists), install `react-window` or `react-virtuoso` to render only elements currently visible on the screen.
