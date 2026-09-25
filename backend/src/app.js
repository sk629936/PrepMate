import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import dsaRoutes from './routes/dsaRoutes.js';
import aptitudeRoutes from './routes/aptitudeRoutes.js';
import adminAptitudeRoutes from './routes/adminAptitudeRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

export default app;
