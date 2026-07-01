# Authentication Module — Deferred / Pending Tasks

**Project:** Jalgaon.com — City Digital Ecosystem Platform  
**Document Type:** Pending & Deferred Tasks Register  
**Created:** July 1, 2026  
**Status:** Features intentionally deferred to a later phase

> [!IMPORTANT]
> These items are **NOT skipped permanently**. They are deferred to the next implementation phase after the current security hardening sprint is completed. This document acts as the official backlog for the OTP authentication migration.

---

## Phase Boundary

| Current Phase (In Progress) | Next Phase (Deferred — This Document) |
|---|---|
| JWT hardening, security headers, rate limiting, audit logging, Swagger, Admin fixes, Frontend cleanup | Full OTP authentication system, device management, CAPTCHA, Remember Me |

---

## Deferred PRD Requirements

### FR-AUTH-01: OTP Login via Mobile Number (Primary)
> **Priority: Critical** | **Depends on:** OTPRecord model, Fast2SMS/Twilio integration

- Build `OTPRecord` database model (phone, code, expiry, attempts, is_used)
- Create `POST /api/v1/auth/send-otp/` endpoint
- Create `POST /api/v1/auth/verify-otp/` endpoint
- Auto-create user account on first successful OTP (FR-AUTH-11)
- Invalidate all previous OTPs when a new one is requested
- Wire `send_otp()` utility (already exists in `utils.py`) to the new view

---

### FR-AUTH-02: OTP Login via Email (Fallback)
> **Priority: Medium** | **Depends on:** FR-AUTH-01, Email field on User model

