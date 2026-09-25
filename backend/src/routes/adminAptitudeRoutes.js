import express from 'express';
import multer from 'multer';
import {
  getAdminQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  togglePublishQuestion,
  handlePdfUpload,
  batchSaveQuestions,
} from '../controllers/adminAptitudeController.js';
import authenticate from '../middleware/authMiddleware.js';
import requireAdmin from '../middleware/adminMiddleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = express.Router();

// Admin routes require authentication AND admin role authorization
router.use(authenticate, requireAdmin);

router.get('/questions', getAdminQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);
router.patch('/questions/:id/publish', togglePublishQuestion);
router.post('/pdf-upload', upload.single('file'), handlePdfUpload);
router.post('/batch-save', batchSaveQuestions);

export default router;
