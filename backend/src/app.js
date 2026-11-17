import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import dsaRoutes from './routes/dsaRoutes.js';
import aptitudeRoutes from './routes/aptitudeRoutes.js';
import adminAptitudeRoutes from './routes/adminAptitudeRoutes.js';
import coreCSRoutes from './routes/coreCSRoutes.js';
import adminCoreCSRoutes from './routes/adminCoreCSRoutes.js';
import coreCSTheoryRoutes from './routes/coreCSTheoryRoutes.js';
import adminCoreCSTheoryRoutes from './routes/adminCoreCSTheoryRoutes.js';
import adminDSARoutes from './routes/adminDSARoutes.js';
import mockInterviewRoutes from './routes/mockInterviewRoutes.js';
import adminMockInterviewRoutes from './routes/adminMockInterviewRoutes.js';

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — intentionally exposes no credentials, env vars, or DB info
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PrepMate API is running',
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// DSA routes
app.use('/api/dsa', dsaRoutes);

// Aptitude routes
app.use('/api/aptitude', aptitudeRoutes);

// Admin Aptitude routes
app.use('/api/admin/aptitude', adminAptitudeRoutes);

// Admin DSA routes
app.use('/api/admin/dsa', adminDSARoutes);

// Core CS routes (Questions, Practice, Tests)
app.use('/api/core-cs', coreCSRoutes);

// Core CS Theory & Study Material routes
app.use('/api/core-cs/theory', coreCSTheoryRoutes);

// Admin Core CS routes (Questions)
app.use('/api/admin/core-cs', adminCoreCSRoutes);

// Admin Core CS Theory & Study Material routes
app.use('/api/admin/core-cs/theory', adminCoreCSTheoryRoutes);

// Mock Interview routes (Student)
app.use('/api/mock-interviews', mockInterviewRoutes);

// Admin Mock Interview routes
app.use('/api/admin/mock-interviews', adminMockInterviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

export default app;
