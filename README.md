# MatchWork

**Tinder-Inspired Job & Candidate Matching Platform**

MatchWork is a full-stack recruitment and talent discovery web application that replaces traditional, high-friction job boards with an intuitive, swipe-based matching workflow. By combining a **Weighted Tag Matching Algorithm**, **Real-time Chat**, and **Role-Based Analytics**, MatchWork helps candidates and recruiters quantify compatibility upfront and connect only on mutual interest.

---

## Table of Contents

- [Overview & Problem Statement](#overview--problem-statement)
- [Key Features](#key-features)
- [Tech Stack & System Architecture](#tech-stack--system-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [1. Local Development (2-Port Setup)](#1-local-development-2-port-setup)
  - [2. Production Single-Port Build](#2-production-single-port-build)
  - [3. Docker Compose](#3-docker-compose)
- [Demo Accounts & Quick Account Switcher](#demo-accounts--quick-account-switcher)
- [Testing](#testing)

---

## Overview & Problem Statement

Conventional recruitment platforms suffer from two major usability bottlenecks:
1. **Signal-to-Noise Ratio:** Candidates submit applications without knowing how closely their skills align with role priorities, while recruiters spend hours screening mismatched resumes.
2. **Delayed Feedback Loops:** One-way application forms create slow, opaque communication cycles.

MatchWork addresses both problems through a dual-sided, interaction-driven UX:
- **Quantified Fit Before Swiping:** Every job and candidate card displays a real-time `% Match Score` calculated from weighted skill tags, work-style alignment, and experience level.
- **Mutual-Interest Connections:** Both parties swipe (`Like` or `Pass`) on curated feeds. A connection is only unlocked when both sides express interest, immediately opening a real-time chat channel.

---

## Key Features

### Candidate
- **Curated Swipe Deck:** Browse job postings ranked and scored against personal skill weights with instant `Like` / `Pass` actions.
- **Transparent Match Breakdown:** View `% Match Score` along with a detailed breakdown of matched skills, missing requirements, and bonus attributes.
- **Skill & Preference Management:** Customize profile details, work-style preferences, and individual skill weights (`0.0` to `1.0`).
- **Real-time Messaging:** Chat directly with matched recruiters via Socket.io with persistent message history.

### Company (Recruiter)
- **Candidate Discovery Feed:** Review candidate profiles scored against specific job posting requirements.
- **Job Posting & Weighted Tag Configuration:** Create job listings with weighted skill tags to prioritize must-have competencies over nice-to-have skills.
- **Match Pipeline & Chat:** Manage mutual connections and coordinate interviews in real time.

### Admin
- **Interactive Analytics Dashboard:** Visualize platform metrics using Recharts, including Top 5 Demanded Skills/Tags (`BarChart`) and Interaction Breakdown (`PieChart` for Match Rate vs. Pass).
- **Platform Governance:** Manage global skill tags, moderate job posting statuses, inspect system activity logs, and monitor overall KPIs.
- **JWT Role-Based Access Control:** Strict route protection (`authenticateToken`, `requireAdmin`) separating `candidate`, `recruiter`, and `admin` privileges.

---

## Tech Stack & System Architecture

### Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), Axios, Recharts, Lucide React, Socket.io Client |
| **Backend** | Node.js, Express.js 4, JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Database & ORM** | Sequelize ORM v6, MySQL 8.0 (`mysql2`), PostgreSQL (`pg`, `pg-hstore`), In-Memory Fallback |
| **Real-time** | Socket.io v4 (JWT-authenticated handshakes, room-based messaging) |
| **DevOps & Testing** | Docker (multi-stage Alpine build), Docker Compose, GitHub Actions CI, Jest v30, `oxlint`, `concurrently` |

### System Architecture

```text
+-------------------------------------------------------------------------+
|                           Client (Browser)                              |
|  React 19 + Tailwind CSS v4 + Recharts + Axios + Socket.io Client       |
|  - Dev: http://localhost:5173 (Vite Proxy -> /api, /socket.io)          |
|  - Prod: Served statically from Express (client/dist) on Port 3000      |
+------------------------------------+------------------------------------+
                                     |
                   HTTP / REST       |       WebSocket (JWT Auth)
                  (/api/v1, /api)    |      (join_room, send_message)
                                     v
+-------------------------------------------------------------------------+
|                     Node.js Server (Port 3000)                          |
|                                                                         |
|  +-------------------------------+   +-------------------------------+  |
|  |       Express.js REST API     |   |      Socket.io Server         |  |
|  |  - Auth & Account Switcher    |   |  - JWT Handshake Middleware   |  |
|  |  - Weighted Matching Service  |   |  - Room-scoped Broadcasts     |  |
|  |  - Profile, Jobs & Admin APIs |   |  - Message Persistence        |  |
|  +---------------+---------------+   +---------------+---------------+  |
|                  |                                   |                  |
|                  +-----------------+-----------------+                  |
|                                    |                                    |
|                                    v                                    |
|                  +-----------------------------------+                  |
|                  |     Data Access Layer (db.js)     |                  |
|                  |  Sequelize ORM + Memory Fallback  |                  |
|                  +-----------------+-----------------+                  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                      Relational Database                                |
|         MySQL 8.0 (Default / Docker) or PostgreSQL                      |
|  Tables: users, candidate_profiles, job_postings, tags,                 |
|          candidate_tags, job_tags, interactions, connections, messages  |
+-------------------------------------------------------------------------+
```

---

## Getting Started

### Prerequisites

- **Local Setup:** Node.js (v20+ recommended), npm, and MySQL 8.0 or PostgreSQL (optional: the app includes an in-memory fallback if no database server is running).
- **Docker Setup:** Docker and Docker Compose.

### Environment Variables

Copy `.env.example` to `.env` in the project root and adjust values as needed:

```bash
cp .env.example .env
```

Default `.env.example` configuration:

```env
PORT=3000
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=matchwork_db
DB_USER=root
DB_PASSWORD=
JWT_SECRET=put-any-long-random-text-here
```

### 1. Local Development (2-Port Setup)

Run the Express/Socket.io backend and the Vite React frontend concurrently with hot module replacement:

```bash
# Install root (backend) dependencies
npm install

# Install client (frontend) dependencies
npm --prefix client install

# (Optional) Sync database schema and seed demo data
npm run db:seed

# Start both API server (port 3000) and Vite dev server (port 5173)
npm run dev
```

- **Frontend (Vite):** `http://localhost:5173` (proxies `/api` and `/socket.io` to port `3000`)
- **Backend API & Socket.io:** `http://localhost:3000`

### 2. Production Single-Port Build

Build the React application into `client/dist` and serve both the SPA and API from a single Express server:

```bash
# Install root dependencies
npm install

# Install client dependencies and build production bundle
npm run build

# Start production server on port 3000
npm run start:prod
```

- **Application URL:** `http://localhost:3000`

*(Note: On Windows PowerShell, if `NODE_ENV=production` inline syntax is unsupported in your shell, run `$env:NODE_ENV="production"; node server.js`.)*

### 3. Docker Compose

Launch both the MySQL 8.0 database and the production MatchWork application container in one command:

```bash
docker-compose up --build
```

- Wait for `matchwork-mysql` to pass its healthcheck; `matchwork-app` will start automatically and expose the application at `http://localhost:3000`.
- To stop and remove containers:

```bash
docker-compose down
```

---

## Demo Accounts & Quick Account Switcher

MatchWork includes seeded demo accounts across all three roles:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Candidate** | Kawin Suk (Senior Full-Stack Engineer) | `kawin.dev@example.com` | `password123` |
| **Company (Recruiter)** | Tech Innovator HR (TechScale Innovations) | `recruiter@techscale.io` | `password123` |
| **Admin** | MatchWork System Admin | `admin@matchwork.io` | `adminpassword` |

Additional seeded accounts available in the database:
- **Candidates:** `nichapa.ux@example.com`, `thanaphat.ops@example.com`, `ploy.frontend@example.com` (password: `password123`)
- **Company (Recruiter):** `talent@cloudnative.tech` (password: `password123`)

### Using the Quick Account Switcher

To streamline UX evaluation and multi-role testing without manual sign-outs:
1. **On the Login Screen:** Click any role card (`Candidate`, `Company`, or `Admin`) inside the **Quick Account Switcher** panel to authenticate immediately with a valid JWT.
2. **Inside the Dashboard:** Use the compact **Quick Account Switcher** menu in the top navigation bar to switch personas on the fly (`POST /api/v1/auth/switch`) and observe how the feed, match scores, chat rooms, and analytics dashboard adapt to each role.

---

## Testing

MatchWork uses **Jest** for unit and integration testing across authentication, matching algorithms, validation logic, and real-time chat.

Run the full Jest test suite:

```bash
npm test
```

### Test Suites Included

| File | Coverage |
| :--- | :--- |
| `src/tests/auth.test.js` | `bcryptjs` password hashing, JWT generation/verification, `authenticateToken` & `requireAdmin` middleware, protected routes, and Account Switcher integration |
| `src/tests/chat.test.js` | Socket.io real-time messaging, `Message` model persistence, and chat history API |
| `src/tests/features.test.js` | Input validation helpers (`validateUsername`, `validateCandidateProfile`, `validateTagWeight`), role access checks (`canAccessAdmin`), and `calculateMatchingScore()` |

Additional utility scripts:

```bash
# Run custom standalone unit test script
npm run test:custom

# Run frontend linter (oxlint)
npm --prefix client run lint
```
