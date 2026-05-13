# Google OAuth (Firebase) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Continue with Google" sign-in and sign-up to LoginPage and RegisterPage using Firebase, issuing the same JWT + refresh-token cookie the rest of the app already uses.

**Architecture:** The Firebase client SDK triggers a Google popup, returns a signed ID token, which the frontend POSTs to a new `POST /auth/google` endpoint. The backend verifies the token with Firebase Admin SDK, finds or creates the user in MySQL, and returns `{ user, accessToken }` + sets the `refreshToken` httpOnly cookie — identical to the existing login response shape.

**Tech Stack:** `firebase ^12.12.0` (already installed), `firebase-admin ^13.8.0` (already installed), Sequelize + MySQL, Express, JWT (all existing), Jest + Supertest (existing).

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `database/schema.sql` | Make `password_hash` nullable; add `google_uid` column |
| Modify | `backend/models/User.js` | Mirror schema changes; guard `comparePassword` |
| Create | `backend/tests/auth.google.test.js` | Tests for `POST /auth/google` |
| Modify | `backend/controllers/auth.controller.js` | Add `googleAuth` function + firebase import |
| Modify | `backend/routes/auth.routes.js` | Register `POST /auth/google` |
| Create | `frontend/src/config/firebase.js` | Firebase app + auth + googleProvider init |
| Create | `frontend/src/services/googleAuth.js` | `signInWithGoogle()` helper |
| Modify | `frontend/src/pages/LoginPage.jsx` | Google button + "or" divider |
| Modify | `frontend/src/pages/RegisterPage.jsx` | Google button + "or" divider |

---

### Task 1: Update DB schema and User model

**Files:**
- Modify: `database/schema.sql`
- Modify: `backend/models/User.js`

- [ ] **Step 1: Update the CREATE TABLE users statement in schema.sql**

In `database/schema.sql`, the `users` table currently starts at line 12. Make two changes:

Change (line 16):
```sql
  password_hash TEXT        NOT NULL,
```
To:
```sql
  password_hash TEXT        NULL,
```

Add `google_uid` after `avatar_url TEXT,` and add its unique key. The final `users` table block should be:
```sql
CREATE TABLE IF NOT EXISTS users (
  id           CHAR(36)     NOT NULL DEFAULT (UUID()),
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL,
  password_hash TEXT        NULL,
  role         ENUM('student','technician','admin') NOT NULL DEFAULT 'student',
  is_verified  TINYINT(1)   NOT NULL DEFAULT 0,
  department   VARCHAR(100),
  phone        VARCHAR(20),
  avatar_url   TEXT,
  google_uid   VARCHAR(128) NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY idx_email (email),
  UNIQUE KEY idx_google_uid (google_uid),
  KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- [ ] **Step 2: Make password_hash nullable in User.js**

In `backend/models/User.js`, change:
```js
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
```
To:
```js
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
```

- [ ] **Step 3: Add google_uid field to User.js**

In `backend/models/User.js`, after `avatar_url: DataTypes.TEXT,`, add:
```js
  google_uid: {
    type: DataTypes.STRING(128),
    allowNull: true,
    unique: true,
  },
```

- [ ] **Step 4: Guard comparePassword against null hash**

In `backend/models/User.js`, replace:
```js
User.prototype.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password_hash);
};
```
With:
```js
User.prototype.comparePassword = async function (plain) {
  if (!this.password_hash) return false;
  return bcrypt.compare(plain, this.password_hash);
};
```

- [ ] **Step 5: Commit**

```bash
git add database/schema.sql backend/models/User.js
git commit -m "feat: make password_hash nullable and add google_uid to users table"
```

---

### Task 2: Write failing tests for POST /auth/google

**Files:**
- Create: `backend/tests/auth.google.test.js`

- [ ] **Step 1: Create the test file**

Create `backend/tests/auth.google.test.js`. The `jest.mock` call must be first — Jest hoists it so the Firebase module is replaced before `app` or `auth.controller` loads.

```js
jest.mock('../config/firebase', () => ({
  admin: {
    auth: () => ({ verifyIdToken: jest.fn() }),
  },
}));

