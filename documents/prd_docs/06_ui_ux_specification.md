# Jalgaon.com — UI/UX Specification

> **Source:** PRD v1.0 | **Purpose:** Complete UI/UX design system, layouts, wireframes, and interaction patterns

---

## 1. Design System

### 1.1 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#1A56DB` | Buttons, links, active states, primary actions |
| Primary Hover | `#1648B8` | Button hover states |
| Primary Light | `#E1EFFE` | Backgrounds, badges, selected states |
| Secondary | `#1E3A5F` | Headers, dark backgrounds, nav |
| Accent | `#F59E0B` | CTAs, highlights, trending badges, stars |
| Accent Hover | `#D97706` | Accent hover states |
| Success | `#059669` | "Open Now", success messages, verified badges |
| Success Light | `#D1FAE5` | Success backgrounds |
| Error | `#EF4444` | Error messages, required fields, "Closed" |
| Error Light | `#FEE2E2` | Error backgrounds |
| Warning | `#F59E0B` | Warning messages, pending states |
| Background | `#F9FAFB` | Page background |
| Card BG | `#FFFFFF` | Cards, modals, panels, dropdowns |
| Text Primary | `#111827` | Headings, body text |
| Text Secondary | `#6B7280` | Captions, metadata, placeholders |
| Text Muted | `#9CA3AF` | Disabled text, hints |
| Border | `#E5E7EB` | Card borders, dividers, input borders |

### 1.2 Typography

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| H1 | Inter / Plus Jakarta Sans | 700 (Bold) | 36px | 1.2 |
| H2 | Inter / Plus Jakarta Sans | 700 (Bold) | 30px | 1.25 |
| H3 | Inter / Plus Jakarta Sans | 700 (Bold) | 24px | 1.3 |
| H4 | Inter / Plus Jakarta Sans | 600 (SemiBold) | 20px | 1.35 |
| H5 | Inter / Plus Jakarta Sans | 600 (SemiBold) | 18px | 1.4 |
| H6 | Inter / Plus Jakarta Sans | 600 (SemiBold) | 16px | 1.4 |
| Body | Inter | 400 (Regular) | 16px | 1.6 |
| Body Small | Inter | 400 (Regular) | 14px | 1.5 |
| Caption | Inter | 400 (Regular) | 12px | 1.4 |
| Button | Inter | 600 (SemiBold) | 14px | 1.0 |
| Label | Inter | 500 (Medium) | 12px | 1.0 |

### 1.3 Spacing & Layout

| Token | Value | Usage |
|-------|-------|-------|
| Border Radius SM | 4px | Inputs, pills, small elements |
| Border Radius MD | 6px | Buttons, badges |
| Border Radius LG | 8px | Cards, modals |
| Border Radius XL | 12px | Hero sections, large panels |
| Border Radius Full | 9999px | Avatars, circular elements |
| Shadow SM | `0 1px 3px rgba(0,0,0,0.06)` | Subtle elevation |
| Shadow MD | `0 2px 8px rgba(0,0,0,0.08)` | Cards, dropdowns |
| Shadow LG | `0 8px 24px rgba(0,0,0,0.12)` | Modals, popovers |
| Spacing Unit | 4px | Base unit (4, 8, 12, 16, 20, 24, 32, 40, 48, 64) |

---

## 2. Page Layouts

### 2.1 Homepage Layout

