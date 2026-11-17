import express from 'express';
import {
  generateMockInterview,
  startMockInterview,
  saveAnswer,
  submitMockInterview,
  getMockInterviewResult,
  getMockInterviewHistory,
  getMockInterviewProgress,
} from '../controllers/mockInterviewController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

// All student mock interview routes require valid JWT authentication
router.use(authenticate);

// 1. Generate a new Mock Interview session
router.post('/generate', generateMockInterview);

// 2. User history and overall progress
router.get('/history', getMockInterviewHistory);
router.get('/progress', getMockInterviewProgress);

// 3. Interview session lifecycle
router.post('/:id/start', startMockInterview);
router.post('/:id/answer', saveAnswer);
router.post('/:id/submit', submitMockInterview);
router.get('/:id/result', getMockInterviewResult);

export default router;
