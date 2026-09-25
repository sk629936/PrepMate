import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/dashboard (Protected route)
router.get('/', authenticate, getDashboardData);

export default router;
