# 🔍 Jalgaon.com — Complete Technical Audit Report

> **Purpose:** Identify everything that is broken, risky, missing, or not production-ready  
> **Coverage:** Deployment · Security · Backend · Frontend · Database · Code Quality  
> **Each issue has:** Severity · Exact source · What's wrong · How to fix it

---

## 📊 Audit Dashboard

| Category | 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low | Total |
|---|:---:|:---:|:---:|:---:|:---:|
| 🚀 Deployment & Infrastructure | 4 | 3 | 2 | 1 | **10** |
| 🔐 Security | 5 | 4 | 3 | 0 | **12** |
| ⚙️ Backend (Django) | 2 | 5 | 6 | 3 | **16** |
| 🖥️ Frontend (React) | 0 | 3 | 4 | 3 | **10** |
| 🗄️ Database Design | 0 | 2 | 4 | 2 | **8** |
| 📋 Code Quality | 0 | 1 | 3 | 5 | **9** |
| **TOTAL** | **11** | **18** | **22** | **14** | **65** |

---

## 🗺️ Master Issue Index

| ID | Title | Severity | Category |
|---|---|:---:|---|
| [D-01](#d-01) | HTTPS Port 443 NOT Open on Web Server | 🔴 Critical | Deployment |
| [D-02](#d-02) | PostgreSQL Port 5432 Open to Entire Internet | 🔴 Critical | Deployment |
| [D-03](#d-03) | Zero Backups on Database Server | 🔴 Critical | Deployment |
| [D-04](#d-04) | DEBUG = True Running in Production | 🔴 Critical | Deployment |
| [D-05](#d-05) | Database Connection Uses Public IP | 🟠 High | Deployment |
| [D-06](#d-06) | No SSL Certificate Managed in Lightsail | 🟠 High | Deployment |
| [D-07](#d-07) | DNS Not Managed in AWS (External, Unknown) | 🟠 High | Deployment |
| [D-08](#d-08) | HTTP Port 80 Open on Database Server | 🟡 Medium | Deployment |
| [D-09](#d-09) | No Load Balancer — Single Point of Failure | 🟡 Medium | Deployment |
| [D-10](#d-10) | No Monitoring or Alerting | 🟢 Low | Deployment |
| [S-01](#s-01) | Django SECRET_KEY Hardcoded in Source Code | 🔴 Critical | Security |
| [S-02](#s-02) | Database Password Hardcoded in Source Code | 🔴 Critical | Security |
| [S-03](#s-03) | Fast2SMS API Key Hardcoded in Source Code | 🔴 Critical | Security |
| [S-04](#s-04) | Media Files Only Served in DEBUG Mode | 🔴 Critical | Security |
| [S-05](#s-05) | shop_listing View Has No Authentication | 🔴 Critical | Security |
| [S-06](#s-06) | No Rate Limiting on Auth Endpoints | 🟠 High | Security |
| [S-07](#s-07) | LikedShops GET Accepts Any user_id | 🟠 High | Security |
| [S-08](#s-08) | submit_review Crashes on Invalid Shop ID | 🟠 High | Security |
| [S-09](#s-09) | Admin Panel at Default /admin/ URL | 🟠 High | Security |
| [S-10](#s-10) | get_shop_reviews Broken — Returns All Reviews | 🟡 Medium | Security |
| [S-11](#s-11) | No HTTP → HTTPS Redirect | 🟡 Medium | Security |
| [S-12](#s-12) | db.sqlite3 File Committed to Repository | 🟡 Medium | Security |
| [B-01](#b-01) | Class Decorators on APIView Don't Work | 🔴 Critical | Backend |
| [B-02](#b-02) | Two Views for Same Shop Listing Endpoint | 🟠 High | Backend |
| [B-03](#b-03) | Wildcard Imports (import *) Used Everywhere | 🟠 High | Backend |
| [B-04](#b-04) | ShopReviewCreateSerializer Defined Twice | 🟠 High | Backend |
| [B-05](#b-05) | get_products_by_category is Plain Django View | 🟠 High | Backend |
| [B-06](#b-06) | No Pagination on Any List Endpoint | 🟡 Medium | Backend |
| [B-07](#b-07) | Finance Data is Static, Not Real-Time | 🟡 Medium | Backend |
| [B-08](#b-08) | is_valid Flag Never Filtered in Queries | 🟡 Medium | Backend |
| [B-09](#b-09) | CORS Middleware in Wrong Position | 🟡 Medium | Backend |
| [B-10](#b-10) | Imports Scattered Throughout views.py | 🟡 Medium | Backend |
| [B-11](#b-11) | print() Used Instead of Logger | 🟢 Low | Backend |
| [B-12](#b-12) | No API Versioning | 🟢 Low | Backend |
| [B-13](#b-13) | Unused ShopListingCreateView (Dead Code) | 🟢 Low | Backend |
| [F-01](#f-01) | JWT Token Key Inconsistency (Auth Broken) | 🟠 High | Frontend |
| [F-02](#f-02) | Two Redundant isLogin States | 🟠 High | Frontend |
| [F-03](#f-03) | .env File Committed to Git | 🟠 High | Frontend |
| [F-04](#f-04) | URL Route Typos Breaking Links & SEO | 🟡 Medium | Frontend |
| [F-05](#f-05) | No React Error Boundaries | 🟡 Medium | Frontend |
| [F-06](#f-06) | No Loading States / Skeleton Screens | 🟡 Medium | Frontend |
| [F-07](#f-07) | SearchPage Breaks on Page Refresh | 🟡 Medium | Frontend |
| [F-08](#f-08) | No 404 Page Route | 🟢 Low | Frontend |
| [F-09](#f-09) | Image Compression Installed but Unused | 🟢 Low | Frontend |
| [F-10](#f-10) | No TypeScript | 🟢 Low | Frontend |
| [DB-01](#db-01) | No Timestamps on Core Models | 🟠 High | Database |
| [DB-02](#db-02) | LikedShops Has No Unique Constraint | 🟠 High | Database |
| [DB-03](#db-03) | Typo in Model Field: para_trhee | 🟡 Medium | Database |
| [DB-04](#db-04) | Wrong Field Types (CharField for numbers/email) | 🟡 Medium | Database |
| [DB-05](#db-05) | All 3 Gallery Images Required — Too Restrictive | 🟡 Medium | Database |
| [DB-06](#db-06) | Article Paragraphs Use CharField (1000 char limit) | 🟡 Medium | Database |
| [DB-07](#db-07) | No Database Indexes on Search Fields | 🟢 Low | Database |
| [DB-08](#db-08) | Tags Stored as 7 Separate Columns (Anti-pattern) | 🟢 Low | Database |
| [Q-01](#q-01) | No Pinned Frontend Dependencies | 🟠 High | Code Quality |
| [Q-02](#q-02) | No .gitignore for Backend | 🟡 Medium | Code Quality |
| [Q-03](#q-03) | No Structured Logging Configuration | 🟡 Medium | Code Quality |
| [Q-04](#q-04) | README is Empty — No Setup Instructions | 🟡 Medium | Code Quality |
| [Q-05](#q-05) | Unused api/ App (Dead Code) | 🟢 Low | Code Quality |
| [Q-06](#q-06) | No Backend Tests | 🟢 Low | Code Quality |
| [Q-07](#q-07) | No Frontend Tests | 🟢 Low | Code Quality |
| [Q-08](#q-08) | No CI/CD Pipeline | 🟢 Low | Code Quality |
| [Q-09](#q-09) | Commented-Out Code in Production Files | 🟢 Low | Code Quality |

---

---

# 🚀 SECTION 1 — Deployment & Infrastructure

---

<a name="d-01"></a>
## D-01 🔴 CRITICAL — HTTPS Port 443 NOT Open on Web Server

| Property | Detail |
|---|---|
| **Source** | Lightsail → jalgaon-webapp → Networking (firewall screenshots) |
| **Affects** | All users — entire website |

**What Is Open vs What's Missing:**

| Port | Protocol | Status |
|---|---|---|
| 22 (SSH) | TCP | ✅ Open |
| 80 (HTTP) | TCP | ✅ Open |
| **443 (HTTPS)** | **TCP** | ❌ **MISSING from both IPv4 and IPv6** |

**Why It's Wrong:**
The code expects HTTPS everywhere:
- `jalgaonUi/.env` line 5 → `VITE_DJANGO_API=https://api.jalgaon.com`
- `settings.py` line 18 → `CSRF_TRUSTED_ORIGINS = ['https://api.jalgaon.com', ...]`

But port 443 is blocked by the firewall → HTTPS traffic cannot reach the server.

**Fix:**
```
Lightsail → jalgaon-webapp → Networking → IPv4 Firewall → Add rule
Application: HTTPS | Protocol: TCP | Port: 443 | Any IPv4 address
Repeat for IPv6 firewall
```

---

<a name="d-02"></a>
## D-02 🔴 CRITICAL — PostgreSQL Port 5432 Open to Entire Internet

| Property | Detail |
|---|---|
| **Source** | Lightsail → jalgaon.com-dbs → Networking (firewall screenshots) |
| **Affects** | Database — all user data |

**Current Dangerous Firewall Rules on jalgaon.com-dbs:**

| Port | Accessible From | Risk |
|---|---|---|
| 5432 (PostgreSQL) | **Any IPv4 address** | 🔴 Critical |
| 5432 (PostgreSQL) | **Any IPv6 address** | 🔴 Critical |

**The Combined Attack:**
> Step 1: Attacker sees DB password in `settings.py` line 111 (it's hardcoded)  
> Step 2: Attacker connects to `65.1.52.6:5432` (port is wide open — confirmed)  
> Step 3: Full database access — read, modify, or delete all data

**Fix:**
```
Lightsail → jalgaon.com-dbs → Networking → IPv4 Firewall
DELETE:  PostgreSQL | TCP | 5432 | Any IPv4 address
ADD:     PostgreSQL | TCP | 5432 | 172.26.4.114   ← webapp's private IP only

Repeat the same for IPv6 firewall
```

---

<a name="d-03"></a>
## D-03 🔴 CRITICAL — Zero Backups on Database Server

| Property | Detail |
|---|---|
| **Source** | Lightsail → Snapshots page (screenshot confirmed) |
| **Affects** | All business listings, users, reviews, articles |

**Current Backup Status:**

| Instance | Last Snapshot | Auto Snapshots | Risk |
|---|---|---|---|
| `jalgaon-webapp` | Aug 28, 2024 *(10 months ago!)* | ❌ Disabled | High |
| `jalgaon.com-dbs` | **Never — Zero backups** | ❌ Disabled | 🔴 Critical |

**Consequence:** If `jalgaon.com-dbs` crashes today → every shop listing, user account, review, and article is **permanently lost forever**.

**Fix (Do in this order):**
```
Step 1: Lightsail → jalgaon.com-dbs → Snapshots tab → Create snapshot (do NOW)
Step 2: Lightsail → jalgaon.com-dbs → Snapshots tab → Enable automatic snapshots (toggle ON)
Step 3: Lightsail → jalgaon-webapp  → Snapshots tab → Enable automatic snapshots
Step 4: Set up nightly pg_dump backup via cron job to S3 (for database-level backup)
```

---

<a name="d-04"></a>
## D-04 🔴 CRITICAL — DEBUG = True Running in Production

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/jalgaonApi/settings.py` line 15 |
| **Affects** | Security, performance, error handling |

**Code:**
```python
DEBUG = True   # ← This is ON in production right now
```

**What DEBUG=True Causes in Production:**

| Problem | Impact |
|---|---|
| Full stack traces shown to users | Exposes internal code structure to attackers |
| All media files loaded in memory | Server performance degrades |
| Errors not emailed to admins | Issues go unnoticed silently |
| Database connection not pooled | Every request opens a new DB connection |
| Django itself warns against this | Industry standard violation |

**Fix:**
```python
# settings.py line 15
DEBUG = False
# Or use environment variable:
DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'
```

---

<a name="d-05"></a>
## D-05 🟠 HIGH — Database Connection Uses Public IP Instead of Private IP

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/jalgaonApi/settings.py` lines 107–114 |
| **Affects** | Performance, security, cost |

**Current vs Correct:**

| Setting | Current (Wrong) | Should Be |
|---|---|---|
| `HOST` | `65.1.52.6` (public IP) | `172.26.10.173` (private IP) |

Both servers are in the same AWS zone (Mumbai ap-south-1a). Every DB query is going out to the public internet and coming back — completely unnecessary.

**Consequences of Using Public IP:**
- ❌ Slower queries (public network hop)
- ❌ Requires port 5432 open to internet (causes D-02)
- ❌ Data travels over public internet
- ❌ AWS charges for public IP data transfer

**Fix:**
```python
# settings.py line 112
'HOST': '172.26.10.173',   # Private IP — stays inside AWS network
```

---

<a name="d-06"></a>
## D-06 🟠 HIGH — No SSL Certificate Managed in Lightsail

| Property | Detail |
|---|---|
| **Source** | Lightsail → Certificates → "SSL/TLS certificates (0)" |
| **Affects** | HTTPS reliability, certificate expiry risk |

**Finding:** The Lightsail certificate page shows zero certificates. Yet the site uses HTTPS. This means SSL must be managed manually via **Let's Encrypt (certbot)** on the Ubuntu server — with no visibility from the AWS console.

**Risk Table:**

| Risk | Detail |
|---|---|
| Certificates expire every 90 days | No automatic AWS console reminder |
| Auto-renewal cron may be broken | Site shows SSL error if cron fails |
| No monitoring | You won't know cert expired until users report it |

**Immediate Check:**
```bash
# SSH into jalgaon-webapp → Run:
sudo certbot certificates
# Look at: Expiry Date — if < 30 days → run: sudo certbot renew
```

---

<a name="d-07"></a>
## D-07 🟠 HIGH — DNS Not Managed in AWS (Location Unknown)

| Property | Detail |
|---|---|
| **Source** | Lightsail → Domains & DNS → Empty page (no zones exist) |
| **Affects** | Domain control, DNS changes, domain renewal |

**Finding:** The Domains & DNS page is completely empty — no DNS zones for `jalgaon.com` exist in Lightsail. DNS is managed at an **external registrar** that you currently don't know about.

**What You Don't Know Right Now:**
- ❓ Which registrar holds `jalgaon.com`
- ❓ Who has the login credentials
- ❓ When does the domain registration expire
- ❓ What DNS records exist (where does `www.` point vs `api.`?)

**Fix:**
```
1. Visit: https://whois.domaintools.com/jalgaon.com
2. Find which registrar (GoDaddy / Namecheap / BigRock / etc.)
3. Get login access from previous developer
4. Note the domain expiry date
```

---

<a name="d-08"></a>
## D-08 🟡 MEDIUM — HTTP Port 80 Open on Database Server

| Property | Detail |
|---|---|
| **Source** | Lightsail → jalgaon.com-dbs → Networking (both IPv4 and IPv6) |

**The Problem:** Port 80 (HTTP/web traffic) is open on a server whose only job is running a database. No web server should run on a database machine.

**Fix:** Delete the HTTP port 80 rule from both IPv4 and IPv6 firewalls of `jalgaon.com-dbs`.

---

<a name="d-09"></a>
## D-09 🟡 MEDIUM — No Load Balancer — Single Point of Failure

| Property | Detail |
|---|---|
| **Source** | Lightsail → jalgaon-webapp → Networking: "not sharing traffic with any others" |

**Current Architecture:**
```
All Traffic → jalgaon-webapp (single instance) → If it crashes = site completely down
```

**Fix (when ready to invest):** Add a Lightsail Load Balancer ($18/month) with 2 webapp instances.

---

<a name="d-10"></a>
## D-10 🟢 LOW — No Monitoring or Alerting

| Property | Detail |
|---|---|
| **Source** | Lightsail → Alarm notifications (nothing configured) |

No alerts for CPU spikes, disk full, memory pressure, or server unreachable. Problems are discovered only when users complain.

**Fix:** Lightsail → each instance → Metrics tab → Set alarms for CPU > 80%, status check failed.

---

---

# 🔐 SECTION 2 — Security

---

<a name="s-01"></a>
## S-01 🔴 CRITICAL — Django SECRET_KEY Hardcoded in Source Code

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/jalgaonApi/settings.py` line 12 |

**Code:**
```python
SECRET_KEY = 'django-insecure-puv6kv)$735=-=71i*xk28t5ve726_=o(hgc#vxf-5@4jf_yo+'
```

**What SECRET_KEY Is Used For (All Compromised):**

| Usage | Attack Possible |
|---|---|
| Signs session cookies | Forge any user's session |
| Signs CSRF tokens | Bypass CSRF protection |
| Signs password reset links | Reset any user's password |
| Signs JWT tokens | Create fake authentication tokens |

**Fix:**
```python
# settings.py
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

# On server, add to .env file:
# DJANGO_SECRET_KEY=<generate new key with: python -c "import secrets; print(secrets.token_urlsafe(50))">
```

---

<a name="s-02"></a>
## S-02 🔴 CRITICAL — Database Password Hardcoded in Source Code

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/jalgaonApi/settings.py` line 111 |

**Code:**
```python
'PASSWORD': 'kjshfgkhdkjhgjdkhfgyghi',
```

Combined with D-02 (port 5432 open) → anyone who sees the code has full database access.

**Fix:**
```python
'PASSWORD': os.environ.get('DB_PASSWORD'),
```

---

<a name="s-03"></a>
## S-03 🔴 CRITICAL — Fast2SMS API Key Hardcoded

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/utils.py` line 5 |

**Code:**
```python
api_key = "kocp8AH2aMJe1LFgxVX6iBfmlNdY9nIrqOQ4GbhtRZ7Ps0KDujg4SfP6AIul9DmX8WCzYc3xGUeryob1"
```

Anyone who sees this can send SMS messages charged to your Fast2SMS account.

**Fix:**
```python
api_key = os.environ.get('FAST2SMS_API_KEY')
```

---

<a name="s-04"></a>
## S-04 🔴 CRITICAL — Media Files Only Served in DEBUG Mode

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/jalgaonApi/urls.py` lines 29–30 |

**Code:**
```python
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

**The Trap:** When you fix D-04 (set `DEBUG=False`), all uploaded images — shop banners, profile pictures, category images — will return **404 errors**. The whole site will lose its images.

**Fix:** Configure Nginx on the server to serve `/media/` files directly:
```nginx
location /media/ {
    alias /path/to/jalgaonApi/media/;
}
```

---

<a name="s-05"></a>
## S-05 🔴 CRITICAL — shop_listing View Has No Authentication

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/views.py` lines 113–131 |

**Code:**
```python
@api_view(['POST'])
def shop_listing(request):      # ← No @permission_classes decorator!
    serializer = ShopListingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
```

Anyone — logged in or not — can create a shop listing.

**Fix:**
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def shop_listing(request):
```

---

<a name="s-06"></a>
## S-06 🟠 HIGH — No Rate Limiting on Auth Endpoints

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/views.py` lines 16–39 |
| **Affected Endpoints** | `/app/register/` and `/app/login/` |

No limit on login attempts → brute-force attacks possible. No limit on registrations → spam accounts possible.

**Fix:**
```python
# settings.py — add to REST_FRAMEWORK:
'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.AnonRateThrottle'],
'DEFAULT_THROTTLE_RATES': {'anon': '20/hour'}
```

---

<a name="s-07"></a>
## S-07 🟠 HIGH — LikedShops GET Accepts Any user_id (Broken Authorization)

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/views.py` lines 285–292 |

**Code:**
```python
user_id = request.query_params.get('user_id', None)
liked_shops = LikedShops.objects.filter(user=user_id)  # ← Trusts the query param!
```

User A can see User B's liked shops by passing `?user_id=<B's id>`. No authorization check.

**Fix:**
```python
liked_shops = LikedShops.objects.filter(user=request.user)  # Use authenticated user
```

---

<a name="s-08"></a>
## S-08 🟠 HIGH — submit_review Crashes on Invalid Shop ID

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/views.py` line 366 |

**Code:**
```python
shop_listing = ShopListing.objects.get(id=shop_listing_id)  # ← No try/except!
```

If `shop_listing_id` doesn't exist → unhandled exception → 500 error (with full stack trace when `DEBUG=True`).

**Fix:**
```python
try:
    shop_listing = ShopListing.objects.get(id=shop_listing_id)
except ShopListing.DoesNotExist:
    return Response({'error': 'Shop not found'}, status=404)
```

---

<a name="s-09"></a>
## S-09 🟠 HIGH — Admin Panel at Default /admin/ URL

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/jalgaonApi/urls.py` line 23 |

Bots constantly scan for `/admin/`. The default URL is widely known and brute-forced.

**Fix:**
```python
path('jalgaon-control-2024/', admin.site.urls),  # Use a non-guessable URL
```

---

<a name="s-10"></a>
## S-10 🟡 MEDIUM — get_shop_reviews Broken — Returns All Reviews

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/views.py` lines 382–387 |

**Two bugs in one view:**
```python
@api_view(['GET'])
def get_shop_reviews(request):
    shop_id = request.data.get('shop_listing')  # Bug 1: GET has no body — always None
    reviews = ShopReview.objects.all()           # Bug 2: Returns ALL reviews, not filtered
```

**Fix:**
```python
shop_id = request.query_params.get('shop_listing')
reviews = ShopReview.objects.filter(shop_listing=shop_id)
```

---

<a name="s-11"></a>
## S-11 🟡 MEDIUM — No HTTP → HTTPS Redirect

| Property | Detail |
|---|---|
| **Source** | Nginx config (server-side) |

Users who type `jalgaon.com` without `https://` get served over plain HTTP → credentials sent unencrypted.

**Fix (Nginx config on server):**
```nginx
server {
    listen 80;
    server_name jalgaon.com www.jalgaon.com api.jalgaon.com;
    return 301 https://$host$request_uri;
}
```

---

<a name="s-12"></a>
## S-12 🟡 MEDIUM — db.sqlite3 File Committed to Repository

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/db.sqlite3` (183 KB file in repo) |

Contains old/test data including possibly user phone numbers and hashed passwords.

**Fix:**
```bash
echo "db.sqlite3" >> .gitignore
git rm --cached jalgaonApi/db.sqlite3
git commit -m "Remove sqlite database from tracking"
```

---

---

# ⚙️ SECTION 3 — Backend (Django) Code

---

<a name="b-01"></a>
## B-01 🔴 CRITICAL — Class Decorators on APIView Don't Work

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/views.py` lines 100–108 and 344–346 |

**Broken Code:**
```python
@permission_classes([IsAuthenticated])        # ← Does NOTHING on a class
@authentication_classes([TokenAuthentication]) # ← These are function-view decorators
class ShopListingCreateView(APIView):
```

When applied to a class, these decorators have zero effect. The class has no authentication enforcement.

**Fix:**
```python
class ShopListingCreateView(APIView):
    permission_classes = [IsAuthenticated]           # ← Class attribute (correct)
    authentication_classes = [TokenAuthentication]    # ← Class attribute (correct)
```

---

<a name="b-02"></a>
## B-02 🟠 HIGH — Two Views for Same Shop Listing Endpoint

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/views.py` lines 100–131 |

| View | Lines | Auth | Problem |
|---|---|---|---|
| `ShopListingCreateView` (class) | 100–108 | Broken decorators | Not actually enforced |
| `shop_listing` (function) | 113–131 | No auth at all | Anyone can create listings |

Two views for the same purpose, both broken differently.

**Fix:** Delete `ShopListingCreateView`, fix `shop_listing` function with proper auth decorators.

---

<a name="b-03"></a>
## B-03 🟠 HIGH — Wildcard Imports Used Throughout

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/views.py` lines 6–7 |

```python
from app.serializers import *   # Imports everything
from app.models import *        # Imports everything
```

Hides what's actually used, can cause silent name collisions, violates PEP-8.

**Fix:** Use explicit named imports.

---

<a name="b-04"></a>
## B-04 🟠 HIGH — ShopReviewCreateSerializer Defined Twice

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/serializers.py` lines 153–165 |

The same class is defined twice. Python silently overwrites the first with the second.

**Fix:** Delete the duplicate definition at lines 153–156.

---

<a name="b-05"></a>
## B-05 🟠 HIGH — get_products_by_category is Unprotected Plain View

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/views.py` lines 208–214 |

```python
def get_products_by_category(request):   # Plain Django view — no DRF protections
    shop_listing = ShopListing.objects.filter(main_category=main_category)
    shop_listing_list = list(shop_listing.values())  # Exposes ALL database fields
    return JsonResponse(shop_listing_list, safe=False)  # No pagination
```

**Three problems:** No DRF permissions, exposes raw DB fields, no pagination.

---

<a name="b-06"></a>
## B-06 🟡 MEDIUM — No Pagination on Any List Endpoint

| Property | Detail |
|---|---|
| **Source** | All list views in `views.py` |

All these endpoints return **every single record**:

| Endpoint | Returns |
|---|---|
| `GET /app/categorys/` | ALL categories |
| `GET /app/subCategorys/` | ALL sub-categories |
| `GET /app/articles/` | ALL articles |
| `GET /app/crousel-ads/` | ALL carousel ads |

**Fix:**
```python
# settings.py — add to REST_FRAMEWORK:
'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
'PAGE_SIZE': 20,
```

---

<a name="b-07"></a>
## B-07 🟡 MEDIUM — Finance Data is Static, Not Real-Time

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/models.py` lines 130–138 |

Stock ticker data shown on the home page is manually entered by admins. It's stale — not live market data. Users may trust it for financial decisions.

**Fix:** Integrate a real stock API, or add a disclaimer "Data is not real-time."

---

<a name="b-08"></a>
## B-08 🟡 MEDIUM — is_valid Flag Never Filtered in Queries

| Property | Detail |
|---|---|
| **Source** | `models.py` line 103, `views.py` line 211 |

The `is_valid` field (meant for admin approval) defaults to `False` but is never used in any query filter. All unapproved listings show publicly.

**Fix:**
```python
shop_listing = ShopListing.objects.filter(main_category=main_category, is_valid=True)
```

---

<a name="b-09"></a>
## B-09 🟡 MEDIUM — CORS Middleware in Wrong Position

| Property | Detail |
|---|---|
| **Source** | `settings.py` lines 37–46 |

`CorsMiddleware` is at the bottom of the middleware list. Django's CORS documentation requires it to be first — before all other middleware.

**Fix:** Move `'corsheaders.middleware.CorsMiddleware'` to the very top of `MIDDLEWARE`.

---

<a name="b-10"></a>
## B-10 🟡 MEDIUM — Imports Scattered Throughout views.py

| Property | Detail |
|---|---|
| **Source** | `views.py` — imports at lines 1, 56, 95, 137, 261, 390 |

Imports appear in 6 different places in the file. PEP-8 requires all imports at the top.

---

<a name="b-11"></a>
## B-11 🟢 LOW — print() Used Instead of Logger

| Property | Detail |
|---|---|
| **Source** | `views.py` lines 78, 91, 115, 130, 170, 175, 188, 204 |

```python
print(f"Error occurred: {e}")   # Not searchable, not rotatable
print("ok")                      # Debug noise in production logs
```

A `logger` is already defined at line 14: `logger = logging.getLogger(__name__)` — but not used.

**Fix:** Replace all `print()` with `logger.error()`, `logger.debug()`, etc.

---

<a name="b-12"></a>
## B-12 🟢 LOW — No API Versioning

| Property | Detail |
|---|---|
| **Source** | `urls.py` line 24: `path('app/', ...)` |

No version in URLs. Future breaking changes will affect the Android app and web app simultaneously.

**Fix:** Use `/api/v1/` URL prefix pattern.

---

<a name="b-13"></a>
## B-13 🟢 LOW — Unused ShopListingCreateView (Dead Code)

| Property | Detail |
|---|---|
| **Source** | `views.py` lines 100–108 |

Never used (broken, replaced by function view). Should be deleted.

---

---

# 🖥️ SECTION 4 — Frontend (React) Code

---

<a name="f-01"></a>
## F-01 🟠 HIGH — JWT Token Key Inconsistency (Authentication Likely Broken)

| Property | Detail |
|---|---|
| **Source** | `Layout.jsx` (axios interceptor) vs `UserContext.jsx` (login flow) |

| Location | Key Used |
|---|---|
| Login flow (stores token) | `localStorage['token']` |
| Axios interceptor (reads token) | `localStorage['authToken']` |

These are **different keys**. The interceptor reads from a key that's never written → `Authorization: Bearer` header is never sent → authenticated API calls fail silently.

**Fix:** Use the same localStorage key in both places.

---

<a name="f-02"></a>
## F-02 🟠 HIGH — Two Redundant isLogin States (Unsynchronized)

| Property | Detail |
|---|---|
| **Source** | `UserContext.jsx` and `LoginContext.jsx` |

Both contexts have their own `isLogin` state, not synchronized. After login, `UserContext.isLogin` updates but `LoginContext.isLogin` stays stale → the Navbar may not update to show "logged in" state.

**Fix:** Use one single source of truth for login state.

---

<a name="f-03"></a>
## F-03 🟠 HIGH — .env File Committed to Git

| Property | Detail |
|---|---|
| **Source** | `jalgaonUi/.env` |

The `.env` file should never be in version control. Even though it currently only contains the API URL, this practice opens the door to committing real secrets later.

**Fix:**
```
1. Add jalgaonUi/.env to .gitignore
2. Create jalgaonUi/.env.example with placeholder values
```

---

<a name="f-04"></a>
## F-04 🟡 MEDIUM — URL Route Typos Breaking Links & SEO

| Property | Detail |
|---|---|
| **Source** | `jalgaonUi/src/main.jsx` |

| Typo in Code | Should Be |
|---|---|
| `/addListig` | `/addListing` |
| `/allarticlse` | `/allarticles` |

Users who share or bookmark the "correct" URL see a 404. Search engines index the typo'd version.

---

<a name="f-05"></a>
## F-05 🟡 MEDIUM — No React Error Boundaries

No `<ErrorBoundary>` components. Any uncaught JavaScript error causes the entire app to unmount → users see a completely blank white page.

---

<a name="f-06"></a>
## F-06 🟡 MEDIUM — No Loading States / Skeleton Screens

While API data loads, components show empty space. On slow connections, users see blank sections that look broken.

---

<a name="f-07"></a>
## F-07 🟡 MEDIUM — SearchPage Breaks on Page Refresh

| Property | Detail |
|---|---|
| **Source** | `jalgaonUi/src/pages/SearchPage.jsx` |

Search results are stored in React Router's `location.state`. If the user refreshes the page → state is cleared → blank page. The search results URL also cannot be shared.

---

<a name="f-08"></a>
## F-08 🟢 LOW — No 404 Page Route

No catch-all `*` route defined. Invalid URLs show a blank page.

**Fix:** Add `path('*', element: <NotFoundPage />)` to the router.

---

<a name="f-09"></a>
## F-09 🟢 LOW — Image Compression Installed but Unused

| Property | Detail |
|---|---|
| **Source** | `package.json` line 17: `"browser-image-compression": "^2.0.2"` |

Package adds to bundle size but is commented out in the code. Users upload raw 5–10 MB images with no compression.

---

<a name="f-10"></a>
## F-10 🟢 LOW — No TypeScript

Plain JavaScript with no type checking. Prop type mismatches and API data shape errors are discovered at runtime, not at compile time.

---

---

# 🗄️ SECTION 5 — Database Design

---

<a name="db-01"></a>
## DB-01 🟠 HIGH — No Timestamps on Core Models

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/models.py` — ShopListing, LikedShops, AdsListing |

| Model | created_at | updated_at |
|---|---|---|
| `ShopListing` | ❌ Missing | ❌ Missing |
| `LikedShops` | ❌ Missing | ❌ Missing |
| `AdsListing` | ❌ Missing | ❌ Missing |
| `ShopReview` | ✅ timestamp exists | — |

Cannot sort listings by "newest", show "liked on date", or know when a shop was last updated.

**Fix:**
```python
created_at = models.DateTimeField(auto_now_add=True)
updated_at = models.DateTimeField(auto_now=True)
```

---

<a name="db-02"></a>
## DB-02 🟠 HIGH — LikedShops Has No Unique Constraint

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/models.py` lines 187–192 |

The duplicate check is done manually in the view — not enforced at the database level. Two simultaneous requests can both pass the check and create duplicate records (race condition).

**Fix:**
```python
class Meta:
    unique_together = ('user', 'shop_listing')
```

---

<a name="db-03"></a>
## DB-03 🟡 MEDIUM — Typo in Model Field: para_trhee

| Property | Detail |
|---|---|
| **Source** | `jalgaonApi/app/models.py` line 175 |

```python
para_trhee = models.CharField(max_length=1000)   # ← Typo (should be para_three)
```

This is a permanent column name in the PostgreSQL database. A migration is required to rename it.

---

<a name="db-04"></a>
## DB-04 🟡 MEDIUM — Wrong Field Types

| Field | Model | Current Type | Should Be |
|---|---|---|---|
| `rating_star` | ShopReview | `CharField(5)` | `IntegerField` with min/max |
| `stock_price` | FinanceData | `CharField(50)` | `DecimalField` |
| `business_dob` | ShopListing | `CharField(50)` | `IntegerField` (year) |
| `business_email` | ShopListing | `CharField(50)` | `EmailField` |
| `stock_change` | FinanceData | `CharField(50)` | `DecimalField` |

Using `CharField` for non-text data bypasses Django's built-in validation.

---

<a name="db-05"></a>
## DB-05 🟡 MEDIUM — All 3 Gallery Images Required — Too Restrictive

| Property | Detail |
|---|---|
| **Source** | `models.py` lines 91–93 |

`business_img_one`, `business_img_two`, `business_img_three` — all required. A business must upload exactly 3 photos or the form fails.

---

<a name="db-06"></a>
## DB-06 🟡 MEDIUM — Article Paragraphs Limited to 1000 Characters

| Property | Detail |
|---|---|
| **Source** | `models.py` lines 173–177 |

Each paragraph is `CharField(max_length=1000)`. Real articles need more space. Use `TextField` (no length limit).

---

<a name="db-07"></a>
## DB-07 🟢 LOW — No Database Indexes on Search/Filter Fields

Frequently queried fields like `business_name` (search) and `main_category` (filter) have no explicit indexes → slower queries as data grows.

---

<a name="db-08"></a>
## DB-08 🟢 LOW — Tags Stored as 7 Separate Columns

7 columns (`sub_domain_one` through `sub_domain_seven`) is an anti-pattern. Cannot add more tags, cannot query "all shops with tag X".

**Better:** Separate `ShopTag` model with ForeignKey to ShopListing.

---

---

# 📋 SECTION 6 — Code Quality & Maintenance

---

<a name="q-01"></a>
## Q-01 🟠 HIGH — No Pinned Frontend Dependencies

| Property | Detail |
|---|---|
| **Source** | `jalgaonUi/package.json` — all versions use `^` (caret) |

`npm install` on a new machine could pull different (newer, potentially breaking) package versions. `package-lock.json` should be committed and `npm ci` used for installs.

---

<a name="q-02"></a>
## Q-02 🟡 MEDIUM — No .gitignore for Backend

Files like `db.sqlite3`, `__pycache__/`, `*.pyc`, `media/`, and `.env` are not ignored, leading to accidental commits of sensitive or generated files.

---

<a name="q-03"></a>
## Q-03 🟡 MEDIUM — No Structured Logging

No `LOGGING` configuration in `settings.py`. Django error logs, warnings, and exceptions are not persisted, not rotatable, and not searchable.

---

<a name="q-04"></a>
## Q-04 🟡 MEDIUM — README is Empty

`jalgaonWeb/README.md` is only 64 bytes — essentially empty. A new developer (like you) has no written guide for local setup, deployment, or architecture.

---

<a name="q-05"></a>
## Q-05 🟢 LOW — Unused api/ App (Dead Code)

`jalgaonApi/api/views.py` has 4 lines and is empty. The app is installed and routed but does nothing.

---

<a name="q-06"></a>
## Q-06 🟢 LOW — No Backend Tests

Zero test coverage. Any code change could break existing features with no automated way to detect it.

---

<a name="q-07"></a>
## Q-07 🟢 LOW — No Frontend Tests

No Vitest or Jest setup. No component tests, no API integration tests.

---

<a name="q-08"></a>
## Q-08 🟢 LOW — No CI/CD Pipeline

No `.github/workflows/` directory. Every deployment is a manual process (SSH + commands). No automated testing before deployment.

---

<a name="q-09"></a>
## Q-09 🟢 LOW — Commented-Out Code in Production Files

30+ lines of commented code in `serializers.py` (lines 79–99) and `views.py` (lines 338–342). Git history preserves old versions — commented code in production files is unnecessary clutter.

---

---

# 🚧 SECTION 7 — Missing Features (Partially Built, Never Completed)

| Feature | Evidence It Was Planned | Current Status |
|---|---|---|
| 📱 OTP Phone Verification | `utils.py` has `send_otp()` + Twilio installed | Function defined, **never called** |
| ✅ Listing Approval Workflow | `is_valid` field exists on ShopListing | Field exists, **never filtered** |
| 🖼️ Image Compression | `browser-image-compression` in `package.json` | Installed, **usage commented out** |
| 📈 Real-Time Finance Data | `FinanceData` model exists | Manually updated, **not live** |
| ⭐ Business Rating Update | `business_rating` field exists | Field exists, **no update endpoint** |
| 💔 Unlike a Shop | LikedShops has POST | **No DELETE endpoint** |
| 🔑 Password Reset | — | **Completely missing** |
| ✉️ Email Verification | — | **No email field on User model** |
| 📄 Pagination | — | **Not configured anywhere** |
| 🔍 Ranked Search | Search returns all shops | **No relevance ranking** |

---

---

# 📅 Priority Action Plan

## 🔴 Week 1 — Do These First (Security & Data Protection)

| # | Task | Issue ID | How |
|---|---|---|---|
| 1 | Add HTTPS port 443 to jalgaon-webapp firewall | D-01 | Lightsail → jalgaon-webapp → Networking |
| 2 | Restrict DB port 5432 to private IP only | D-02 | Lightsail → jalgaon.com-dbs → Networking |
| 3 | Take manual snapshot of jalgaon.com-dbs NOW | D-03 | Lightsail → jalgaon.com-dbs → Snapshots |
| 4 | Enable auto snapshots on both instances | D-03 | Lightsail → each instance → Snapshots |
| 5 | Set DEBUG = False | D-04 | settings.py line 15 |
| 6 | Move SECRET_KEY to environment variable | S-01 | settings.py line 12 |
| 7 | Move DB PASSWORD to environment variable | S-02 | settings.py line 111 |
| 8 | Move Fast2SMS API key to environment variable | S-03 | utils.py line 5 |

## 🟠 Week 2 — High Priority Fixes

| # | Task | Issue ID |
|---|---|---|
| 1 | Change DB HOST to private IP `172.26.10.173` | D-05 |
| 2 | Configure Nginx to serve /media/ files | S-04 |
| 3 | Fix class decorators on ShopListingCreateView | B-01 |
| 4 | Fix broken authorization on LikedShops GET | S-07 |
| 5 | Find and access domain registrar | D-07 |
| 6 | Check SSL certificate expiry (SSH into server) | D-06 |
| 7 | Fix JWT token key inconsistency in frontend | F-01 |

## 🟡 Month 1 — Medium Priority

| # | Task | Issue ID |
|---|---|---|
| 1 | Add rate limiting to login/register | S-06 |
| 2 | Add pagination to all list endpoints | B-06 |
| 3 | Filter listings by is_valid=True | B-08 |
| 4 | Fix get_shop_reviews to filter by shop | S-10 |
| 5 | Move CORS middleware to top of MIDDLEWARE | B-09 |
| 6 | Add timestamps to ShopListing | DB-01 |
| 7 | Add unique_together to LikedShops | DB-02 |
| 8 | Change admin URL from default /admin/ | S-09 |
| 9 | Fix URL route typos in frontend | F-04 |
| 10 | Add HTTP → HTTPS redirect in Nginx | S-11 |

## 🟢 Ongoing — Gradual Improvements

| # | Task | Issue ID |
|---|---|---|
| 1 | Replace all print() with logger calls | B-11 |
| 2 | Write backend unit tests | Q-06 |
| 3 | Set up monitoring alarms on Lightsail | D-10 |
| 4 | Create proper .gitignore for backend | Q-02 |
| 5 | Write README with setup instructions | Q-04 |
| 6 | Set up CI/CD pipeline | Q-08 |
| 7 | Add React Error Boundaries | F-05 |
| 8 | Add 404 page route | F-08 |
