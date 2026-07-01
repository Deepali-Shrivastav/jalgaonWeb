# Authentication Module — Deep Audit Report

**Project:** Jalgaon.com — City Digital Ecosystem Platform  
**Audit Date:** July 1, 2026  
**Auditor:** Antigravity AI  
**Scope:** Backend (`jalgaonApi/apps/accounts/`) + Frontend (`jalgaonUi/src/components/LoginSignup/`, `UserContext.jsx`) vs. PRD v1.0 + Industry Standards

---

## 1. Executive Summary

| Category | Score | Status |
|---|---|---|
| PRD Requirements Fulfilled | 2 / 11 | 🔴 Critical Gap |
| Industry Standard Security | 4 / 14 | 🔴 Critical Gap |
| User Experience (UX) | 3 / 8 | 🟡 Partial |
| Code Architecture Quality | 4 / 7 | 🟡 Partial |
| **Overall** | **~30%** | **🔴 Needs Major Work** |

The current authentication system is a **basic password-based login** that was built before the PRD was finalized. The PRD fundamentally mandates an **OTP-first system**. The entire authentication flow needs to be rebuilt with the OTP mechanism as the primary path, while keeping the existing user model as a solid foundation.

---

## 2. What Is Currently Implemented

### 2.1 Backend — `apps/accounts/`

#### ✅ User Model (`models.py`)
- **Custom `User` model** extending `AbstractUser` with `phone_number` as the `USERNAME_FIELD` — correct foundation.
- **All 10 RBAC roles** defined: `super_admin`, `admin`, `content_manager`, `news_editor`, `seo_manager`, `moderator`, `support`, `advertiser`, `business_owner`, `registered_user`, `guest`.
- Helper properties: `is_admin_role`, `is_staff_role` on the User model.
- Custom `UserManager` with `create_user` and `create_superuser`.

#### ✅ JWT Integration (`settings.py`)
- `rest_framework_simplejwt` installed and configured.
- Token blacklist app (`rest_framework_simplejwt.token_blacklist`) is installed.
- `ROTATE_REFRESH_TOKENS = True` and `BLACKLIST_AFTER_ROTATION = True` are enabled.
- Both `JWTAuthentication` and `TokenAuthentication` are registered as fallbacks.

#### ✅ Core API Endpoints (`urls.py`)
- `POST /api/v1/auth/register/` — username/password registration.
- `POST /api/v1/auth/login/` — username/password login with JWT token in response.
- `POST /api/v1/auth/logout/` — session logout.
- `GET /api/v1/auth/user/` — fetch current authenticated user.
- `POST /api/v1/auth/token/` & `POST /api/v1/auth/token/refresh/` — SimpleJWT standard endpoints.
- `GET /api/v1/auth/csrf-token/` — CSRF token endpoint.

#### ✅ Django Admin Integration (`admin.py`)
- `CustomUserAdmin` registered with proper field sets.
- `role` field is missing from the admin display — a minor gap.

#### ✅ OTP Utility (`utils.py`)
- `send_otp()` function exists using **Fast2SMS** (not Twilio as specified in PRD).
- Graceful **mock OTP for development** (prints to console, returns mock success).
- Proper error handling and logging.

### 2.2 Frontend — `LoginSignup.jsx`, `UserContext.jsx`

#### ✅ Login/Register Modal
- React modal component with a toggle between Login and Register forms.
- Phone number + password fields for both forms.
- Loading spinner during API calls.
- Error message display.

#### ✅ JWT Token Handling
- Token stored in `localStorage` on login.
- `Authorization: Bearer <token>` header injected via Axios interceptor.
- User data re-fetched from API on app load (`useEffect` in `UserContext`).

#### ✅ Role-Based Redirects
- After login, users with admin/staff roles are redirected to `/admin`.
- Regular users have the login modal closed after login.

#### ✅ Duplicate Token System (Known Bug)
- The app calls BOTH `/api/v1/auth/login/` (JWT) AND `/api/v1/auth/token-key/` (DRF Token).
- Two different tokens (`token` and `tokenKey`) are saved to `localStorage`.
- This is a legacy artifact that should be unified.

---

## 3. What Is MISSING vs. PRD Requirements

### 3.1 FR-AUTH-01 & 02: OTP Login via Mobile / Email
> **Status: 🔴 MISSING — Critical**

The current system uses **password-based authentication**. The PRD mandates **OTP as the PRIMARY and ONLY login method** for end users (FR-AUTH-01). There is no:
- `OTP` database model to store OTPs.
- `POST /api/v1/auth/send-otp` endpoint.
- `POST /api/v1/auth/verify-otp` endpoint.
- Frontend OTP input UI (6-digit input, countdown timer, resend button).

The `send_otp()` utility in `utils.py` exists but is **not connected to any view or URL**.

### 3.2 FR-AUTH-03: Twilio SMS Gateway
> **Status: 🟡 PARTIAL**