```
┌─────────────────────────────────────────────────────────┐
│ [Logo]  [═══════ Search Bar ═══════]  [Login] [Add Biz] │  ← Sticky Header
├─────────────────────────────────────────────────────────┤
│                                                         │
│        ▓▓▓▓▓▓▓▓▓ HERO SLIDER (3-5 slides) ▓▓▓▓▓▓▓▓▓  │  ← Full-width
│        [Add Your Business]  [Browse Directory]          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  📦 Category Grid (4-col desktop / 2-col mobile)       │
│  [Auto] [Health] [Food] [Edu] [IT] [Real Est] [...]    │
├─────────────────────────────────────────────────────────┤
│  🔥 Trending Listings ──────────── [View All →]        │
│  [Card 1] [Card 2] [Card 3] [Card 4]  ← Horizontal    │
├─────────────────────────────────────────────────────────┤
│  📰 Latest News ────────────────── [View All →]        │
│  [News 1]  [News 2]  [News 3]      ← 3-col grid       │
├─────────────────────────────────────────────────────────┤
│  📅 Upcoming Events ────────────── [View All →]        │
│  [Event 1] [Event 2] [Event 3]     ← Horizontal strip  │
├─────────────────────────────────────────────────────────┤
│  🏖️ Tourist Places ─────────────── [View All →]        │
│  [Place 1] [Place 2] [Place 3] [Place 4]  ← 4-col grid │
├─────────────────────────────────────────────────────────┤
│  💼 Latest Jobs ─────────────────── [View All →]       │
│  [Job 1]  [Job 2]  [Job 3]         ← 3-card strip     │
├─────────────────────────────────────────────────────────┤
│  🏷️ Popular Categories                                 │
│  [Hospitals] [Restaurants] [Schools] [Hotels] [...]     │
├─────────────────────────────────────────────────────────┤
│  🤝 NGO Spotlight                                       │
│  [NGO 1]  [NGO 2]  [NGO 3]                             │
├─────────────────────────────────────────────────────────┤
│  📊 City Stats (Animated Counters)                     │
│  5000+ Businesses │ 200+ Events │ 50+ NGOs │ 30+ Sites │
├─────────────────────────────────────────────────────────┤
│  📧 Newsletter: [Email Input] [Subscribe]               │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
│  [About] [Directory] [News] [Jobs] [Events]             │
│  [Privacy] [Terms] [Contact] [Social Icons]             │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Business Profile Layout

```
┌─────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓ COVER PHOTO (full-width) ▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│   Business Name                    ★★★★☆ (4.2) 128 rev │
│   [Category Badge]  [Verified ✓]                        │
├─────────────────────────────────────────────────────────┤
│ [📞 Call] [💬 WhatsApp] [🌐 Website] [↗ Share] [♡ Save]│  ← Sticky on mobile
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📝 About                                               │
│  Description text... Est. 2015                          │
│  Services: [Tag 1] [Tag 2] [Tag 3]                     │
│                                                         │
│  📸 Photo Gallery (Masonry Grid)                       │
│  [Img1] [Img2] [Img3] [Img4] [Img5] [+5 more]        │
│                                                         │
│  🕐 Business Hours                                     │
│  Mon-Fri: 9AM-6PM  │  Sat: 10AM-4PM  │ Sun: Closed    │
│  [🟢 Open Now]                                         │
│                                                         │
│  📍 Location                                           │
│  ┌──────────── Google Map ────────────┐                │
│  │                                    │                 │
│  └────────────────────────────────────┘                 │
│  [📍 Get Directions]                                   │
│                                                         │
│  📞 Contact Info                                       │
│  Phone | Email | Website | [FB] [IG] [X] [LinkedIn]    │
│                                                         │
│  ⭐ Reviews (128 reviews)                              │
│  [5★ ████████░░ 65%]  [Write a Review]                │
│  [4★ ██████░░░░ 20%]                                  │
│  [Review 1] [Review 2] [Review 3] [Load More]          │
│                                                         │
│  🔗 Related Listings                                   │
│  [Similar 1] [Similar 2] [Similar 3]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Category/Search Results Layout

```
┌─────────────────────────────────────────────────────────┐
│  Breadcrumb: Home > Category > Subcategory              │
│  "Hospitals in Jalgaon" — 145 results                   │
├──────────────┬──────────────────────────────────────────┤
│  FILTERS     │  [Sort: Relevance ▼] [Grid ▦] [List ☰]  │
│              │                                          │
│  Category    │  🔥 TRENDING (Featured Badge)            │
│  [▼ Select]  │  [Trending Card 1] [Trending Card 2]    │
│              │                                          │
│  Rating      │  ── Organic Results ──                   │
│  ★★★★+ ☐    │  [Listing Card 1]                       │
│  ★★★+ ☐     │  [Listing Card 2]                       │
│              │  [Listing Card 3]                       │
│  Distance    │  [Listing Card 4]                       │
│  ○ 1km       │  [Listing Card 5]                       │
│  ○ 5km       │                                          │
│  ○ 10km      │  [1] [2] [3] ... [10] [Next →]          │
│  ○ 25km      │                                          │
│              │                                          │
│  Open Now    │                                          │
│  [Toggle]    │                                          │
└──────────────┴──────────────────────────────────────────┘
```

