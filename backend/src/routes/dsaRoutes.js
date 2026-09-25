import express from 'express';
import {
  getDSAData,
  getProblem,
  markProblemSolved,
  markProblemUnsolved,
} from '../controllers/dsaController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

// All DSA routes require authentication
router.use(authenticate);

// Listing data & user progress
router.get('/data', getDSAData);

// Problem detail
router.get('/problems/:problemId', getProblem);

// Mark as solved / unsolved
router.post('/solve', markProblemSolved);
router.post('/unsolve', markProblemUnsolved);

export default router;

