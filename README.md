# PrepMate — AI-Powered Placement Preparation Platform

PrepMate is a full-stack web application engineered to help college students systematically prepare for competitive software engineering campus placements and technical interviews.

---

## 1. Problem Statement & Solution

### The Challenge
Campus placement preparation is traditionally fragmented across disconnected platforms:
- Students practice coding on external judge platforms without consolidated tracking.
- Quantitative aptitude and logical reasoning questions lack realistic timed simulation environments.
- Core Computer Science fundamentals (Operating Systems, DBMS, Computer Networks, OOP, Software Engineering) are reviewed via disjointed notes.
- Mock interviews are rarely standardized or accessible with structured rubric evaluations.

### The PrepMate Solution
PrepMate unifies the four critical pillars of technical placement preparation into a cohesive, high-performance platform:
1. **DSA Preparation:** 44 curated placement coding problems across core patterns with LeetCode integration, problem status tracking, and private solution notes.
2. **Aptitude Mastery:** Practice drills and timed test simulators across Quantitative, Logical, and Verbal reasoning with instant scoring and detailed answer keys.
3. **Core CS Curriculum:** Deep-dive theory notes, topic-level practice drills, timed tests, and progress tracking across 5 foundational computer science subjects.
4. **Mock Interview Simulator:** Full interview lifecycle including audio/video environment checks, timed question sessions, automated rubric evaluation (technical keywords + STAR method for behavioral), detailed score reports, and historical progress trajectories.
5. **Centralized Administration:** Admin panel for managing question banks, uploading curriculum materials, and overseeing content quality.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 (`react`, `react-dom`)
- **Build Tool:** Vite 8 (Ultra-fast HMR and optimized production bundling)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Routing:** Lightweight, zero-dependency Single-Page Application (SPA) client router
- **HTTP Client:** Native browser Fetch API with bearer token authentication
- **Design System:** High-contrast monochrome & neutral slate palette, zero-blue token governance, accessible tap targets, fully responsive across 375px mobile, tablet, and desktop

### Backend
- **Runtime & Framework:** Node.js (v18+) with Express.js (ES Modules `"type": "module"`)
- **Database & ODM:** MongoDB Atlas with Mongoose ODM
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) + Password Hashing via `bcryptjs` (12 salt rounds)
- **Security:** Strict CORS origin validation, role-based access control (RBAC), SHA-256 hashed OTPs with cooldown guards
- **Document Ingestion:** Multer (memory and disk storage pipelines), `pdf-parse` for automated question bank ingestion

---

## 3. Project Structure

```
placement_prep/
├── frontend/                          # React + Vite client application
│   ├── public/                        # Static assets (favicons, SVG icons)
│   ├── src/
│   │   ├── components/                # Reusable UI modules (landing, auth, admin, mockInterview, core-cs)
│   │   ├── hooks/                     # Custom React hooks (useAuth authentication guard)
│   │   ├── pages/                     # Routed page views (DSA, Aptitude, Core CS, Mock Interview, Dashboard, Admin)
│   │   ├── App.jsx                    # Primary application router and view controller
│   │   └── main.jsx                   # React root entrypoint
│   ├── vercel.json                    # Vercel SPA rewrite rule configuration
│   └── package.json                   # Frontend dependencies and build scripts
│
├── backend/                           # Express.js REST API
│   ├── server.js                      # Server entrypoint with MongoDB connection bootstrap
│   ├── src/
│   │   ├── config/                    # Database and environment configurations
│   │   ├── controllers/               # Route logic (auth, dashboard, dsa, aptitude, core-cs, mockInterview, admin)
│   │   ├── data/                      # Catalogs and idempotent auto-seeding datasets
│   │   ├── middleware/                # JWT authentication & admin authorization guards
│   │   ├── models/                    # Mongoose schemas (User, DSAProblem, AptitudeQuestion, CoreCS, MockInterview)
│   │   ├── routes/                    # API route definitions
│   │   └── services/                  # Email service, PDF parser, and interview rubric evaluator
│   └── package.json                   # Backend dependencies and startup scripts
│
├── .gitignore                         # Git exclusion rules (protects .env, uploads, node_modules)
└── README.md                          # Technical documentation
```

---

## 4. Implemented Modules & Features

