# Authentication Module — Manual Testing Guide

This guide describes how to manually test and verify the security upgrades and JWT integration made during the **Auth Security Hardening Sprint (Non-OTP)**.

---

## Prerequisites
1. Django server is running locally:
   ```bash
   .venv\Scripts\python.exe manage.py runserver
   ```
2. Vite frontend is running locally:
   ```bash
   npm run dev
   ```
3. Open browser Developer Tools (F12) and go to the **Application** (Chrome/Edge) or **Storage** (Firefox) tab to inspect `Local Storage`.

---

## Test Case 1: Phone Number & Password Validation

### Step 1: Invalid Phone Number format
1. Open the platform in your browser.
2. Click on **Login / Sign Up** and toggle to **Sign Up**.
3. Enter an invalid phone number (e.g. `12345`, `abcdefgh`).
4. Type a password and submit.
*   **Expected Result:** The frontend validates the format, or the backend returns `400 Bad Request` with: `"Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."`

### Step 2: Password Strength Check
1. Try to register with a weak password (e.g. `123456`, `password123`).
2. Submit the form.
*   **Expected Result:** Validation fails with feedback from Django's password policy (e.g., must contain minimum length, not be too common).

### Step 3: Success Normalization
1. Register with `+91 98765 43210` or `09876543210`.
2. Submit with a strong password (e.g. `Jalgaon@2026_Secure`).
*   **Expected Result:** The registration succeeds, and the number is saved in the database in normalized format: `9876543210`.

---

## Test Case 2: Brute-Force Account Lockout

### Step 1: Trigger Lockout
1. Open the Login modal.
2. Enter a registered phone number.
3. Enter a **wrong password** and submit. Repeat this 5 times.
*   **Expected Result:** 
    *   Attempts 1 to 4: The modal displays an error telling you how many attempts are remaining before lockout (e.g. `"Invalid credentials. 3 attempts remaining before lockout."`).
    *   Attempt 5: The request fails with `429 Too Many Requests` status, and the screen displays: `"Account temporarily locked due to too many failed attempts. Please try again in 15 minutes."`

### Step 2: Verify Log entry
1. Log in to the Django Admin panel at `http://localhost:8000/admin/`.
2. Go to the **Login Attempts** table.
*   **Expected Result:** You see 5 failed login attempts logged with the IP address, timestamp, and User Agent of the browser.

---

## Test Case 3: JWT Session Refresh Interceptor

### Step 1: Initial Login
1. Clear your browser local storage.
2. Log in with correct credentials.
*   **Expected Result:** 
    *   You are logged in successfully.
    *   In Local Storage, you should see:
        *   `token`: The JWT access token (valid for 15 minutes).
        *   `refresh_token`: The JWT refresh token (valid for 7 days).
        *   `user`: Your parsed user object.
        *   *Note: The old DRF token key `tokenKey` must not exist.*

### Step 2: Automatic Token Refresh
1. Wait 15 minutes (or artificially modify the token lifetime locally or delete the `token` key to simulate expiration).
2. Perform any authenticated action in the app (e.g., submit a mock review or add listing).
*   **Expected Result:** 
    *   The browser sends a request to `/api/v1/auth/token/refresh/` automatically.
    *   The backend responds with a brand new access token.
    *   The frontend saves the new access token under the `'token'` key in Local Storage and retries your original action without any interruption or asking you to sign in again.

---

## Test Case 4: Logout Blacklisting

### Step 1: Log Out
1. Click the **Logout** button.
*   **Expected Result:** 
    *   `token` and `refresh_token` are completely removed from your browser's Local Storage.
    *   In the database's `BlacklistedToken` table, the refresh token is registered.

### Step 2: Invalidate Old Access Token
1. Try to send a manual API request using the old `token` you logged out from (e.g. using Postman or curl).
*   **Expected Result:** The backend rejects the request immediately with `401 Unauthorized` and the message `"Token is blacklisted"`.

---

## Test Case 5: Logout from All Devices

1. Log in to the platform from two different browsers (e.g., Chrome and Firefox).
2. On one browser, click **Logout from all devices** (or trigger a POST request to `/api/v1/auth/logout-all/`).
*   **Expected Result:** Both browser sessions are immediately invalidated. If you try to navigate on the other browser, the interceptor redirects you to the login screen.

---

## Test Case 6: Interactive Swagger Documentation

1. Open your browser and navigate to `http://localhost:8000/api/docs/`.
*   **Expected Result:** 
    *   The interactive Swagger UI page loads showing all available `/api/v1/` endpoints.
    *   Click on **Authorize** in the top right, enter your JWT token, and verify that you can run authenticated API requests directly from your browser.
