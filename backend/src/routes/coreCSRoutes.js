import express from 'express';
import {
  getQuestions,
  getQuestionById,
  submitPracticeAnswer,
  getUserProgress,
  generateTest,
  submitTest,
  getTestResult,
} from '../controllers/coreCSController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

// Question browsing & details (returns only published questions, no correct answers/explanations)
router.get('/questions', getQuestions);
router.get('/questions/:id', getQuestionById);

// Practice answer submission & evaluation (JWT protected)
router.post('/practice/submit', authenticate, submitPracticeAnswer);

// User progress calculation (JWT protected)
router.get('/progress', authenticate, getUserProgress);

// Timed / Sectional Test endpoints (JWT protected)
router.post('/tests/generate', authenticate, generateTest);
router.post('/tests/:id/submit', authenticate, submitTest);
router.get('/tests/:id/result', authenticate, getTestResult);

export default router;
