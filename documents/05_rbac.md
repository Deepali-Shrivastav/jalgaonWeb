# Jalgaon.com — RBAC (Role-Based Access Control)

> **Source:** PRD v1.0 | **Purpose:** Complete role definitions, permissions, and access control matrix

---

## 1. Role Definitions

| # | Role | Description | User Count (Est.) |
|---|------|-------------|-------------------|
| R-01 | Super Admin | Full platform control including settings, roles, billing, and all modules | 1–2 |
| R-02 | Admin | Manages all content, users, listings, ads, and approvals; cannot change roles | 2–3 |
| R-03 | Content Manager | Creates and publishes listings, news, blogs, events; cannot manage users or payments | 2–4 |
| R-04 | News Editor | Creates and publishes news and blog articles only | 2–5 |
| R-05 | SEO Manager | Edits metadata, slugs, sitemaps, canonical tags across all content types | 1–2 |
| R-06 | Moderator | Reviews and approves/rejects user-submitted content, reviews, and reports | 2–5 |
| R-07 | Support Executive | Views tickets, responds to contact forms, view-only access to listings | 1–3 |
| R-08 | Advertiser | Submits ad requests, uploads creatives, views own analytics | Unlimited |
| R-09 | Business Owner | Manages own listing(s), posts jobs, submits events, views listing analytics | Unlimited |
| R-10 | Registered User | Browses platform, submits reviews, saves listings, applies to jobs, submits events | Unlimited |
| R-11 | Guest | Read-only access to all public content; cannot submit or save anything | Unlimited |

---

## 2. Permission Categories

### 2.1 User Management Permissions
| Permission ID | Permission | Description |
|---------------|-----------|-------------|
| PERM-USER-01 | Manage Users | Create, view, edit, deactivate, delete user accounts |
| PERM-USER-02 | Manage Roles/Permissions | Create roles, assign permissions, modify role assignments |
| PERM-USER-03 | View Audit Logs | Access immutable admin action history |

### 2.2 Content Permissions
| Permission ID | Permission | Description |
|---------------|-----------|-------------|
| PERM-CONT-01 | Manage All Listings | Full CRUD on any listing regardless of ownership |
| PERM-CONT-02 | Manage Own Listing | CRUD limited to self-owned listings only |
| PERM-CONT-03 | Publish News/Blog | Create, edit, publish news articles and blog posts |
| PERM-CONT-04 | Approve/Reject Content | Moderate user-submitted listings, reviews, events |
| PERM-CONT-05 | Manage CMS Pages | Create and edit static CMS pages (city info) |
| PERM-CONT-06 | Submit Events/Jobs | Create and submit events or job posts |
| PERM-CONT-07 | Post Reviews | Submit ratings and text reviews on listings |

### 2.3 Business Permissions
| Permission ID | Permission | Description |
|---------------|-----------|-------------|
| PERM-BIZ-01 | Manage Advertisements | Full ad lifecycle management (submit, review, analytics) |
| PERM-BIZ-02 | Manage Payments | View transactions, manage subscriptions, generate invoices |
| PERM-BIZ-03 | View Analytics | Access traffic, listing, revenue, and SEO analytics |

### 2.4 System Permissions
| Permission ID | Permission | Description |
|---------------|-----------|-------------|
| PERM-SYS-01 | Edit SEO Metadata | Modify meta titles, descriptions, canonical URLs, robots directives |
| PERM-SYS-02 | Manage Settings | Platform configuration — OTP, payments, templates, maintenance mode |

---

## 3. Full Permission Matrix

| Permission | Super Admin | Admin | Content Mgr | News Editor | SEO Mgr | Moderator | Support | Advertiser | Biz Owner | Reg. User | Guest |
|-----------|:-----------:|:-----:|:-----------:|:-----------:|:-------:|:---------:|:-------:|:----------:|:---------:|:---------:|:-----:|
| **Manage Users** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Roles/Perms** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage All Listings** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Own Listing** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Publish News/Blog** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Edit SEO Metadata** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Approve/Reject Content** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Advertisements** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **View Analytics** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Manage Payments** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Submit Events/Jobs** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Post Reviews** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Manage Settings** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Audit Logs** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage CMS Pages** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Implementation Details

### 4.1 Database Schema

**Table: `roles`**
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK SERIAL | Auto-increment PK |
| name | VARCHAR(50) UNIQUE | Role name (e.g., "super_admin") |
| display_name | VARCHAR(100) | Human-readable name |
| description | TEXT | Role description |
| is_system | BOOLEAN | True for built-in roles (cannot be deleted) |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Table: `permissions`**
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK SERIAL | Auto-increment PK |
| code | VARCHAR(100) UNIQUE | Permission code (e.g., "manage_users") |
| display_name | VARCHAR(100) | Human-readable name |
| category | VARCHAR(50) | Permission category |

**Table: `role_permissions`**
| Column | Type | Description |
|--------|------|-------------|
| role_id | INT FK → roles | Role reference |
| permission_id | INT FK → permissions | Permission reference |
| (role_id, permission_id) | UNIQUE | Composite unique constraint |

### 4.2 Django Implementation

```
# Middleware: RBAC enforcement on every protected view
class RBACMiddleware:
    - Extract JWT from request
    - Load user role and permissions from cache (Redis)
    - Attach permissions to request object
    - If no valid role → reject with 403

# Decorator: Per-view permission check
@require_permission('manage_listings')
def approve_listing(request, listing_id):
    ...

# Permission caching
- User permissions cached in Redis on login
- Cache invalidated on role change
- TTL: Same as JWT access token (15 minutes)
```

### 4.3 Frontend Implementation
- Role-based route guards in Next.js middleware
- Component-level permission checks via React context
- Admin sidebar dynamically shows/hides modules based on role
- API calls return 403 if permission denied → redirect to unauthorized page

---

## 5. Role Escalation Rules

| Action | Allowed By |
|--------|------------|
| Assign Super Admin role | Super Admin only |
| Assign Admin role | Super Admin only |
| Assign Content/Editor/SEO/Mod roles | Super Admin, Admin |
| Self-upgrade role | Not allowed |
| Create custom roles | Super Admin only |

---

## 6. Audit Requirements

All role/permission changes must be logged:
- Who changed what role/permission
- Timestamp of change
- Previous and new values
- IP address of the actor

---

*Document Version: 1.0 | Derived from Jalgaon.com PRD v1.0*
