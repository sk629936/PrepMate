import express from 'express';
import {
  getCategories,
  getTopics,
  getQuestions,
  getQuestionById,
  attemptQuestion,
  getUserProgress,
  getTestTypes,
  generateTestSession,
  submitTestSession,
  getResults,
} from '../controllers/aptitudeController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

// All aptitude routes require authentication
router.use(authenticate);

// Metadata & catalog
router.get('/categories', getCategories);
router.get('/topics', getTopics);

// Practice questions
router.get('/questions', getQuestions);
router.get('/questions/:id', getQuestionById);
router.post('/questions/:id/attempt', attemptQuestion);

// User progress
router.get('/progress', getUserProgress);

// Timed tests
router.get('/tests', getTestTypes);
router.get('/tests/:id', generateTestSession);
router.post('/tests/:id/submit', submitTestSession);
router.get('/results', getResults);

export default router;
