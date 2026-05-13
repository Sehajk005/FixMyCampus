# Google OAuth (Firebase) — Design Spec

**Date:** 2026-05-13
**Project:** FixMyCampus Phase 5
**Status:** Approved

---

## Overview

Add "Sign in with Google" to the Login and Register pages using Firebase Authentication. The frontend triggers a Google popup via the Firebase client SDK, obtains a Firebase ID token, and exchanges it with the backend for the existing JWT + refresh-token-cookie session. No new packages are required — `firebase` is already installed on the frontend and `firebase-admin` on the backend.

**Scope:**
- Students only (technicians and admins must use email/password)
- Google users are auto-verified (`is_verified = true`) — no OTP step
- Same email as an existing password account → accounts are linked (no duplicate)

---

## Architecture & Data Flow

```
Frontend                     Backend                      MySQL DB
────────                     ───────                      ────────
[Google Button clicked]
    │
    ▼
Firebase SDK
(signInWithPopup)
    │ Google OAuth popup
    │ ← user picks account
    │
    ▼
Firebase ID Token
    │
    ▼
POST /auth/google
{ idToken }
    │                         ▼
    │              firebase.admin.verifyIdToken(idToken)
    │                         │
    │                    { email, name, uid, email_verified }
    │                         │
    │              User.findOne({ email })
    │                         │
    │               ┌─── found? ──────────────────────────┐
    │               │ YES (email match)                   │ NO (new user)
    │               │                                     │
    │        link google_uid if not set             User.create({
    │        set is_verified = true                   name, email,
    │                                                 google_uid: uid,
    │                                                 is_verified: true,
    │                                                 password_hash: null
    │                                               })
    │               └─────────────────────────────────────┘
    │                         │
    │              signAccessToken(user)
    │              signRefreshToken(user.id)
    │              set refreshToken cookie
    │                         │
    ◄─── { user, accessToken } ──────────────────────────
    │
AuthContext.login(user, token)
    │
navigate by role
```

---

## Database & Model Changes

### 1. `password_hash` — make nullable

Google users have no password. Change `allowNull: false` → `allowNull: true` in the Sequelize model and drop the NOT NULL constraint in the DB schema migration.

### 2. `google_uid` — new column

| Column | Type | Constraints |
|--------|------|-------------|
| `google_uid` | `VARCHAR(128)` | `NULL`, unique index |

Stores the Firebase UID. Nullable — password-only users won't have one. Indexed for fast lookup.

### 3. `comparePassword` guard

Add a null-check guard so calling `comparePassword` on a Google-only user (null `password_hash`) returns `false` instead of throwing.

### SQL migration

```sql
ALTER TABLE users
  MODIFY COLUMN password_hash TEXT NULL,
  ADD COLUMN google_uid VARCHAR(128) NULL UNIQUE AFTER avatar_url;
```

---

## Backend API

### New endpoint: `POST /auth/google`

Public route (no `authMiddleware`). Added to `backend/routes/auth.routes.js`.

**Request body:** `{ idToken: string }`

**Steps:**
1. `firebase.admin.auth().verifyIdToken(idToken)` — throws if invalid/expired
2. Extract `email`, `name`, `uid`, `email_verified` from decoded token
3. If `email_verified` is `false` → 401 `"Google email not verified"`
4. `User.findOne({ where: { email } })`
   - Found, role is `admin` or `technician` → 403 `"Admins and technicians must use email/password"`
   - Found, role is `student` → update `google_uid` if not already set, set `is_verified = true`, save
   - Not found → `User.create({ name, email, google_uid: uid, is_verified: true, password_hash: null })`
5. `user.status !== 'active'` → 403 `"Account has been deactivated"`
6. `signAccessToken(user)` + `signRefreshToken(user.id)`
7. Set `refreshToken` httpOnly cookie
8. Return `{ user: { id, name, email, role, is_verified }, accessToken }`

**New files/changes:**
- `backend/controllers/auth.controller.js` — add `googleAuth` function
- `backend/routes/auth.routes.js` — add `router.post('/google', googleAuth)`

---

## Frontend Changes

### New file: `frontend/src/config/firebase.js`

Initializes the Firebase app using Vite env vars and exports `auth` and `googleProvider`.

```js
// env vars required:
// VITE_FIREBASE_API_KEY
// VITE_FIREBASE_AUTH_DOMAIN
// VITE_FIREBASE_PROJECT_ID
// VITE_FIREBASE_APP_ID
```

### New file: `frontend/src/services/googleAuth.js`

Exports a single function `signInWithGoogle()`:
1. `signInWithPopup(auth, googleProvider)` via Firebase SDK
2. `result.user.getIdToken()` — gets Firebase ID token
3. `api.post('/auth/google', { idToken })` — exchanges for JWT
4. Returns `{ user, accessToken }`

### `frontend/src/pages/LoginPage.jsx`

- Add an "or" divider below the existing form
- Add a "Continue with Google" button that calls `signInWithGoogle()`, then `AuthContext.login(user, token)`, then navigates by role
- Error handling: show error banner for popup-blocked, network errors, 403 (wrong role), etc.

### `frontend/src/pages/RegisterPage.jsx`

- Add the same "Continue with Google" button to Step 1 (the form step)
- On success, calls `AuthContext.login(user, token)` and navigates directly — no OTP step
- Add an "or" divider between the Google button and the form

### Styling

- Button uses existing `auth-card` design variables
- Google logo inline SVG
- White button with dark text on dark card background — differentiated from `btn-primary`
- No new CSS classes

### Files not changed

`AuthContext.jsx`, `ProtectedRoute.jsx`, `api.js`, `App.jsx`, any non-auth pages.

---

## Environment Variables

### Frontend (`.env` / `.env.example`)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

### Backend

Already configured via `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` or similar (see `backend/config/firebase.js`). No new env vars needed.

---

## Error Handling

| Scenario | Response |
|---|---|
| User closes popup | Firebase `auth/popup-closed-by-user` — caught silently, no error shown |
| Popup blocked by browser | Firebase `auth/popup-blocked` — show: "Please allow popups for this site" |
| Invalid/expired Firebase token | 401 `"Invalid Google token"` |
| Google email not verified | 401 `"Google email not verified"` |
| Admin or technician email | 403 `"Admins and technicians must use email/password"` |
| Deactivated account | 403 `"Account has been deactivated"` |
| Network error | Axios error banner (existing pattern in LoginPage/RegisterPage) |

---

## What Is NOT Changed

- Email/password login and registration flows
- OTP verification flow
- `AuthContext`, `ProtectedRoute`, `api.js`
- Any non-auth pages or backend routes
- Refresh token rotation logic
- Admin and technician auth paths
