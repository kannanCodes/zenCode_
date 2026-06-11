<div align="center">

#  zenCode

**Master Coding Interviews with Real-Time Practice**

Code problems, collaborate live with video, and simulate real interviews — all in one platform built for developers.

[![Deploy to AWS](https://img.shields.io/badge/Deploy-AWS_EC2-orange?style=flat&logo=amazon-aws)](https://zencode.site)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat&logo=stripe&logoColor=white)

🌐 **Live:** [zencode.site](https://zencode.site)

</div>

---

## 📖 Overview

**zenCode** is an MVP-stage technical interview preparation platform that brings together coding problem practice, real-time WebRTC video sessions, an AI-powered hint engine, and mentor-led mock interviews in a single integrated environment.

The platform supports **three distinct user roles** — candidates who practice problems and book mentors, mentors who host live interview sessions, and admins who manage the full ecosystem.

---

## ✨ Features

### 👤 For Candidates

- **Problem Library** — Browse coding problems filtered by difficulty and tags; each problem includes a description, examples, constraints, function signature, and company tags
- **Monaco Code Editor** — Browser-based editor (VS Code engine) with syntax highlighting for JavaScript and Python 3
- **Code Execution** — Run code against visible test cases via a Docker-based sandboxed execution engine (10-second timeout, 256 MB limit)
- **Solution Submission** — Submit against all test cases (including hidden ones); get per-test-case pass/fail results with `accepted`, `wrong_answer`, `runtime_error`, and `compilation_error` statuses
- **AI Hints** — Get contextual, progressive hints powered by Google Gemini without revealing the full solution; hint panel slides into the problem view
- **Submission History** — Review all past submissions per problem
- **Streak Tracking** — Daily activity streak displayed as a floating badge in the problem view and as a banner on the dashboard
- **Activity Heatmap** — GitHub-style contribution heatmap showing coding activity over time on the dashboard
- **Mentor Discovery** — Browse mentor profiles, view expertise, bio, profile picture, and availability
- **Session Booking** — Book a 1:1 mock interview slot from a mentor's available time slots
- **Live Session Room** — Join a session room that combines:
  - WebRTC peer-to-peer **video call** (camera toggle, mic toggle)
  - **Screen sharing** (start/stop, auto-stops when browser stop sharing is clicked)
  - **Real-time collaborative Monaco editor** — both participants see keystrokes live via Socket.io
  - **In-session code execution** — either participant can run code; result broadcasts to both
  - **In-session chat** — persistent room chat with typing indicators and message history loaded from REST on join
  - **Resizable panels** (problem description | editor | chat) via `react-resizable-panels`
- **Subscription Plans** — Purchase a subscription plan via Stripe to unlock premium features (plan-gated problems)
- **Manage Subscription** — View active plan, status, and cancel/manage via the subscription page

### 🧑‍🏫 For Mentors

- **Mentor Activation** — Complete a profile (bio, expertise, hourly rate, profile picture uploaded to AWS S3 via presigned URLs) to be submitted for admin approval
- **Availability Management** — Set weekly recurring time slots that candidates can book
- **Booking Management** — View upcoming, active, and past sessions; session status lifecycle: `SCHEDULED → ACTIVE → ENDED / NO_SHOW / ABANDONED / EXPIRED`
- **Live Session Room** — Same collaborative workspace as the candidate side; mentor can swap the problem mid-session (broadcasts to student via socket); mentor's "Leave" navigates back to bookings
- **Post-session Review** — Candidate can leave a star rating + comment after a session ends; shown on the mentor's public profile

### 🛡️ For Admins

- **Dashboard** — Platform-wide metrics: total users, mentors, revenue, active sessions
- **User Management** — View all registered users, block/unblock accounts
- **Mentor Management** — Approve or reject mentor applications, manage mentor status
- **Problem Management** — Full CRUD for the problem library including title, description, difficulty, tags, company tags, function signature, starter code per language, test cases (visible and hidden), and premium flag
- **Plan Management** — Create and configure subscription tiers (name, price, features, problem access level)
- **Session Monitoring** — View all sessions across the platform with status filtering; navigate to session detail view
- **Revenue Monitoring** — Track Stripe payment and subscription revenue

---

## 🏗️ Architecture

zenCode follows a **layered clean architecture**: Routes → Controllers → Services → Repositories, with a dependency injection container per domain in `shared/di/`.

```
zenCode_/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD → AWS EC2
│
├── backend/                        # Node.js + Express 5 API (TypeScript)
│   └── src/
│       ├── config/                 # App config, MongoDB connection, Passport OAuth
│       ├── controllers/            # HTTP request handlers (per domain)
│       ├── services/               # Business logic layer
│       ├── repositories/           # MongoDB data access via Mongoose
│       ├── routes/                 # Express route definitions
│       ├── dtos/                   # Zod-validated Data Transfer Objects
│       ├── middlewares/            # Auth guard, global error handler
│       ├── constants/              # App-wide enums and magic values
│       ├── prompts/                # Gemini AI prompt templates
│       ├── interfaces/             # TypeScript interfaces for DI
│       ├── shared/
│       │   ├── di/                 # Dependency injection containers (per domain)
│       │   ├── utils/              # Logger (Winston), AppError, etc.
│       │   └── http/               # Shared HTTP utilities
│       └── infrastructure/
│           ├── cache/              # Redis (ioredis) — OTP, token blacklist, rate limiting
│           ├── cron/               # node-cron jobs (session cleanup, subscription expiry)
│           ├── database/           # Mongoose connection
│           ├── email/              # Nodemailer (OTP, booking confirmations)
│           ├── execution/          # Docker-based code runner (Python 3.10, Node 18)
│           ├── payments/           # Stripe (checkout sessions, webhooks)
│           ├── security/           # express-rate-limit
│           ├── storage/            # AWS S3 presigned URL generation
│           └── websocket/          # Socket.io server
│               ├── session.socket.ts   # Join/leave, WebRTC signalling relay, media/screen events
│               ├── collab.socket.ts    # Code sync (versioned), language change, run result broadcast
│               ├── chat.socket.ts      # In-session chat (send, typing start/stop, read receipt)
│               ├── presence.store.ts   # In-memory userId → socketId map
│               └── collab.store.ts     # In-memory roomId → editor state map
│
└── frontend/                       # React 19 + Vite + Tailwind CSS v4 (TypeScript)
    └── src/
        ├── features/
        │   ├── admin/              # Admin pages: Dashboard, Users, Mentors, Problems, Plans, Sessions, Revenue
        │   ├── candidate/          # Candidate pages: Dashboard, ProblemList, ProblemDetail, Mentors, Bookings, SessionRoom, Submissions
        │   ├── mentor/             # Mentor pages: Login, Dashboard, Availability, Bookings, Profile, SessionRoom, Reset/Forgot Password
        │   ├── user/               # Auth pages: Landing, Login, Register, OTP, ForgotPassword, ResetPassword, GoogleCallback
        │   ├── subscription/       # Plans, PaymentSuccess, PaymentCancel, ManageSubscription
        │   └── notification/       # In-app notification list
        ├── shared/
        │   ├── components/
        │   │   ├── Navbar.tsx
        │   │   ├── ProtectedRoute.tsx
        │   │   └── session/        # SessionWorkspaceLayout, VideoGrid, CodeCollabPanel, SessionChat, SessionProblemPanel, ReviewModal
        │   ├── hooks/
        │   │   ├── useWebRTC.ts    # Full WebRTC hook: offer/answer/ICE, media controls, screen share
        │   │   └── useSocket.ts    # Socket.io connection + session event handlers
        │   ├── lib/                # Axios instance, token service (JWT decode)
        │   ├── services/           # Session workspace API service
        │   └── utils/              # Toast helpers
        ├── store/                  # Redux Toolkit slices
        └── routes/                 # Route definitions with role-based protection
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend framework** | React | 19 |
| **Build tool** | Vite | 7 |
| **Styling** | Tailwind CSS | 4 |
| **State management** | Redux Toolkit | 2 |
| **Code editor** | Monaco Editor (`@monaco-editor/react`) | 4 |
| **Resizable panels** | react-resizable-panels | 4 |
| **Forms & validation** | react-hook-form + Zod | — |
| **HTTP client** | Axios | 1 |
| **Backend framework** | Express | 5 |
| **Language** | TypeScript | 6 (backend) / 5.9 (frontend) |
| **Database** | MongoDB via Mongoose | 9 |
| **Cache** | Redis via ioredis | 5 |
| **Real-time** | Socket.io | 4 |
| **Video calls** | WebRTC (browser native, signalled via Socket.io) | — |
| **Authentication** | JWT (access 15 min + refresh 7 days) + Google OAuth 2.0 via Passport.js | — |
| **Payments** | Stripe (checkout sessions + webhooks) | 22 |
| **AI** | Google Gemini (`@google/generative-ai`) | 0.24 |
| **File storage** | AWS S3 (presigned URL uploads, `@aws-sdk/client-s3`) | 3 |
| **Email** | Nodemailer | 8 |
| **Code execution** | Docker (`python:3.10-alpine`, `node:18-alpine`) | — |
| **Validation** | Zod | 4 |
| **Logging** | Winston | 3 |
| **Scheduling** | node-cron | 4 |
| **Security** | Helmet, express-rate-limit, bcrypt | — |
| **Deployment** | AWS EC2 + Nginx + PM2 | — |
| **CI/CD** | GitHub Actions | — |

---

## 🔄 CI/CD Pipeline

Every push to `main` triggers the GitHub Actions workflow:

```
git push → main
    │
    ├── 1. Build Frontend
    │       npm ci → inject VITE_API_URL + VITE_SOCKET_URL → npm run build
    │
    ├── 2. Build Backend
    │       npm ci → tsc (compile TypeScript)
    │
    ├── 3. Deploy to AWS EC2
    │       rsync via SSH (excludes node_modules, src, .git)
    │
    └── 4. Restart Services on EC2
            ├── cd /home/ubuntu/zencode/backend && npm ci --omit=dev
            ├── pm2 restart zencode-api && pm2 save
            ├── sudo rm -rf /var/www/html/* && sudo cp -r frontend/dist/* /var/www/html/
            └── sudo systemctl reload nginx
```

**GitHub Secrets required:**

| Secret | Description |
|---|---|
| `AWS_SSH_KEY` | EC2 private SSH key |
| `AWS_HOST` | EC2 public hostname / IP |
| `AWS_USERNAME` | SSH user (e.g. `ubuntu`) |

> All backend environment variables (database URIs, Stripe keys, JWT secrets, etc.) are managed directly on the EC2 instance — none are stored in GitHub Secrets.

---

## 🌐 Production Infrastructure

```
User
 └─→ Nginx  (zencode.site)
        ├── /* → serves React SPA from /var/www/html/
        └── /api/* → proxy_pass → localhost:5001 (Express)
                          │
                          ├── PM2 process: zencode-api
                          ├── MongoDB Atlas
                          ├── Redis Cloud
                          ├── AWS S3  (avatar storage)
                          └── Stripe  (payments)
```

---

## 🚀 Local Development

### Prerequisites

| Requirement | Notes |
|---|---|
| Node.js ≥ 20 | |
| MongoDB | Local or Atlas |
| Redis | Local or cloud |
| Docker | Required for code execution engine |
| AWS S3 bucket | For mentor avatar uploads |
| Stripe account | For subscription payments |
| Google OAuth credentials | For social login |
| Google Gemini API key | For AI hints |

### 1. Clone

```bash
git clone https://github.com/your-username/zenCode_.git
cd zenCode_
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # populate values below
npm install
npm run dev            # ts-node-dev with hot reload on :5001
```

**Required backend `.env` variables:**

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/zencode
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5001

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Google OAuth 2.0
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3
AWS_S3_REGION=ap-south-1
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Google Gemini
GEMINI_API_KEY=

# Cookies
COOKIE_HTTP_ONLY=true
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
COOKIE_MAX_AGE=604800000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # Vite dev server on :5173
```

**Frontend `.env`:**

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

---

## 📦 Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start with hot reload (`ts-node-dev`) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint errors |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production bundle (`tsc -b && vite build`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 🗂️ API Reference

| Route prefix | Domain |
|---|---|
| `GET /health` | Health check |
| `/api/auth` | Candidate auth (register, login, OTP verify, forgot/reset password, Google OAuth) |
| `/api/admin/auth` | Admin login |
| `/api/admin` | User management, mentor management, session monitoring |
| `/api/admin/revenue` | Revenue & subscription analytics |
| `/api/mentor/auth` | Mentor register, login, forgot/reset password |
| `/api/mentor/availability` | Mentor availability slot CRUD |
| `/api/mentor-slots` | Slot lookup for candidates |
| `/api/mentor-bookings` | Session booking CRUD |
| `/api/mentor-sessions` | Active session management, validation, workspace state |
| `/api/mentor-reviews` | Post-session reviews |
| `/api/mentor/profile` | Mentor profile update (bio, avatar, expertise) |
| `/api/candidates/mentors` | Candidate-facing mentor discovery & profile view |
| `/api/problems` | Problem library CRUD |
| `/api/compiler` | Code execution (returns a polling token) |
| `/api/submissions` | Solution submission & history |
| `/api/plans` | Subscription plan management |
| `/api/payments` | Stripe checkout sessions & payment intents |
| `/api/payments/webhook` | Stripe webhook handler (raw body, signature verified) |
| `/api/subscriptions` | Subscription status, cancel |
| `/api/messages` | Session chat history (REST, per room) |
| `/api/notifications` | In-app notifications |
| `/api/ai-hints` | Gemini AI hint generation per problem |
| `/api/dashboard` | Candidate dashboard stats (streak, heatmap, recent submissions) |

---

## ⚙️ Background Jobs (Cron)

| Job | Schedule | What it does |
|---|---|---|
| **Session cleanup** | Every minute (`* * * * *`) | Marks stale/abandoned sessions based on heartbeat timeout |
| **Subscription expiry** | Daily at midnight (`0 0 * * *`) | Marks subscriptions with a past `endDate` as `expired` (safety net for missed Stripe webhooks) |

---

## 🔌 WebSocket Events

The Socket.io server handles the following event namespaces:

**Session lifecycle**

| Event | Direction | Description |
|---|---|---|
| `session:join` | Client → Server | Join a session room (validates access) |
| `session:joined-success` | Server → Client | Confirms join with participant list & editor state |
| `session:leave` | Client → Server | Leave the room |
| `session:error` | Server → Client | Access denied or validation failure |
| `session:participant-online/offline` | Server → Room | Peer joined/left |
| `session:heartbeat` | Client → Server | Keep-alive (used by cron for stale detection) |

**WebRTC signalling (relayed by server)**

| Event | Description |
|---|---|
| `webrtc:offer` | SDP offer from caller to callee |
| `webrtc:answer` | SDP answer from callee |
| `webrtc:ice-candidate` | ICE candidate exchange |
| `media:state-changed` | Mic/camera toggle broadcasted to peer |
| `screen-share:started/stopped` | Screen share status broadcasted to peer |

**Collaborative editor**

| Event | Description |
|---|---|
| `collab:code-changed` | Code diff with monotonic version number (stale updates dropped) |
| `collab:code-sync` | Server re-broadcasts to room |
| `collab:language-changed` | Language switch broadcasted to room |
| `collab:run-result` | Execution result broadcasted to both participants |
| `collab:problem-changed` | Mentor swaps the active problem in the session |

**Chat**

| Event | Description |
|---|---|
| `chat:send-message` | Send a message in the room |
| `chat:new-message` | Server broadcasts message to room |
| `chat:typing-start/stop` | Typing indicator relay |
| `chat:message-read` | Mark messages as read |

---

## 📋 Project Status

> **This is an MVP** — core features are functional and deployed to production.

**Implemented & working:**
- ✅ Full candidate auth (email/OTP, Google OAuth, forgot/reset password)
- ✅ Full mentor auth with admin approval flow
- ✅ Problem library with per-problem language support and starter code
- ✅ Monaco editor (JavaScript & Python 3)
- ✅ Docker-based sandboxed code execution with test case evaluation
- ✅ Solution submission with hidden test cases
- ✅ Google Gemini AI hints per problem
- ✅ Candidate activity dashboard: streak, heatmap, recent submissions
- ✅ Mentor discovery, availability scheduling, and session booking
- ✅ Live mock interview room: WebRTC video/audio, screen sharing, collaborative editor, in-session chat
- ✅ Session state persistence (editor code, language, last run result) across reconnects
- ✅ Session lifecycle management (SCHEDULED → ACTIVE → ENDED) with cron-based cleanup
- ✅ Stripe subscription plans with plan-gated problem access
- ✅ AWS S3 avatar uploads via presigned URLs
- ✅ Email notifications via Nodemailer
- ✅ Redis-backed OTP verification and token management
- ✅ Admin dashboard with full platform management
- ✅ Automated GitHub Actions CI/CD to AWS EC2

---

<div align="center">

Crafted from scratch by **Kannan S** · © 2026 zenCode

⚡ _Code hard. Interview harder._

</div>
