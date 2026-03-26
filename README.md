# 🏫 Fix My Campus

[![CI](https://github.com/Sehajk005/FixMyCampus/actions/workflows/ci.yml/badge.svg)](https://github.com/Sehajk005/FixMyCampus/actions/workflows/ci.yml)

> **Campus Complaint Management System** — Chitkara University Phase 1 Draft  
> A full-stack web application where students report campus issues, staff resolves them, and admins manage everything in real time.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Team & Contributions](#-team--contributions)
- [Features Demonstrated](#-features-demonstrated)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Demo Credentials](#-demo-credentials)
- [API Endpoints](#-api-endpoints)
- [Demo Script](#-demo-script-5-minutes)
- [Branch Strategy](#-branch-strategy)

---

## 🎯 Project Overview

**Fix My Campus** is a campus complaint management web application built for Chitkara University. Students submit complaints about campus issues — electrical faults, Wi-Fi outages, plumbing problems, cleanliness, and more. Each complaint becomes a tracked ticket with a full status lifecycle, real-time chat between students and staff, and an admin dashboard for oversight.

### The Problem We Solve
Previously, students had no formal way to report campus issues — complaints were made verbally or over WhatsApp with no tracking, no accountability, and no transparency on resolution status. Fix My Campus gives every complaint a ticket number, an assigned technician, and a live status update.

### Three Portals in One App
| Portal | For | What They Can Do |
|--------|-----|-----------------|
| 🎓 Student | Students | Submit complaints, track status, live chat with staff |
| 🔧 Staff | Technicians | View assigned tasks, update progress, mark resolved |
| 👑 Admin | Admin | View all tickets, assign to technicians, change status, view stats |

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18 | Frontend SPA with Vite build tool |
| **Node.js + Express** | 20 / 4.x | Backend REST API server |
| **MySQL** | 8.0 | Primary relational database |
| **Sequelize ORM** | 6.x | Database models, migrations, associations |
| **Socket.io** | 4.x | Real-time bi-directional chat |
| Tailwind CSS | 3.x | Utility-first styling |
| React Router | v6 | Client-side routing & protected routes |
| JWT | — | Stateless authentication (15min access + 7d refresh) |
| Nodemailer | — | OTP email delivery via Gmail SMTP |
| bcryptjs | — | Password hashing (12 rounds) |
| Jest + Supertest | — | Backend integration testing |
| GitHub Actions | — | CI/CD pipeline |

---

## 👥 Team & Contributions

### ⚙️ Satvik Gupta(Member 1) — Backend Developer
**Branch:** `feature/backend`  
**Tech:** Node.js · Express · JWT · Nodemailer · bcryptjs

**What I built:**
- Scaffolded the entire Node.js + Express project using MVC folder structure (`routes/`, `controllers/`, `middleware/`, `config/`)
- `GET /api/health` — server health check endpoint
- `POST /auth/send-otp` — generates a 6-digit OTP, stores it in `otp_tokens` table, emails it via **Nodemailer + Gmail SMTP** in under 30 seconds
- `POST /auth/register` — validates OTP, hashes password with **bcrypt (12 rounds)**, creates user, returns JWT access token + refresh token
- `POST /auth/login` — verifies credentials, issues **JWT access token (15 min)** + refresh token (7 days)
- `authMiddleware` — verifies JWT on every protected route, attaches `req.user`, returns 401 on failure
- `POST /tickets`, `GET /tickets/mine`, `GET /tickets/:id` — full ticket CRUD
- `PATCH /tickets/:id` — admin changes status/assignment; technician advances their own ticket
- `POST /auth/refresh` — issues new access token without re-login

**Files:** `backend/server.js`, `backend/app.js`, `backend/routes/`, `backend/controllers/`, `backend/middleware/`, `backend/config/database.js`, `backend/config/mailer.js`

---

### 🎨 Sam Choudhary(Member 2) — Frontend Developer
**Branch:** `feature/frontend`  
**Tech:** React 18 · Vite · Tailwind CSS · React Router v6 · Socket.io-client · Axios

**What I built:**
- Bootstrapped React 18 app with **Vite**, configured Tailwind CSS + PostCSS
- **React Router v6** with all routes and role-based redirects (admin → `/admin`, staff → `/staff`, student → `/dashboard`)
- **AuthContext** — global JWT state persisted to `sessionStorage` so refresh doesn't log the user out
- **ProtectedRoute**, **AdminRoute**, **StaffRoute** — redirect unauthorized users
- **Login & Register pages** — 2-step OTP registration flow with animated progress
- **Student Dashboard** — stat cards, category quick-links, recent tickets
- **My Tickets** — status badges, priority indicators, ticket list
- **New Ticket** — visual category grid selector, priority buttons
- **Ticket Detail + Live Chat** — Socket.io real-time message bubbles, auto-scroll
- **Admin Dashboard** — stats, status breakdown bars, category breakdown
- **Admin Tickets** — inline status + technician assignment dropdowns
- **Staff Dashboard** — assigned tasks, "Start Work" / "Mark Resolved" buttons, critical alert
- **Staff History** — searchable resolved tickets list
- **Profile Page** — edit info, change password
- Dark theme UI with animations: fade-up, pulse-glow, skeleton loaders

**Files:** entire `frontend/src/` directory (18+ files)

---

### 🗄️ Raghav Bansal(Member 3) — Database Engineer
**Branch:** `feature/database`  
**Tech:** MySQL 8.0 · SQL DDL · ER Diagram · Indexes · Constraints · Seed Data

**What I built:**
- Designed the complete **ER diagram** covering all 10 entities
- All **10 MySQL tables** with full constraints, foreign keys, and CASCADE rules:
  - `users`, `otp_tokens`, `refresh_tokens`, `staff_skills`
  - `tickets`, `ticket_updates`, `messages`, `notifications`
  - `feedback`, `job_queue` (with native JSON column), `audit_logs`
- All PKs use `CHAR(36) DEFAULT (UUID())` — no AUTO_INCREMENT integers
- **Performance indexes**: `idx_email`, `idx_role`, `idx_status`, `idx_category`, `idx_assigned_to`, `idx_queue`
- **Seed data**: 1 admin, 2 technicians, 3 students; 5 test tickets across categories; sample messages
- `schema.sql` + `seed.sql` — recreate entire DB in 2 commands

**Files:** `database/schema.sql`, `database/seed.sql`, `database/fix-assignments.sql`

---

### 🔗 Saksham Singh(Member 4) — ORM & Real-Time Engineer
**Branch:** `feature/ORM-&-Sockets`  
**Tech:** Sequelize ORM · Models · Associations · Socket.io · JWT Socket Auth

**What I built:**
- Configured **Sequelize** with `config/database.js` using environment variables
- **5 Sequelize Models** with full validations:
  - `User.js` — `beforeCreate` hook auto-hashes passwords with bcrypt
  - `Ticket.js` — status/priority ENUMs, `belongsTo(User)` as submitter + assignee
  - `Message.js` — `Ticket.hasMany(Message)`, `Message.belongsTo(User)` as sender
  - `OtpToken.js`, `RefreshToken.js`
- **Socket.io server** on the Express HTTP server:
  - JWT middleware on handshake — verifies `socket.handshake.auth.token`, rejects unauthenticated connections
  - `join_room` — `socket.join('ticket:{id}')` for scoped ticket rooms
  - `message` event — persists to MySQL via `Message.create()`, broadcasts to room instantly
  - Secure pattern: token in `auth` field, not query string

**Files:** `backend/models/` (5 files), `backend/config/socket.js`

---

### 🔧 Sehaj Khurana(Member 5) — Git Master & QA Lead
**Branch:** `feature/git-qa`  
**Tech:** Git · GitHub · GitHub Actions · Jest · Supertest

**What I built:**
- Created GitHub repo with **branch protection** on `main` and `develop`
- Defined **branching strategy**: `main` → `develop` → `feature/*` → `demo/phase1`
- **`CONTRIBUTING.md`** — branch naming, commit format, PR checklist, merge rules
- **PR template** — auto-populates: tests pass, no `.env` committed, screenshots attached
- **GitHub Actions CI** (`.github/workflows/ci.yml`):
  - Triggers on push/PR to `main` and `develop`
  - Spins up MySQL 8.0 service container
  - Runs `npm install` → lint → `npm test` (backend) + `npm run build` (frontend)
  - Green CI badge in README
- **Smoke + Integration tests** (`backend/tests/smoke.test.js`):
  - Health check, login success/failure, JWT auth, protected route rejection
  - Ticket create → GET mine → GET by ID round-trip
- Coordinated the 5-minute demo script and dry run

**Files:** `.github/workflows/ci.yml`, `.github/pull_request_template.md`, `CONTRIBUTING.md`, `README.md`, `backend/tests/smoke.test.js`

---

## ✅ Features Demonstrated

| # | Feature | Tech Shown | Status |
|---|---------|-----------|--------|
| 1 | Register with university email → OTP delivered → JWT issued | Node.js + Nodemailer + MySQL | ✅ |
| 2 | Login → JWT → redirect to role-specific dashboard | JWT Auth + React Router | ✅ |
| 3 | Visit `/dashboard` without login → redirected to `/login` | ProtectedRoute HOC | ✅ |
| 4 | Submit complaint → stored in MySQL via Sequelize | React + Node + Sequelize | ✅ |
| 5 | Open ticket in 2 tabs → message appears instantly without refresh | Socket.io real-time | ✅ |
| 6 | GitHub: branches, merged PRs, CI/CD Actions green badge | Git + GitHub Actions | ✅ |
| 7 | All 5 tech stack logos visible in footer on every page | React · Node · MySQL · Sequelize · Socket.io | ✅ |

---

## 📁 Project Structure

```
FixMyCampus/
├── backend/
│   ├── server.js
│   ├── app.js
│   ├── config/
│   │   ├── database.js         # Sequelize connection
│   │   ├── socket.js           # Socket.io + JWT auth (Member 4)
│   │   └── mailer.js           # Nodemailer config
│   ├── models/                 # Sequelize models (Member 4)
│   │   ├── User.js
│   │   ├── Ticket.js
│   │   ├── Message.js
│   │   ├── OtpToken.js
│   │   └── RefreshToken.js
│   ├── controllers/            # Member 1
│   ├── routes/                 # Member 1
│   ├── middleware/             # Member 1
│   └── tests/                 # Member 5
│
├── frontend/                   # Member 2
│   └── src/
│       ├── App.jsx
│       ├── context/AuthContext.jsx
│       ├── services/ (api.js, socket.js)
│       ├── components/
│       └── pages/ (11 pages)
│
├── database/                   # Member 3
│   ├── schema.sql
│   └── seed.sql
│
├── .github/                    # Member 5
│   └── workflows/ci.yml
│
├── CONTRIBUTING.md
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 20+, MySQL 8.0, Gmail App Password

### Database
```powershell
Get-Content database/schema.sql | mysql -u root -p
Get-Content database/seed.sql   | mysql -u root -p fixmycampus_db
Get-Content database/fix-assignments.sql | mysql -u root -p fixmycampus_db
```

### Backend
```powershell
cd backend
copy .env.example .env    # fill in DB password, JWT secrets, Gmail credentials
npm install
node scripts/fix-passwords.js   # run once to hash seed passwords
npm run dev               # → http://localhost:5000
```

### Frontend
```powershell
cd frontend
copy .env.example .env
npm install
npm run dev               # → http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@chitkara.edu | Test@1234 |
| 🔧 Staff | rahul.v@chitkara.edu | Test@1234 |
| 🔧 Staff | pooja.s@chitkara.edu | Test@1234 |
| 🎓 Student | arjun.m@chitkara.edu | Test@1234 |
| 🎓 Student | priya.n@chitkara.edu | Test@1234 |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | — | Health check |
| POST | `/auth/send-otp` | — | Send OTP to email |
| POST | `/auth/register` | — | Register with OTP |
| POST | `/auth/login` | — | Login → JWT |
| POST | `/auth/refresh` | — | Refresh access token |
| GET | `/auth/me` | ✅ | Current user profile |
| PATCH | `/auth/profile` | ✅ | Update profile |
| PATCH | `/auth/change-password` | ✅ | Change password |
| GET | `/auth/technicians` | ✅ Admin | List technicians |
| POST | `/tickets` | ✅ | Submit complaint |
| GET | `/tickets/mine` | ✅ | My tickets |
| GET | `/tickets/all` | ✅ Admin | All tickets |
| GET | `/tickets/assigned-to-me` | ✅ Staff | My assigned tasks |
| GET | `/tickets/:id` | ✅ | Ticket + messages |
| PATCH | `/tickets/:id` | ✅ Admin/Staff | Update status/assignment |

---

## 🎬 Demo Script (5 Minutes)

| Time | Step | Tech | Who |
|------|------|------|-----|
| 0:00 | GitHub — branches, PRs, CI green badge | Git | Member 5 |
| 0:45 | Register → OTP email arrives → account created | Node + Nodemailer | Member 2 |
| 1:30 | Login → JWT issued → dashboard | JWT Auth | Member 2 |
| 1:50 | `/dashboard` without login → redirected | ProtectedRoute | Member 2 |
| 2:10 | Submit complaint ticket | React + Sequelize | Member 2 |
| 2:40 | MySQL Workbench → show ticket row | MySQL | Member 3 |
| 3:10 | `npx sequelize db:migrate` → 0 pending | Sequelize ORM | Member 4 |
| 3:30 | 2 browser tabs → send message → instant in other tab | Socket.io | Member 4 |
| 4:10 | Postman: `GET /tickets/mine` with JWT | REST API | Member 1 |
| 4:40 | Point to footer: React · Node · MySQL · Sequelize · Socket.io | All 5 | Member 2 |

---

## 🌿 Branch Strategy

```
main              → production-ready, protected
  └── develop     → integration (all PRs merge here)
        ├── feature/backend        → Member 1
        ├── feature/frontend       → Member 2
        ├── feature/database       → Member 3
        ├── feature/ORM-&-Sockets  → Member 4
        └── feature/git-qa         → Member 5
```

---

*Fix My Campus · Chitkara University · 22CS037 · Phase 1 Draft · March 2026*
