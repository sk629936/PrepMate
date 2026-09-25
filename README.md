# PrepMate - AI-Powered Placement Preparation Platform

A comprehensive platform for college students to prepare for placements through DSA practice, aptitude preparation, mock tests, and AI-powered interview coaching.

## Project Structure

```
placement_prep/
├── frontend/          # React + Vite frontend application
├── backend/           # Node.js + Express backend application
└── README.md          # This file
```

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Mongoose

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB (local or Atlas)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

The backend will be available at `http://localhost:5000`

## Development Phases

- Phase 0: Planning
- Phase 1: UI/UX & Design System
- Phase 2: Frontend project setup
- Phase 3: Landing page
- Phase 4: Login and Signup UI
- Phase 5: Backend setup
- Phase 6: MongoDB and authentication
- Phase 7: Student Dashboard
- Phase 8: Preparation and question system
- Phase 9: Mock Tests
- Phase 10: Progress and analytics
- Phase 11: Admin Panel
- Phase 12: AI features
- Phase 13: Security, validation and error handling
- Phase 14: Deployment
- Phase 15: Documentation

## Features

- DSA Practice
- Aptitude Training
- Core CS Preparation
- Mock Tests
- AI Interview Preparation
- Resume Analyzer
- Skill Gap Analysis
- Progress Tracking
- Student Profiles
- Admin Management

## Security

- Password hashing with bcryptjs
- JWT authentication
- Environment variables for secrets
- CORS configuration
- Input validation with Zod

## License

ISC