- The `requirements.txt` includes `twilio==9.2.3` (the package is installed).
- The actual `utils.py` uses **Fast2SMS** (`fast2sms.com`), not Twilio.
- The PRD specifies Twilio. Either the PRD needs to be updated (Fast2SMS is actually better for India) OR the implementation needs to align.
- **Recommendation:** Align the PRD to Fast2SMS (better India coverage), but use proper DLT-registered templates.

### 3.3 FR-AUTH-04: OTP Expiry & Retry Limiting
> **Status: 🔴 MISSING**

No `OTPRecord` model exists. There is no:
- 5-minute OTP expiry.
- Maximum 3 retry attempts per OTP.
- OTP invalidation after first successful use.

### 3.4 FR-AUTH-05: Rate Limiting on OTP Requests
> **Status: 🔴 MISSING**

No rate limiting of any kind exists anywhere in the codebase. The PRD requires:
- Max 5 OTP requests per phone per hour (FR-AUTH-05).
- API-wide: 100 req/min per IP (unauthenticated), 500 req/min (authenticated) (NFR-SEC-06).

No `django-ratelimit` or similar package is installed.

### 3.5 FR-AUTH-06 & 07: JWT Expiry + "Remember Me"
> **Status: 🟡 PARTIAL**

- JWT is configured but TTLs are mismatched with PRD:
  - PRD: Access = **15 minutes**, Refresh = **7 days** (30 days with Remember Me).
  - Current: Access = **1 day**, Refresh = **90 days** — far too long.
- No "Remember Me" toggle in the frontend form.
- Long-lived access tokens are a significant security risk.

### 3.6 FR-AUTH-08 & 09: Device Management & "Logout from All Devices"
> **Status: 🔴 MISSING**

No device/session tracking exists. The `token_blacklist` app is installed but there is no:
- `UserDevice` or `UserSession` model.
- Endpoint to list active sessions.
- Endpoint to revoke a specific session.
- "Logout from all devices" endpoint that blacklists all refresh tokens.

### 3.7 FR-AUTH-10: CAPTCHA on OTP Request
> **Status: 🔴 MISSING**

No reCAPTCHA integration exists in either the backend or the frontend.

### 3.8 FR-AUTH-11: Automatic Account Creation on First OTP
> **Status: 🔴 MISSING**

The current system requires explicit **separate registration** before login. The PRD mandates **auto-account creation on first successful OTP verification** — the user should never have to "register" separately.

---

## 4. What Is MISSING vs. Industry Standards

### 4.1 Password Security (CRITICAL for Current System)
> **Status: 🔴 MISSING**

Even with the existing password flow, there is no:
- **Password reset** / forgot-password flow.
- **Email verification** fallback.
- **Account lockout** after N failed login attempts.
- **Brute force protection** on the login endpoint.

The `UserRegisterSerializer` accepts any password with no minimum strength enforcement beyond Django's basic validators (which are configured but not enforced via the serializer with `validate_password()`).

### 4.2 Token Security Architecture
> **Status: 🟡 PARTIAL**

- JWT signing uses **HS256** (symmetric, shared secret). PRD specifies **RS256** (asymmetric) — industry best practice for multi-service or public-key-exposed architectures (NFR-SEC-01).
- Access token lifetime of **1 day** is too long. Industry standard is **15 minutes**.
- `localStorage` token storage is vulnerable to XSS. Industry best practice is **HttpOnly cookies** for refresh tokens.
- The `UserLogout` view calls Django's session `logout()` but does **not blacklist the JWT refresh token**. This means the JWT remains valid after "logout" until its natural expiry.

### 4.3 Missing Email Field on User Model
> **Status: 🔴 MISSING**

The PRD database spec (section 14.1) includes an `email` field on the User model. The current `User` model has no `email` field. This blocks:
- Email OTP fallback (FR-AUTH-02).
- User dashboard profile settings (FR-DASH-07).
- Password reset via email.
- Notification delivery (FR-DASH-06).

### 4.4 Missing `is_verified` Flag on User Model
> **Status: 🔴 MISSING**

The PRD database spec includes an `is_verified` field. No phone verification tracking exists. A user can register and their phone is never actually confirmed to be theirs (since OTP is not yet implemented).

### 4.5 Inconsistent Authentication Classes
> **Status: 🟡 CODE SMELL**

The codebase mixes two token systems:
- Some views use `rest_framework.authentication.TokenAuthentication` (DRF Token).
- Other views use `rest_framework_simplejwt.authentication.JWTAuthentication` (JWT).
- The frontend sends **both** tokens to different endpoints.

This duplication creates maintenance burden and potential security gaps. The system should standardize on JWT only.

### 4.6 Missing Swagger / API Documentation
> **Status: 🔴 MISSING**

PRD section 15.1 requires Swagger/OpenAPI 3.0 docs at `/api/docs/`. No `drf-spectacular` or `drf-yasg` package is installed.

### 4.7 No Audit Logging for Auth Events
> **Status: 🔴 MISSING**

The `apps/audit` app directory exists but no audit events are emitted from the auth module. Industry standard requires logging of:
- Successful logins (with IP, user agent, timestamp).
- Failed login attempts.
- OTP requests and verifications.
- Password changes.
- Session revocations.