- Build email OTP delivery (using Django's `send_mail` or SendGrid)
- Allow user to choose between SMS OTP and email OTP
- Email OTP must follow same expiry/retry rules as SMS OTP

---

### FR-AUTH-03: SMS Gateway — Align PRD with Fast2SMS
> **Priority: High** | **Depends on:** DLT registration

- PRD currently specifies Twilio; current code uses Fast2SMS
- **Action:** Update PRD v1.1 to officially specify Fast2SMS as the SMS provider for India
- Register DLT-approved message templates with Fast2SMS before production OTP launch
- Test OTP delivery across all Indian telecom operators (Jio, Airtel, Vi, BSNL)
- Add Twilio as a secondary fallback for international numbers (future)

---

### FR-AUTH-04: OTP Expiry (5 min) + Max 3 Retry Attempts
> **Priority: Critical** | **Depends on:** OTPRecord model

- 5-minute expiry window enforced at DB level (`expires_at` field)
- Max 3 verification attempts per OTP (`attempts` counter)
- OTP permanently invalidated after 3 failures (must request new OTP)
- OTP immediately invalidated after first successful use (`is_used=True`)

---

### FR-AUTH-05: Rate Limiting on OTP Requests (5/phone/hour)
> **Priority: High** | **Depends on:** FR-AUTH-01

- Max 5 OTP send requests per phone number per hour
- Implemented using DB-level count query on `OTPRecord`
- Return `HTTP 429 Too Many Requests` on breach
- Separate from global API rate limiting (which is implemented in the current phase)

---

### FR-AUTH-07: "Remember Me" (30-day Refresh Token)
> **Priority: Medium** | **Depends on:** OTP flow, Frontend UI

- Add `remember_me: boolean` field to the OTP verify request body
- If `remember_me = true`: issue refresh token with 30-day TTL
- If `remember_me = false`: issue refresh token with 7-day TTL (default)
- Add "Remember Me" checkbox to the frontend OTP verification screen

---

### FR-AUTH-08: Device Management — List Active Sessions
> **Priority: Medium** | **Depends on:** OTP flow, UserSession model

- Create `UserSession` model: `user`, `device_name`, `ip_address`, `user_agent`, `last_active`, `refresh_token_jti`
- Log every successful OTP login as a new `UserSession` record
- `GET /api/v1/auth/sessions/` — list all active sessions for the logged-in user
- `DELETE /api/v1/auth/sessions/{id}/` — revoke a specific session (blacklist its JWT)
- Show sessions list in User Dashboard settings page

---

### FR-AUTH-09: "Logout from All Devices"
> **Priority: Medium** | **Depends on:** UserSession model

> [!NOTE]
> The `POST /api/v1/auth/logout-all/` endpoint itself is **partially implemented** in the current phase (using `OutstandingToken` bulk blacklist). However, the full version — which also deletes `UserSession` records and provides the user a UI to manage it — requires the `UserSession` model first.

- Delete all `UserSession` records for the user
- Blacklist all outstanding refresh tokens via `token_blacklist`
- Notify user via SMS/email that all sessions were terminated (future notification system)

---

### FR-AUTH-10: CAPTCHA on OTP Request Form
> **Priority: High** | **Depends on:** FR-AUTH-01, Google reCAPTCHA account

- Add Google reCAPTCHA v3 to backend OTP send endpoint
- Backend validates `captcha_token` from request against Google's API
- Minimum score threshold: 0.5 (rejects likely bots)
- Frontend: Add `react-google-recaptcha-v3` to the OTP phone entry form
- Add `RECAPTCHA_SECRET_KEY` and `RECAPTCHA_SITE_KEY` to GitHub Secrets and `.env.production`

---

### FR-AUTH-11: Auto Account Creation on First OTP Verification
> **Priority: Critical** | **Depends on:** FR-AUTH-01, FR-AUTH-04

- On OTP verification, call `User.objects.get_or_create(phone_number=...)`
- New users (`is_new_user=True`) are prompted with profile completion step (name, optional email)
- Existing users are logged in immediately without profile prompt
- New user account defaults: `role='registered_user'`, `is_verified=True'`, `is_active=True`

---

## Deferred Industry Standard Items

### IS-01: RS256 Asymmetric JWT Signing
> **Priority: Low** | **Reason for deferral:** Adds infrastructure complexity; only needed when multiple services verify tokens independently

- Generate RSA key pair (private key for signing, public key for verification)
- Configure `ALGORITHM = 'RS256'` in `SIMPLE_JWT` settings
- Expose public key at `/api/v1/.well-known/jwks.json`
- Useful when a mobile app or third-party service needs to verify tokens independently

---

### IS-03: HttpOnly Cookie for Refresh Token Storage
> **Priority: High** | **Reason for deferral:** Requires CORS cookie configuration changes that are complex to test correctly; will be implemented together with the OTP session flow

- Set refresh token in `HttpOnly; Secure; SameSite=Strict` cookie via Django response
- Never send refresh token in the JSON response body (XSS protection)
- Access token remains in memory (React Context), NOT in localStorage
- Configure `SESSION_COOKIE_HTTPONLY = True` and `CSRF_COOKIE_HTTPONLY = True` in settings

---

## New GitHub Secrets to Add (When OTP Phase Starts)

| Secret | Description | When Needed |
|---|---|---|
| `FAST2SMS_API_KEY` | Fast2SMS SMS gateway key for OTP delivery | FR-AUTH-01 |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA v3 backend secret | FR-AUTH-10 |
| `RECAPTCHA_SITE_KEY` | Google reCAPTCHA v3 frontend site key | FR-AUTH-10 |

---

## Prerequisites Before Starting OTP Phase

Before beginning the OTP implementation phase, ensure these are done:

- [ ] DLT (Distributed Ledger Technology) registration for SMS templates in India
- [ ] Fast2SMS account with sufficient credits and template approved
- [ ] Google reCAPTCHA v3 site registered at `console.cloud.google.com`
- [ ] All items from the current implementation phase (auth hardening sprint) completed and deployed
- [ ] `UserSession` model designed and reviewed with the team

---

*This document is the official backlog entry for the OTP Authentication Phase. Reference: Auth Audit Report + PRD v1.0 §6.1*
