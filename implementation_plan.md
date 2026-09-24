# Implementation Plan: Jalgaon.com Homepage Hero Section (Stitch Reference Replica)

This implementation plan details the exact changes needed to update ONLY the target homepage section of **Jalgaon.com** based on the provided Stitch reference design (*Screen ID: 02c5e95f9a6749f79b336acbdecb0e0c*).

---

## Target Section Overview

The section to be updated encompasses the main Hero area of the homepage:
1. **Banner / Advertisement Area**:
   - Left side (8 cols on desktop): Large primary banner carousel with smooth slide transitions, prev/next chevron navigation, and pagination dots.
   - Right side (4 cols on desktop): Two stacked smaller ad banners with hover scale effects.
   - Dynamic API integration (`/api/v1/banners/active/` and `/api/v1/ads/by-slot/`) with fallback defaults preserved.
2. **Search Box Container**:
   - Large centered rounded pill container (`bg-white rounded-full shadow-md border border-slate-200/90`).
   - **Location Selector (Left)**: Location pin icon, city name ("Jalgaon"), chevron dropdown, and city selection menu.
   - **Vertical Divider & Search Icon**.
   - **Animated Search Input / Placeholder**:
     - Automatically types and deletes phrases in an infinite loop:
       1. `"Jalgaon Glimpses"`
       2. `"Automotive"`
       3. `"Agriculture Services"`
       4. `"Construction and Real Estate"`
     - Smooth typing speed (~85ms), hold delay (~1800ms), deletion speed (~45ms), pause between phrases (~300ms), with a blinking cursor indicator (`|`).
     - **Strict Behavior**: Animation is ONLY a placeholder helper. Pauses immediately when user focuses/types, never overwrites user input, never modifies search query value. Resumes when input is empty & unfocused.
   - **Search Button (Right)**: Fully functional search execution via click or Enter key. Preserves existing search API, autocomplete (`/api/v1/search/autocomplete/`), and routing to `/search?q=...`.
3. **Action Buttons Below Search**:
   - **Primary**: `"List Your Business"` (`href="/add-listing"`), styled with primary blue filled pill background (`bg-[#0081c7]`).
   - **Secondary**: `"Explore Categories"` (`href="#explore-categories"` / `/category`), styled with white background and subtle outline border.
4. **Visual & Responsive Styling**:
   - Radial hero background (`hero-radial-bg`).
   - Mobile & tablet responsive adaptations (prevents overflow, wraps/truncates safely on small viewports).

---

## User Review Required

> [!IMPORTANT]
> - Scope is strictly restricted to the Hero section (Banner area, Search box with animated placeholder, and Action buttons). No changes will be made to Header, Footer, API backends, or unrelated homepage sections.
> - Existing dynamic banner endpoints and search backend APIs will remain fully preserved and integrated.

---

## Proposed Changes

### Styling & Theme

#### [MODIFY] [globals.css](file:///d:/simplesphere/jalgaonWeb/New-JalgaonUI/src/app/globals.css)
- Add `.hero-radial-bg` utility class (`background: radial-gradient(circle at 50% 20%, #f0f7ff 0%, #ffffff 70%)`).
- Add blinking cursor animation style `.animate-cursor` for the typewriter search input.

---

### Search Box Component & Typewriter Animation

#### [MODIFY] [SearchBar.tsx](file:///d:/simplesphere/jalgaonWeb/New-JalgaonUI/src/components/SearchBar.tsx)
- Add optional `animatedPlaceholders?: string[]` prop.
- Implement pure React `useEffect` typing & deleting placeholder loop with state cleanup on unmount to prevent memory leaks and hydration mismatches.
- Ensure placeholder typing logic only operates when `query` is empty and input is not actively being typed by user.
- Maintain existing search autocomplete (`/api/v1/search/autocomplete/`), recent search history, keyboard navigation (Arrow keys / Enter / Escape), and search execution.

---

### Promotional Banner Carousel

#### [MODIFY] [BannerCarousel.tsx](file:///d:/simplesphere/jalgaonWeb/New-JalgaonUI/src/components/BannerCarousel.tsx)
- Update layout to match Stitch reference grid:
  - 8-column main banner carousel container on the left with prev/next buttons and pagination dots.
  - 4-column secondary 2-stacked banners on the right.
- Preserve dynamic API banner fetching (`/api/v1/banners/active/`, `/api/v1/ads/by-slot/`) and impression/click tracking endpoints.
- Provide clean fallback banner cards matching the Stitch design when dynamic ads are empty.

---

### Search & Hero Section Composition

#### [MODIFY] [HomeSearchSection.tsx](file:///d:/simplesphere/jalgaonWeb/New-JalgaonUI/src/components/HomeSearchSection.tsx)
- Update container styling to match Stitch design: centered pill search bar with Location selector dropdown, vertical divider, SearchBar with typewriter animation, and Search button.
- Include the two action pill buttons below search: `"List Your Business"` and `"Explore Categories"`.

#### [MODIFY] [Hero.tsx](file:///d:/simplesphere/jalgaonWeb/New-JalgaonUI/src/components/Hero.tsx)
- Encapsulate the Hero section wrapper with radial background (`hero-radial-bg`), uniting the Promotional Banner area, Search Box, and Action Buttons cleanly.

#### [MODIFY] [HomeClient.tsx](file:///d:/simplesphere/jalgaonWeb/New-JalgaonUI/src/components/HomeClient.tsx)
- Update `HomeClient` to render the updated Hero section in proper sequence.

---

## Verification Plan

### Automated Verification
- Verify TypeScript types and Next.js project build (`npm run build` or compilation check in `New-JalgaonUI`).

### Manual Verification
1. **Banner Layout**:
   - Inspect main carousel auto-play and prev/next chevron navigation.
   - Inspect stacked side banners on desktop and stacked responsiveness on mobile.
2. **Animated Search Placeholder**:
   - Verify typewriter phrase cycle: `"Jalgaon Glimpses"` $\rightarrow$ `"Automotive"` $\rightarrow$ `"Agriculture Services"` $\rightarrow$ `"Construction and Real Estate"`.
   - Click input and type a query: verify animation pauses immediately and user text input remains intact without interference.
   - Clear input: verify animation resumes when empty.
3. **Search Execution**:
   - Type query and press Enter / click Search button: verify navigation to `/search?q=...` with entered query.
   - Test location selector dropdown city switching ("Jalgaon", "Bhusawal", etc.).
4. **Action Buttons**:
   - Click `"List Your Business"` (navigates to `/add-listing`).
   - Click `"Explore Categories"` (scrolls to category section).
5. **Responsiveness**:
   - Test layout across Desktop ($>1024\text{px}$), Tablet ($768\text{px}$), and Mobile ($375\text{px}$) viewports.