### 4.8 No Structured Phone Number Validation
> **Status: 🟡 PARTIAL**

- `phone_number = models.CharField(max_length=13, unique=True)` — max 13 chars.
- The serializer checks length but does not validate phone number format (country code, digits only).
- No library like `phonenumbers` is used.

### 4.9 User Model: `is_verified` Flag Missing
> **Status: 🔴 MISSING**

Without OTP verification, there is no way to confirm that the phone number a user registered with is actually theirs.

### 4.10 No Profile Completion Step
> **Status: 🔴 MISSING**

PRD flow 10.1 step 4: *"On first login: profile creation form (name, email optional)"*. After OTP verification, new users should be prompted to provide their name. The current register form only takes phone + password.

### 4.11 Frontend: Token Stored in localStorage
> **Status: 🟡 Security Concern**

Access tokens in `localStorage` are readable by any JavaScript code on the page (XSS attack vector). Industry best practice:
- **Refresh token** → HttpOnly cookie (not accessible by JS).
- **Access token** → memory only (React state / context), regenerated from the refresh token cookie.

### 4.12 `role` Field Not in Admin Fieldset
> **Status: 🟡 Minor**

The `CustomUserAdmin.fieldsets` in `admin.py` is missing the `role` field under "Personal info" or "Permissions". Admins cannot set user roles from the Django admin panel.

### 4.13 Logout Does Not Blacklist JWT
> **Status: 🔴 Security Bug**

The `UserLogout` view only calls `logout(request)` which clears the Django session. The **JWT access token remains valid** after logout until its natural expiry (1 day). A stolen token will continue to work.

### 4.14 No `email` Field in User Model
> **Status: 🔴 MISSING**

Blocks email OTP fallback, account recovery, and notification system.

---

## 5. Summary Table

### 5.1 PRD Requirements

| Req ID | Description | Status |
|---|---|---|
| FR-AUTH-01 | OTP login via mobile (primary) | 🔴 Missing |
| FR-AUTH-02 | OTP login via email (fallback) | 🔴 Missing |
| FR-AUTH-03 | SMS gateway (Twilio specified, Fast2SMS used) | 🟡 Partial |
| FR-AUTH-04 | OTP expiry 5 min / max 3 retries | 🔴 Missing |
| FR-AUTH-05 | Rate limiting: max 5 OTP/phone/hour | 🔴 Missing |
| FR-AUTH-06 | JWT session, configurable expiry (7 days) | 🟡 Partial (wrong TTLs) |
| FR-AUTH-07 | "Remember Me" extending to 30 days | 🔴 Missing |
| FR-AUTH-08 | Device management & active sessions list | 🔴 Missing |
| FR-AUTH-09 | "Logout from all devices" | 🔴 Missing |
| FR-AUTH-10 | CAPTCHA on OTP request form | 🔴 Missing |
| FR-AUTH-11 | Auto account creation on first OTP | 🔴 Missing |

### 5.2 Industry Standards

| Standard | Description | Status |
|---|---|---|
| IS-01 | RS256 JWT signing | 🔴 Missing (HS256 used) |
| IS-02 | Short-lived access tokens (15 min) | 🔴 Missing (1 day) |
| IS-03 | HttpOnly cookie for refresh token | 🔴 Missing |
| IS-04 | JWT blacklisted on logout | 🔴 Missing (security bug) |
| IS-05 | Account lockout after N failed attempts | 🔴 Missing |
| IS-06 | Brute-force protection on login | 🔴 Missing |
| IS-07 | Phone number verified flag (`is_verified`) | 🔴 Missing |
| IS-08 | Email field on user model | 🔴 Missing |
| IS-09 | Audit log for auth events | 🔴 Missing |
| IS-10 | Swagger/OpenAPI documentation | 🔴 Missing |
| IS-11 | Rate limiting middleware | 🔴 Missing |
| IS-12 | Standardized auth class (JWT only) | 🟡 Mixed (JWT + DRF Token) |
| IS-13 | Phone format validation | 🟡 Partial |
| IS-14 | Role visible in Django Admin | 🟡 Minor gap |

---

## 6. Risk Assessment

| Risk | Severity | Impact |
|---|---|---|
| JWT not blacklisted on logout | 🔴 Critical | Stolen tokens remain valid for 1 day after logout |
| No rate limiting on any endpoint | 🔴 Critical | Brute-force and OTP spam attacks possible |
| No OTP system | 🔴 Critical | Core PRD feature absent; product cannot launch per spec |
| Access token lifetime = 1 day | 🟠 High | Excessive exposure window if token is compromised |
| Token in localStorage | 🟠 High | XSS vulnerability exposes credentials |
| No account lockout | 🟠 High | Password brute-force attacks possible |
| No CAPTCHA | 🟠 High | Bot registration and OTP spam attacks |
| Dual token system | 🟡 Medium | Technical debt, maintenance burden |
| No phone verification flag | 🟡 Medium | Unverified phone numbers in DB |
| No email field | 🟡 Medium | Blocks email OTP fallback and notifications |

---

*End of Auth Audit Report*