const request = require('supertest');
const { admin } = require('../config/firebase');
const mockVerifyIdToken = admin.auth().verifyIdToken;

const app = require('../app');
const { sequelize } = require('../config/database');
const { User } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

beforeEach(() => {
  mockVerifyIdToken.mockReset();
});

describe('POST /auth/google', () => {
  it('returns 400 when idToken is missing', async () => {
    const res = await request(app)
      .post('/auth/google')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/idToken required/i);
  });

  it('returns 401 when Firebase token is invalid', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Firebase: invalid token'));

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'bad-token' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid google token/i);
  });

  it('returns 401 when Google email is not verified', async () => {
    mockVerifyIdToken.mockResolvedValue({
      email: 'unverified@campus.edu',
      name: 'Unverified User',
      uid: 'uid-unverified',
      email_verified: false,
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'unverified-token' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/not verified/i);
  });

  it('creates a new student and returns accessToken', async () => {
    mockVerifyIdToken.mockResolvedValue({
      email: 'newstudent@campus.edu',
      name: 'New Student',
      uid: 'uid-new-001',
      email_verified: true,
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'valid-token-new' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('newstudent@campus.edu');
    expect(res.body.user.role).toBe('student');
    expect(res.body.user.is_verified).toBe(true);
    expect(res.body.accessToken).toBeDefined();
  });

  it('links google_uid to an existing student account with the same email', async () => {
    await User.create({
      name: 'Existing Student',
      email: 'existing@campus.edu',
      password_hash: 'some-hashed-pw',
      is_verified: true,
      role: 'student',
    });

    mockVerifyIdToken.mockResolvedValue({
      email: 'existing@campus.edu',
      name: 'Existing Student',
      uid: 'uid-link-002',
      email_verified: true,
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'valid-token-link' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('existing@campus.edu');

    const user = await User.findOne({ where: { email: 'existing@campus.edu' } });
    expect(user.google_uid).toBe('uid-link-002');
  });

  it('returns 403 when email belongs to a technician', async () => {
    await User.create({
      name: 'Tech User',
      email: 'tech@campus.edu',
      password_hash: 'some-hashed-pw',
      is_verified: true,
      role: 'technician',
    });

    mockVerifyIdToken.mockResolvedValue({
      email: 'tech@campus.edu',
      name: 'Tech User',
      uid: 'uid-tech-003',
      email_verified: true,
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'tech-token' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/email\/password/i);
  });

  it('returns 403 when email belongs to an admin', async () => {
    await User.create({
      name: 'Admin User',
      email: 'admin@campus.edu',
      password_hash: 'some-hashed-pw',
      is_verified: true,
      role: 'admin',
    });

    mockVerifyIdToken.mockResolvedValue({
      email: 'admin@campus.edu',
      name: 'Admin User',
      uid: 'uid-admin-004',
      email_verified: true,
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'admin-token' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/email\/password/i);
  });

  it('returns 403 when the account is deactivated', async () => {
    await User.create({
      name: 'Inactive Student',
      email: 'inactive@campus.edu',
      google_uid: 'uid-inactive-005',
      is_verified: true,
      role: 'student',
      status: 'inactive',
    });

    mockVerifyIdToken.mockResolvedValue({
      email: 'inactive@campus.edu',
      name: 'Inactive Student',
      uid: 'uid-inactive-005',
      email_verified: true,
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'inactive-token' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/deactivated/i);
  });
});
```

- [ ] **Step 2: Run tests and confirm they all fail**

```bash
cd backend
npm test -- --testPathPattern=auth.google
```

Expected: 8 tests FAIL. Most will report something like `expected 400 received 404` — the route does not exist yet. If any pass unexpectedly, investigate before continuing.

- [ ] **Step 3: Commit the test file**

```bash
git add backend/tests/auth.google.test.js
git commit -m "test: add failing tests for POST /auth/google"
```

---

### Task 3: Implement googleAuth controller and route

**Files:**
- Modify: `backend/controllers/auth.controller.js`
- Modify: `backend/routes/auth.routes.js`

- [ ] **Step 1: Add the firebase import at the top of auth.controller.js**

After the existing `require` statements (after the `uuid` line), add:
```js
const { admin } = require('../config/firebase');
```

- [ ] **Step 2: Add the googleAuth function before module.exports**

Add this function immediately before the `module.exports` block:

```js
async function googleAuth(req, res) {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken required' });

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Google token' });
  }

  const { email, name, uid, email_verified } = decoded;

  if (!email_verified) {
    return res.status(401).json({ error: 'Google email not verified' });
  }

  let user = await User.findOne({ where: { email } });

  if (user) {
    if (user.role === 'admin' || user.role === 'technician') {
      return res.status(403).json({ error: 'Admins and technicians must use email/password' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account has been deactivated' });
    }
    if (!user.google_uid) {
      user.google_uid = uid;
    }
    user.is_verified = true;
    await user.save();
  } else {
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      google_uid: uid,
      is_verified: true,
      password_hash: null,
    });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await signRefreshToken(user.id);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, is_verified: user.is_verified },
    accessToken,
  });
}
```

- [ ] **Step 3: Export googleAuth**

Add `googleAuth` to the `module.exports` block:
```js
module.exports = {
  resendOtp,
  register,
  verifyOtp,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getTechnicians,
  getMySkills,
  updateMySkills,
  googleAuth,
};
```

- [ ] **Step 4: Register the route in auth.routes.js**

Add `googleAuth` to the destructured import:
```js
const {
  resendOtp,
  register,
  verifyOtp,
  login,
  refreshToken,
  logout,
  getMe,
  getTechnicians,
  updateProfile,
  changePassword,
  getMySkills,
  updateMySkills,
  googleAuth,
} = require('../controllers/auth.controller');
```

Add the route after `router.post('/logout', logout);`:
```js
router.post('/google', googleAuth);
```

- [ ] **Step 5: Run the Google auth tests and confirm they all pass**

```bash
cd backend
npm test -- --testPathPattern=auth.google
```

Expected: 8 tests PASS. If any fail, check that the error string in the controller matches the regex in the test (case-insensitive).

- [ ] **Step 6: Run the full test suite to confirm no regressions**

```bash
cd backend
npm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add backend/controllers/auth.controller.js backend/routes/auth.routes.js
git commit -m "feat: implement POST /auth/google with Firebase token verification"
```

---

### Task 4: Create frontend Firebase config

**Files:**
- Create: `frontend/src/config/firebase.js`

**Prerequisite:** Fill in `frontend/.env` with real values from Firebase Console → Project Settings → Your apps → Web app config. Enable **Google** as a Sign-in provider in Firebase Console → Authentication → Sign-in method.

- [ ] **Step 1: Create frontend/src/config/firebase.js**

```js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/config/firebase.js
git commit -m "feat: add Firebase client config for Google auth"
```

---

### Task 5: Create signInWithGoogle service

**Files:**
- Create: `frontend/src/services/googleAuth.js`

- [ ] **Step 1: Create frontend/src/services/googleAuth.js**

```js
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from './api';

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  const { data } = await api.post('/auth/google', { idToken });
  return data;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/googleAuth.js
git commit -m "feat: add signInWithGoogle service (Firebase popup + backend token exchange)"
```

---

### Task 6: Add Google button to LoginPage

**Files:**
- Modify: `frontend/src/pages/LoginPage.jsx`

- [ ] **Step 1: Add the import**

Add to the existing imports at the top:
```js
import { signInWithGoogle } from '../services/googleAuth';
```

- [ ] **Step 2: Add handleGoogleLogin inside the component**

After the `handleLogin` function, add:
```js
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await signInWithGoogle();
      login(data.user, data.accessToken);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'technician') navigate('/staff');
      else navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User dismissed — show nothing
      } else if (err.code === 'auth/popup-blocked') {
        setError('Please allow popups for this site to use Google sign-in.');
      } else {
        setError(err.response?.data?.error || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
```

- [ ] **Step 3: Replace the footer section with divider + Google button + footer**

Find and replace this block:
```jsx
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-link">
              Create an account
            </Link>
          </p>
        </div>
```

Replace with:
```jsx
        <div className="flex items-center gap-3 mt-8 mb-4">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: '#ffffff', color: '#1f1f1f', border: '1px solid var(--border)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-link">
              Create an account
            </Link>
          </p>
        </div>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/LoginPage.jsx
git commit -m "feat: add Google sign-in button to LoginPage"
```

---

### Task 7: Add Google button to RegisterPage

**Files:**
- Modify: `frontend/src/pages/RegisterPage.jsx`

- [ ] **Step 1: Update the import block**

`RegisterPage` currently does not import `useNavigate`, `useAuth`, or `signInWithGoogle`. Replace the current import block with:

```js
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import OtpVerification from '../components/OtpVerification';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../services/googleAuth';
```

- [ ] **Step 2: Add useAuth, useNavigate, and handleGoogleRegister inside the component**

At the top of the `RegisterPage` component body, after the existing `useState` declarations, add:

```js
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await signInWithGoogle();
      login(data.user, data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User dismissed — show nothing
      } else if (err.code === 'auth/popup-blocked') {
        setError('Please allow popups for this site to use Google sign-in.');
      } else {
        setError(err.response?.data?.error || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
```

- [ ] **Step 3: Replace the footer in the Step 1 JSX**

Find and replace this block inside the `step === 1` branch:
```jsx
            <div className="mt-8 text-center pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" className="text-link">
                  Log in here
                </Link>
              </p>
            </div>
```

Replace with:
```jsx
            <div className="flex items-center gap-3 mt-6 mb-4">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#ffffff', color: '#1f1f1f', border: '1px solid var(--border)' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" className="text-link">
                  Log in here
                </Link>
              </p>
            </div>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/RegisterPage.jsx
git commit -m "feat: add Google sign-up button to RegisterPage"
```

---

### Task 8: Run the full test suite and manual smoke test

- [ ] **Step 1: Run all backend tests**

```bash
cd backend
npm test
```

Expected: all tests pass including the 8 new `auth.google.test.js` tests. Zero failures.

- [ ] **Step 2: Start both dev servers**

Terminal 1:
```bash
cd backend && npm run dev
```

Terminal 2:
```bash
cd frontend && npm run dev
```

- [ ] **Step 3: Smoke test LoginPage**

Open `http://localhost:5173/login`. Verify:
- "or" divider and "Continue with Google" white button appear below the sign-in form
- Clicking the button opens a Google account picker popup
- Selecting a Google account logs in and redirects to `/dashboard`
- Closing the popup without selecting shows no error message

- [ ] **Step 4: Smoke test RegisterPage**

Open `http://localhost:5173/register`. Verify:
- "or" divider and "Continue with Google" button appear below the registration form
- Clicking it opens the popup, completes sign-up, and redirects to `/dashboard` with no OTP step
- If the same Google account is used again, it logs in to the existing account (no duplicate)

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve issues found during manual Google OAuth smoke test"
```

---

## Environment Setup Reminder

`frontend/.env.example` already contains all required Firebase vars. Before running:

```
VITE_FIREBASE_API_KEY=        # Firebase Console → Project Settings → Web app
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Enable **Google** sign-in: Firebase Console → Authentication → Sign-in method → Google → Enable.

Backend Firebase credentials (`FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` etc.) are already documented in `backend/.env.example` and handled by the existing `backend/config/firebase.js`.