---

## 3. Component Library

### 3.1 Listing Card

```
┌─────────────────────────────┐
│ [Image]                     │
│  ┌─ 🔥 Featured ───┐       │
│                             │
│  Business Name              │
│  📍 Location   │ 2.3 km    │
│  ★★★★☆ 4.2 (128)          │
│  [Category Badge]           │
│  [📞 Call] [💬 WhatsApp]    │
└─────────────────────────────┘
```

### 3.2 News Card

```
┌─────────────────────────────┐
│ [Featured Image]            │
│  [Category Pill]            │
│  Article Title (2 lines)    │
│  📅 June 25, 2026           │
│  [Read More →]              │
└─────────────────────────────┘
```

### 3.3 Job Card

```
┌─────────────────────────────┐
│  Job Title                  │
│  🏢 Company Name            │
│  📍 Location                │
│  [Full-time] [₹ 3L-5L/yr]  │
│  📅 Posted 2 days ago       │
│  [Apply Now]                │
└─────────────────────────────┘
```

### 3.4 Event Card

```
┌─────────────────────────────┐
│ [Event Image]               │
│  ┌── JUN ──┐                │
│  │   25    │                │
│  └─────────┘                │
│  Event Name                 │
│  📍 Venue                   │
│  ⏰ 10:00 AM - 5:00 PM      │
│  [Register →]               │
└─────────────────────────────┘
```

---

## 4. Navigation Patterns

### 4.1 Desktop Navigation
- **Sticky Header**: Logo | Full-width search bar | Login/Register | Add Listing CTA
- **Mega Menu**: Categories dropdown showing all categories with icons
- Smart scroll: Header shrinks on scroll down, reappears on scroll up

### 4.2 Mobile Navigation
- **Bottom Nav Bar** (5 tabs): Home | Search | Add Listing (center, prominent) | Saved | Profile
- **Hamburger Menu**: Full-screen overlay with all navigation links
- **Search**: Full-screen takeover with autocomplete

### 4.3 Admin Navigation
- **Left Sidebar**: Collapsible sidebar with icon+text modules
- **Top Bar**: Breadcrumbs, notifications bell, user avatar dropdown
- Active module highlighted in sidebar

---

## 5. Interaction Patterns

### 5.1 Micro-Animations
| Element | Animation | Duration |
|---------|-----------|----------|
| Button Hover | Scale 1.02 + shadow increase | 200ms ease |
| Card Hover | Translate Y -2px + shadow increase | 200ms ease |
| Page Transition | Fade in + slide up 10px | 300ms ease-out |
| Modal Open | Fade in backdrop + scale from 0.95 | 200ms ease |
| Toast Notification | Slide in from right | 300ms ease |
| Counter Animation | Count up from 0 | 1500ms ease-out |
| Skeleton Loading | Pulse shimmer effect | Continuous |

### 5.2 Form Patterns
- Multi-step wizard for listing submission (5 steps with progress bar)
- Inline validation on blur
- Loading spinners on submit buttons
- Success/error toast notifications
- Autosave draft every 30 seconds

### 5.3 Touch Targets
- Minimum touch target: 44×44px
- Adequate spacing between interactive elements
- Swipe gestures on mobile carousels

---

## 6. Responsive Breakpoints

| Viewport | Range | Columns | Nav Type | Key Behavior |
|----------|-------|---------|----------|--------------|
| Mobile | < 768px | 1–2 | Bottom nav | Full-screen modals, infinite scroll |
| Tablet | 768–1023px | 2–3 | Top nav (collapsed) | Sidebar collapsed |
| Desktop | 1024–1279px | 3–4 | Top nav + mega menu | Full sidebar on category pages |
| Large Desktop | 1280px+ | 4+ | Full nav | Max-width 1200px, centered |

---

## 7. Accessibility (A11Y)

- WCAG 2.1 AA compliance target
- All images must have descriptive alt text
- Color contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text
- Keyboard navigation support for all interactive elements
- ARIA labels on icon-only buttons
- Focus visible indicators on all focusable elements
- Screen reader compatible navigation and content
- Skip to content link
- axe-core automated checks in CI/CD

---

*Document Version: 1.0 | Derived from Jalgaon.com PRD v1.0*
