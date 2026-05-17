# 🏫 Fix My Campus

[![CI](https://github.com/Sehajk005/FixMyCampus/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Sehajk005/FixMyCampus/actions/workflows/ci.yml)

> **Campus Complaint Management System** — Chitkara University · Full-Stack Engineering Project (All Phases Complete)
>
> A production-grade web application where students report campus issues, staff resolves them, and admins manage everything in real time — with analytics, upvoting, photo evidence, smart auto-assignment, and Docker-based deployment.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Team & Contributions](#-team--contributions)
- [Feature Overview](#-feature-overview)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Docker Deployment](#-docker-deployment)
- [Demo Credentials](#-demo-credentials)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Branch Strategy](#-branch-strategy)

---

## 🎯 Project Overview

**Fix My Campus** is a campus complaint management platform built for Chitkara University. Students submit complaints about campus issues — electrical faults, Wi-Fi outages, plumbing problems, cleanliness, and more. Each complaint becomes a fully tracked ticket with a lifecycle from submission to closure, real-time chat between students and staff, and a rich admin dashboard for oversight and analytics.

### The Problem We Solve

Previously, students had no formal channel to report campus issues — complaints were made verbally or over WhatsApp with no tracking, no accountability, and no transparency on resolution status. Fix My Campus gives every complaint a ticket number, an assigned technician, and live status updates. A public feed lets the campus community upvote high-priority issues.

### Three Portals in One App

| Portal | For | What They Can Do |
|--------|-----|-----------------|
| 🎓 **Student** | Students | Submit complaints, attach photos, track status, live chat with staff, rate resolution quality, upvote public issues |
| 🔧 **Staff** | Technicians | View assigned tasks, update progress, mark resolved, manage skills and availability, SLA tracking |
| 👑 **Admin** | Administrators | Full ticket management, assign technicians, manage users and roles, view analytics dashboard, heatmap, workload metrics |

---

## 🛠 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 18.3 | SPA with Vite build tool |
| | React Router | v6 | Client-side routing, protected routes |
| | Tailwind CSS | 3.x | Utility-first styling, dark theme |
| | Recharts | 3.x | Analytics charts (bar, line, pie) |
| | Axios | 1.x | HTTP client with auto-refresh interceptor |
| | Socket.io-client | 4.x | Real-time chat and notifications |
| | Apollo Client | 4.x | GraphQL queries for analytics |
| | Firebase SDK | 12.x | Public feed and heatmap (client-side) |
| **Backend** | Node.js | 20 | Runtime |
| | Express | 4.x | REST API framework |
| | Sequelize ORM | 6.x | Models, associations, validations |
| | Apollo Server | 4.x | GraphQL analytics API |
| | Socket.io | 4.x | Real-time bi-directional communication |
| | Firebase Admin | 13.x | Realtime Database sync for public feed |
| | Multer | 2.x | Photo upload (5 MB limit, jpeg/png/webp) |
| | Nodemailer | 6.x | OTP email delivery via Gmail SMTP |
| | jsonwebtoken | 9.x | Stateless auth (15-min access + 7-day refresh) |
| | bcryptjs | 2.x | Password hashing (12 rounds) |
| | Helmet + XSS-clean | — | Security headers, XSS sanitization |
| | express-rate-limit | 6.x | Per-route rate limiting |
| | swagger-ui-express | 4.x | Interactive API documentation |
| **Database** | MySQL | 8.0 | Primary relational database (11 tables) |
| | Redis | 7 | Session/queue support (Docker stack) |
| **DevOps** | Docker + Compose | — | Containerized 4-service stack |
| | GitHub Actions | — | CI/CD (lint → test → build → integration) |
| | Jest + Supertest | 29.x | Backend integration tests |
| | Vitest | 0.34 | Frontend unit tests |

---

## 👥 Team & Contributions

### ⚙️ Satvik Gupta — Backend Developer

**Branch:** `feature/backend`
**Tech:** Node.js · Express · JWT · Nodemailer · bcryptjs · Rate Limiting · Swagger

**What I built:**
- Scaffolded the entire Express project using MVC structure (`routes/`, `controllers/`, `middleware/`, `config/`)
- **Authentication system:** `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh-token`, `POST /auth/logout`, `GET /auth/me`
- **OTP flow:** `POST /auth/otp/resend`, `POST /auth/otp/verify` — 6-digit OTP via Gmail SMTP, expires in 10 minutes
- **JWT strategy:** 15-minute access token + 7-day HttpOnly refresh token; auto-refresh on 401
- **Ticket CRUD:** create, list, get by ID, update status/priority, assign technician
- **Feedback system:** `POST /tickets/:id/feedback` — 1–5 star rating with comments
- **Rate limiting:** 10 req/min (auth), 100 req/min (tickets), 200 req/min (global)
- **Swagger docs:** `/api/docs` — interactive OpenAPI documentation for all routes
- **Security middleware stack:** Helmet, morgan logging, XSS-clean, HTML sanitization on all body/query params

**Files:** `backend/server.js`, `backend/app.js`, `backend/swagger.js`, `backend/routes/`, `backend/controllers/`, `backend/middleware/`, `backend/config/`

---

### 🎨 Sam Choudhary — Frontend Developer

**Branch:** `feature/frontend`
**Tech:** React 18 · Vite · Tailwind CSS · React Router v6 · Recharts · Axios · Socket.io-client

**What I built:**
- Bootstrapped React 18 SPA with Vite, configured Tailwind CSS + PostCSS + ESLint
- **React Router v6** with all routes, lazy-loading, and role-based automatic redirects
- **AuthContext** — global JWT state with silent refresh on app mount, `tokenRefreshed` / `refreshTokenFailed` event bus
- **Route guards:** `ProtectedRoute`, `AdminRoute`, `StaffRoute`
- **Login & Register pages** — 2-step OTP registration with animated progress indicator
- **Student Dashboard** — stat cards, category quick-links, recent ticket list, trend charts
- **My Tickets** — filterable list with status badges and priority indicators
- **New Ticket** — visual category grid, priority selector, photo upload, anonymous toggle
- **Ticket Detail + Live Chat** — Socket.io message bubbles, typing indicators, auto-scroll
- **Public Feed** (`/feed`) — Firebase-backed upvoting, sortable by votes
- **Admin Dashboard** — full analytics: total stats, BarChart by category, LineChart trend, PieChart status, WorkloadTable, CampusHeatmap
- **Admin Tickets** — bulk management with inline status + technician assignment dropdowns
- **Admin Users** — create, role change, activate/deactivate users
- **Staff Dashboard** — assigned tickets, SLA countdown timers, "Start Work" / "Mark Resolved" actions
- **Staff History** — searchable resolved tickets with resolution time
- **Profile Page** — edit info, change password, manage skills (technicians)
- **NotificationBell** — real-time in-app notifications via Socket.io

**Files:** entire `frontend/src/` directory (13 pages, 14+ components, context, services)

---

### 🗄️ Raghav Bansal — Database Engineer

**Branch:** `feature/database`
**Tech:** MySQL 8.0 · SQL DDL · ER Diagram · Indexes · Constraints · Seed Data

**What I built:**
- Designed the complete **ER diagram** covering all 11 entities with relationships
- All **11 MySQL tables** with full constraints, foreign keys, and CASCADE rules:
  - `users` — core user accounts with role, verification, department
  - `otp_tokens` — 6-digit OTP records with expiry
  - `refresh_tokens` — revocable long-lived tokens
  - `staff_skills` — per-technician skill tags with availability and workload
  - `tickets` — full ticket lifecycle with category, status, priority ENUMs
  - `ticket_updates` — status transition audit trail
  - `messages` — per-ticket chat messages
  - `notifications` — user-targeted in-app notifications
  - `feedback` — post-resolution ratings (1–5) with unique ticket+user constraint
  - `job_queue` — async background jobs with JSON payload, retry logic
  - `audit_logs` — immutable action log with JSON metadata
- All PKs use `CHAR(36) DEFAULT (UUID())` — no AUTO_INCREMENT integers
- **Performance indexes:** `idx_email`, `idx_role`, `idx_status`, `idx_category`, `idx_assigned_to`, `idx_queue`, `idx_ticket_id`
- **Seed data:** 1 admin, 2 technicians with skills, 3 students; 5 test tickets across categories; sample messages
- `schema.sql` + `seed.sql` — recreate entire DB in 2 commands
- **Phase migration scripts:** `add_phase3_columns.js`, `phase4_db_updates.js`, `migrate_phase5.js`

**Files:** `database/schema.sql`, `database/seed.sql`, `backend/scripts/`

---

### 🔗 Saksham Singh — ORM & Real-Time Engineer

**Branch:** `feature/ORM-&-Sockets`
**Tech:** Sequelize ORM · 11 Models · Associations · Socket.io · Firebase Realtime DB · GraphQL · Services

**What I built:**
- Configured **Sequelize** with `config/database.js` — MySQL in prod/dev, SQLite in-memory for tests
- **11 Sequelize Models** with full validations and associations:
  - `User.js` — `beforeCreate` bcrypt hook, role ENUM, status field
  - `Ticket.js` — status/priority ENUMs; `belongsTo(User)` as submitter and assignee
  - `TicketUpdate.js` — status change audit; `belongsTo(Ticket, User)`
  - `Message.js` — `Ticket.hasMany(Message)`, `belongsTo(User)` as sender
  - `Notification.js` — per-user alerts, `is_read` flag
  - `Feedback.js` — unique-per-ticket rating, `hasOne(Ticket)`
  - `StaffSkill.js` — skill tag, workload, availability flag per technician
  - `JobQueue.js` — async job payload JSON, retry counter, scheduled `run_at`
  - `AuditLog.js` — insert-only log with JSON meta
  - `RefreshToken.js`, `OtpToken.js` — auth token management
- **`models/index.js`** — central association file linking all models
- **Socket.io server** (`config/socket.js`):
  - JWT middleware on handshake — rejects unauthenticated connections
  - Rooms: `ticket:{id}` for scoped chat, `user:{id}` for personal notifications
  - Events: `message`, `join_room`, `typing`, `stop_typing`
  - Persists messages to MySQL before broadcast
- **GraphQL API** (`graphql/`) — analytics queries: `ticketStats`, `technicianWorkload`, `avgResolutionTime`, `ticketsByCategory`, `priorityDistribution`, `heatmapData`
- **Firebase integration** (`services/firebase.service.js`): syncs tickets to public feed, atomic upvote counters, location-weighted heatmap data
- **Smart auto-assignment** (`services/assignment.service.js`) — skill matching + workload balancing
- **SLA service** (`services/sla.service.js`) — sets resolution deadline by priority
- **Notification service** (`services/notification.service.js`) — DB + Socket.io delivery
- **Background worker** (`worker.js`) — processes `job_queue` entries on an interval

**Files:** `backend/models/` (11 files + index.js), `backend/config/socket.js`, `backend/config/firebase.js`, `backend/graphql/`, `backend/services/`, `backend/worker.js`

---

### 🔧 Sehaj Khurana — Git Master & QA Lead

**Branch:** `feature/git-qa`
**Tech:** Git · GitHub · GitHub Actions · Jest · Supertest · Vitest · Docker

**What I built:**
- Created GitHub repo with **branch protection** on `main` and `dev`
- Defined **branching strategy**: `main` → `dev` → `feature/*`
- **`CONTRIBUTING.md`** — branch naming, commit format, PR checklist, merge rules
- **PR template** — auto-populates: tests pass, no `.env` committed, screenshots attached
- **GitHub Actions CI** (`.github/workflows/ci.yml`):
  - Triggers on push/PR to `main` and `dev`
  - **Backend job:** Node 20 + MySQL 8.0 service → install → lint → `npm test`
  - **Frontend job:** Node 20 → install → `npm test` → `npm run build`
  - **Integration job:** Depends on both → runs root integration suite (`npm run test:integration`)
- **Backend tests** (`backend/tests/`): smoke, auth controller, ticket routes, admin routes
- **Root integration tests** (`tests/integration/`): full student → admin → staff workflow
- **Docker Compose** (`docker-compose.yml`) — 4-service production stack: MySQL, Redis, backend, frontend (Nginx)
- Dockerfiles for both backend and frontend services
- Green CI badge in README; coordinated demo scripts and dry runs

**Files:** `.github/workflows/ci.yml`, `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `backend/tests/`, `tests/`, `CONTRIBUTING.md`, `README.md`

---

## ✅ Feature Overview

| # | Feature | Technologies | Status |
|---|---------|-------------|--------|
| 1 | University email OTP registration | Nodemailer + MySQL + JWT | ✅ |
| 2 | Role-based login → dashboard redirect | JWT + React Router + AuthContext | ✅ |
| 3 | Protected routes (auth + role guards) | ProtectedRoute / AdminRoute / StaffRoute | ✅ |
| 4 | Submit ticket with photo evidence | React + Multer + Sequelize | ✅ |
| 5 | Duplicate ticket detection | Hash comparison on creation | ✅ |
| 6 | Real-time ticket chat | Socket.io rooms with JWT handshake auth | ✅ |
| 7 | Typing indicators | Socket.io `typing` / `stop_typing` events | ✅ |
| 8 | Real-time in-app notifications | Socket.io `user:{id}` room | ✅ |
| 9 | Smart auto-assignment | Skill matching + workload balancing service | ✅ |
| 10 | SLA deadline tracking | Priority-based deadlines, staff countdown | ✅ |
| 11 | Feedback & star ratings | 1–5 stars post-resolution, unique per ticket+user | ✅ |
| 12 | Public feed with upvoting | Firebase Realtime Database, atomic counters | ✅ |
| 13 | Campus heatmap | Firebase location data + CampusHeatmap component | ✅ |
| 14 | Analytics dashboard | GraphQL + Recharts (bar, line, pie, workload table) | ✅ |
| 15 | Admin user management | Role changes, activate/deactivate, create users | ✅ |
| 16 | Technician skills management | StaffSkill model, availability toggle | ✅ |
| 17 | Background job worker | JobQueue model + worker.js, retry logic | ✅ |
| 18 | Audit logging | AuditLog model, immutable action trail | ✅ |
| 19 | Swagger API docs | `/api/docs` — full interactive documentation | ✅ |
| 20 | Rate limiting per route | express-rate-limit (auth: 10/min, tickets: 100/min) | ✅ |
| 21 | Security hardening | Helmet, XSS-clean, HTML sanitization on all inputs | ✅ |
| 22 | Docker Compose stack | MySQL + Redis + Node + Nginx in one command | ✅ |
| 23 | GitHub Actions CI/CD | 3-job pipeline: backend → frontend → integration | ✅ |
| 24 | GraphQL analytics API | Apollo Server 4 with 6 query types | ✅ |

---

## 📁 Project Structure

```
FixMyCampus/
├── .github/
│   ├── workflows/
│   │   └── ci.yml                       # CI/CD: lint → test → build → integration
│   └── pull_request_template.md
│
├── backend/
│   ├── config/
│   │   ├── config.js                    # Sequelize env config (dev/test/prod)
│   │   ├── database.js                  # Sequelize init (MySQL / SQLite for tests)
│   │   ├── firebase.js                  # Firebase Admin SDK init
│   │   ├── mailer.js                    # Nodemailer SMTP transporter
│   │   └── socket.js                    # Socket.io server + JWT auth on handshake
│   ├── controllers/
│   │   ├── auth.controller.js           # Register, login, OTP, refresh, profile
│   │   ├── admin.controller.js          # User management (CRUD, role, status)
│   │   └── ticket.controller.js         # Ticket CRUD, assign, feedback, upvote
│   ├── graphql/
│   │   ├── index.js                     # Apollo Server setup
│   │   ├── schema.js                    # GraphQL type definitions
│   │   └── resolvers.js                 # Resolvers: stats, workload, heatmap, trends
│   ├── middleware/
│   │   ├── auth.middleware.js           # JWT validation + requireRole()
│   │   ├── errorHandler.js              # ApiError class + 404 and global handlers
│   │   ├── rateLimit.js                 # Per-route rate limiters
│   │   ├── security.js                  # Helmet, XSS-clean, sanitization, morgan
│   │   └── upload.middleware.js         # Multer (5 MB, jpeg/png/webp)
│   ├── models/
│   │   ├── User.js                      # Core user (role ENUM, bcrypt hook)
│   │   ├── Ticket.js                    # Ticket (status/priority ENUMs, photo)
│   │   ├── TicketUpdate.js              # Status change audit trail
│   │   ├── Message.js                   # Chat messages per ticket
│   │   ├── Notification.js              # In-app notifications
│   │   ├── Feedback.js                  # Post-resolution ratings
│   │   ├── StaffSkill.js                # Technician skills + workload
│   │   ├── JobQueue.js                  # Background job queue
│   │   ├── AuditLog.js                  # Immutable audit log
│   │   ├── RefreshToken.js              # JWT refresh tokens
│   │   ├── OtpToken.js                  # OTP records
│   │   └── index.js                     # All model associations defined here
│   ├── routes/
│   │   ├── auth.routes.js               # /auth/* endpoints
│   │   ├── ticket.routes.js             # /tickets/* endpoints
│   │   └── admin.routes.js              # /admin/* endpoints
│   ├── scripts/
│   │   ├── fix-passwords.js             # One-time: hash seed passwords
│   │   ├── add_phase3_columns.js        # Phase 3 schema migration
│   │   ├── phase4_db_updates.js         # Phase 4 schema migration
│   │   └── migrate_phase5.js            # Phase 5 schema migration
│   ├── services/
│   │   ├── assignment.service.js        # Smart auto-assignment (skill + workload)
│   │   ├── firebase.service.js          # Firebase CRUD + heatmap + upvotes
│   │   ├── notification.service.js      # DB + Socket.io notification delivery
│   │   └── sla.service.js              # Priority-based SLA scheduling
│   ├── tests/
│   │   ├── smoke.test.js                # Health, auth, ticket round-trip
│   │   ├── auth.controller.test.js      # Auth endpoint coverage
│   │   ├── ticket.routes.test.js        # Ticket CRUD coverage
│   │   └── admin.routes.test.js         # Admin endpoint coverage
│   ├── app.js                           # Express app: middleware + routes
│   ├── server.js                        # HTTP server entry: DB sync + Socket.io
│   ├── swagger.js                       # OpenAPI spec for /api/docs
│   ├── worker.js                        # Background job processor
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx         # 2-step OTP flow
│   │   │   ├── DashboardPage.jsx        # Student: stats, charts, recent tickets
│   │   │   ├── TicketsPage.jsx          # Student: filterable ticket list
│   │   │   ├── NewTicketPage.jsx        # Student: create ticket + photo upload
│   │   │   ├── TicketDetailPage.jsx     # Ticket view + live chat (lazy loaded)
│   │   │   ├── ProfilePage.jsx          # Edit profile, password, skills
│   │   │   ├── PublicFeed.jsx           # Firebase-backed upvote feed (lazy loaded)
│   │   │   ├── AdminDashboard.jsx       # Analytics, heatmap, workload (lazy loaded)
│   │   │   ├── AdminTickets.jsx         # Bulk ticket management (lazy loaded)
│   │   │   ├── AdminUsers.jsx           # User role/status management (lazy loaded)
│   │   │   ├── StaffDashboard.jsx       # Assigned tasks + SLA (lazy loaded)
│   │   │   └── StaffHistory.jsx         # Work history (lazy loaded)
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── StaffRoute.jsx
│   │   │   ├── Navbar.jsx               # Top nav + logout
│   │   │   ├── NotificationBell.jsx     # Real-time notification dropdown
│   │   │   ├── OtpVerification.jsx      # OTP input modal
│   │   │   ├── PageLoading.jsx          # Skeleton loader
│   │   │   ├── StatusBadge.jsx          # Color-coded ticket status
│   │   │   ├── CampusHeatmap.jsx        # Location heatmap visualization
│   │   │   ├── TechStackFooter.jsx
│   │   │   └── analytics/
│   │   │       ├── BarChart.jsx         # Category/priority bar chart
│   │   │       ├── LineChart.jsx        # Ticket volume trend
│   │   │       ├── PieChart.jsx         # Status distribution
│   │   │       ├── StatsCard.jsx        # Summary metric card
│   │   │       └── WorkloadTable.jsx    # Technician workload table
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Global auth state + silent refresh
│   │   ├── services/
│   │   │   ├── api.js                   # Axios instance + auto-refresh interceptor
│   │   │   └── socket.js                # Socket.io client singleton
│   │   ├── api/
│   │   │   └── firebase.js              # Firebase client SDK config
│   │   ├── App.jsx                      # Router + lazy-loaded routes
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
├── database/
│   ├── schema.sql                       # 11 tables, full constraints + indexes
│   ├── seed.sql                         # 1 admin, 2 staff, 3 students, 5 tickets
│   └── fix-assignments.sql
│
├── tests/
│   ├── integration/
│   │   ├── full-workflow.test.js        # End-to-end workflow test
│   │   └── health.test.js
│   └── run-integration-tests.mjs
│
├── docker-compose.yml                   # MySQL + Redis + backend + Nginx
├── PRODUCT.md                           # Product spec and user personas
├── DESIGN.md                            # Design system (tokens, components)
├── DESIGN.json                          # Design token sidecar
├── CONTRIBUTING.md
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 20+
- MySQL 8.0
- Gmail account with an App Password (for OTP emails)
- Firebase project (for public feed and heatmap)

### 1. Database

```powershell
# Create schema
Get-Content database/schema.sql | mysql -u root -p

# Seed sample data
Get-Content database/seed.sql | mysql -u root -p fixmycampus_db

# Hash seed passwords (run once)
node backend/scripts/fix-passwords.js
```

### 2. Backend

```powershell
cd backend
Copy-Item .env.example .env    # fill in DB credentials, JWT secrets, Gmail, Firebase
npm install
npm run dev                    # -> http://localhost:5000
# Swagger docs: http://localhost:5000/api/docs
```

**Required `.env` variables:**

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=yourpassword
DB_NAME=fixmycampus_db

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_app_password

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

### 3. Frontend

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev                    # -> http://localhost:5173
```

**Required `.env` variables:**

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
```

---

## 🐳 Docker Deployment

Run the full 4-service stack (MySQL + Redis + backend + Nginx frontend) with one command:

```powershell
docker-compose up --build
```

| Service | Port | Description |
|---------|------|-------------|
| MySQL 8.0 | 3306 | Primary database |
| Redis 7 | 6379 | Queue / session support |
| Backend (Node.js) | 5000 | Express + Socket.io + GraphQL |
| Frontend (Nginx) | 3000 | Built React SPA |

The backend container connects to `db` and `redis` via Docker networking. No local MySQL or Redis installation needed when using Docker.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@chitkara.edu | Test@1234 |
| 🔧 Staff | rahul.v@chitkara.edu | Test@1234 |
| 🔧 Staff | pooja.s@chitkara.edu | Test@1234 |
| 🎓 Student | arjun.m@chitkara.edu | Test@1234 |
| 🎓 Student | priya.n@chitkara.edu | Test@1234 |
| 🎓 Student | karan.s@chitkara.edu | Test@1234 |

---

## 📡 API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/otp/resend` | — | Send OTP to email |
| POST | `/auth/otp/verify` | — | Verify OTP code |
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login → access token + refresh cookie |
| POST | `/auth/refresh-token` | — | Exchange refresh token for new access token |
| POST | `/auth/logout` | — | Revoke refresh token |
| GET | `/auth/me` | ✅ | Get current user profile |
| PATCH | `/auth/profile` | ✅ | Update name, department, phone |
| PATCH | `/auth/change-password` | ✅ | Change password |
| GET | `/auth/me/skills` | ✅ Staff | Get technician's skill tags |
| PUT | `/auth/me/skills` | ✅ Staff | Update skill tags + availability |
| GET | `/auth/technicians` | ✅ | List all technicians |

### Tickets (`/tickets` — all require auth)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/tickets/` | ✅ | Create ticket (with optional photo) |
| GET | `/tickets/mine` | ✅ | Get current user's tickets |
| GET | `/tickets/all` | ✅ Admin | Get all tickets (paginated) |
| GET | `/tickets/assigned-to-me` | ✅ Staff | Get tickets assigned to me |
| GET | `/tickets/:id` | ✅ | Get ticket with messages + updates |
| PATCH | `/tickets/:id` | ✅ Admin/Staff | Update status, priority, notes |
| PATCH | `/tickets/:id/assign` | ✅ Admin | Assign technician |
| POST | `/tickets/:id/updates` | ✅ | Add status update note |
| POST | `/tickets/:id/feedback` | ✅ Student | Submit 1–5 star rating |
| POST | `/tickets/feed/:id/upvote` | ✅ | Upvote in public feed (Firebase) |
| GET | `/tickets/photo/:filename` | ✅ | Download ticket photo |

### Admin (`/admin` — admin role required)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/users` | ✅ Admin | List all users |
| POST | `/admin/users` | ✅ Admin | Create user (auto-verified) |
| PATCH | `/admin/users/:id/role` | ✅ Admin | Change user role |
| PATCH | `/admin/users/:id/status` | ✅ Admin | Activate / deactivate user |

### GraphQL (`/graphql`)

All analytics queries require admin auth. Query via Apollo Client or any GraphQL client:

```graphql
query {
  ticketStats { total submitted assigned in_progress resolved closed }
  technicianWorkload { id name active_tickets completed_tickets avg_resolution_time score }
  avgResolutionTime { date avg_hours }
  ticketsByCategory { category count }
  priorityDistribution { priority count }
  heatmapData { lat lng weight }
}
```

### Other

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | — | Server health check |
| GET | `/api/docs` | — | Swagger interactive API documentation |

---

## 🧪 Testing

### Run All Tests

```powershell
# From repo root — runs backend + frontend + integration
npm test
```

### Individual Suites

```powershell
# Backend unit + integration tests
# Uses SQLite in-memory (NODE_ENV=test) — no local MySQL required
npm --prefix backend test

# Backend lint
npm --prefix backend run lint

# Frontend unit tests
npm --prefix frontend test

# Frontend lint
npm --prefix frontend run lint

# Root integration tests (requires a running server)
npm run test:integration
```

### Test Coverage

| Suite | What It Covers |
|-------|---------------|
| `smoke.test.js` | Health check, login success/failure, JWT auth, protected route rejection |
| `auth.controller.test.js` | OTP send/verify, registration, token refresh, logout |
| `ticket.routes.test.js` | Create → list → get → update → feedback round-trip |
| `admin.routes.test.js` | User management, role and status changes |
| `full-workflow.test.js` | Complete student → admin → staff workflow end-to-end |

---

## 🌿 Branch Strategy

```
main              -> production-ready, branch-protected
  └── dev         -> integration (all PRs merge here first)
        ├── feature/backend          -> Satvik (API, auth, rate limiting, Swagger)
        ├── feature/frontend         -> Sam (React, UI, charts, Firebase client)
        ├── feature/database         -> Raghav (MySQL schema, seeds, migrations)
        ├── feature/ORM-&-Sockets    -> Saksham (Sequelize, Socket.io, GraphQL, services)
        └── feature/git-qa           -> Sehaj (CI/CD, Docker, tests, QA)
```

PRs from `feature/*` → `dev` require:
- All CI checks green
- At least 1 reviewer approval
- No `.env` files committed
- Tests added for new behaviour

---

*Fix My Campus · Chitkara University · 22CS037 · All Phases Complete · May 2026*