| Module | Features & Capabilities |
|---|---|
| **Authentication & Profile** | User signup, secure login, persistent session verification (`/api/auth/me`), and SHA-256 hashed password reset OTP flow. |
| **Student Dashboard** | High-level analytics aggregating DSA completion percentages, aptitude test metrics, and overall placement readiness scores. |
| **DSA Tracker** | Curated 44-problem catalog categorized by topic and difficulty, solve state persistence, private notes editor, and direct external problem links. |
| **Aptitude Training** | Practice mode by chapter and topic, dynamic test generator with time limits, automated evaluation, answer key reviews, and attempt history logs. |
| **Core CS Preparation** | Dedicated curricula for OS, DBMS, CN, OOP, and SE; structured theory notes, practice drills, timed tests, and per-subject mastery scores. |
| **Mock Interview Simulator** | Pre-session hardware checks (mic & camera streams), real-time timed interview rounds, keyword and STAR method rubric evaluations, score breakdown, past history log, and progress dashboard. |
| **Admin Panel** | Centralized dashboard for staff to add, edit, or publish questions across Aptitude, DSA, Core CS, and Mock Interview banks, with bulk PDF question import. |

---

## 5. Local Setup Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Active MongoDB instance (Local or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd placement_prep
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Configure your `.env` file with appropriate environment values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_jwt_secret_min_32_chars
FRONTEND_URL=http://localhost:5173
OTP_EXPIRES_MINUTES=10
```

Start the backend API server:
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```
The API will initialize and listen on `http://localhost:5000`. Health check endpoint: `http://localhost:5000/api/health`.

### 3. Frontend Setup
Open a separate terminal window:
```bash
cd frontend
npm install
cp .env.example .env
```

Ensure `frontend/.env` points to your backend instance:
```env
VITE_API_URL=http://localhost:5000
```

Start the Vite development server:
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

---

## 6. Deployment Architecture

```
                    ┌─────────────────────────┐
                    │      Client Browser     │
                    └────────────┬────────────┘
                                 │ HTTPS (Webcam / Mic / UI)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Vercel Edge Network                         │
│   Frontend Single-Page Application (React 19 + Vite 8 + CSS)    │
│   • vercel.json SPA rewrites (/* -> /index.html)                │
│   • Automatic SSL/TLS Certificate Provisioning                  │
└────────────────────────────────┬────────────────────────────────┘
                                 │ REST API Calls (Bearer Token)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Render Cloud Platform                      │
│                Backend Web Service (Node.js + Express)          │
│   • Dynamic PORT binding via process.env.PORT                   │
│   • CORS Origin validation via FRONTEND_URL                     │
│   • Health check probe available at /api/health                 │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Encrypted Mongoose Connection
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Atlas Cluster                      │
│   • Collections: users, dsaproblems, aptitudequestions, etc.    │
│   • Network Access: 0.0.0.0/0 (for dynamic cloud IP ingress)    │
│   • Idempotent non-destructive auto-seeding                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Listening HTTP port (Render assigns automatically) | `5000` |
| `NODE_ENV` | Application environment mode | `production` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing authentication tokens | `crypto-random-32-chars` |
| `FRONTEND_URL` | Allowed CORS origin (Vercel production URL, no trailing slash) | `https://prepmate.vercel.app` |
| `OTP_EXPIRES_MINUTES` | Password reset OTP validity window | `10` |
| `SMTP_HOST` | *(Optional)* SMTP host for email delivery | `smtp.gmail.com` |
| `SMTP_PORT` | *(Optional)* SMTP port | `587` |
| `SMTP_USER` | *(Optional)* SMTP username / email | `user@example.com` |
| `SMTP_PASSWORD` | *(Optional)* SMTP app password | `app-password` |
| `SMTP_FROM` | *(Optional)* Sender display header | `"PrepMate" <no-reply@prepmate.com>` |

### Frontend (`frontend/.env`)
| Variable | Description | Example / Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API (no trailing slash) | `https://prepmate-api.onrender.com` |

---

## 8. GitHub Repository Readiness

- **Sensitive Files Protected:** Root and backend `.gitignore` rules prevent staging `.env` files, credentials, logs, and local uploads.
- **Clean Git Tracking:** Binary build artifacts (`dist/`) and local test documents (`backend/uploads/`) are excluded from version control.
- **Single Source of Truth:** `.env.example` templates document all required configuration variables without revealing credentials.

---

## 9. License

This project is developed for college placement preparation and academic evaluations.
