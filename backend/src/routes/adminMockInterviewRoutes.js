import express from 'express';
import {
  getAdminQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  publishQuestion,
  unpublishQuestion,
} from '../controllers/adminMockInterviewController.js';
import authenticate from '../middleware/authMiddleware.js';
import requireAdmin from '../middleware/adminMiddleware.js';

const router = express.Router();

// Admin routes strictly require authentication and admin role authorization
router.use(authenticate, requireAdmin);

router.get('/questions', getAdminQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);
router.patch('/questions/:id/publish', publishQuestion);
router.patch('/questions/:id/unpublish', unpublishQuestion);

export default router;
