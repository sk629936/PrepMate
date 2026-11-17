import express from 'express';
import {
  getAdminDSAProblems,
  createDSAProblem,
  updateDSAProblem,
  togglePublishDSAProblem,
  toggleActiveDSAProblem,
  deleteDSAProblem,
} from '../controllers/adminDSAController.js';
import authenticate from '../middleware/authMiddleware.js';
import requireAdmin from '../middleware/adminMiddleware.js';

const router = express.Router();

// Admin routes strictly require authentication AND verified admin role in MongoDB
router.use(authenticate, requireAdmin);

// GET /api/admin/dsa/problems - List problems with filters and stats
router.get('/problems', getAdminDSAProblems);

// POST /api/admin/dsa/problems - Add new problem
router.post('/problems', createDSAProblem);

// PUT /api/admin/dsa/problems/:id - Edit problem metadata
router.put('/problems/:id', updateDSAProblem);

// PATCH /api/admin/dsa/problems/:id/publish - Toggle publish/unpublish
router.patch('/problems/:id/publish', togglePublishDSAProblem);

// PATCH /api/admin/dsa/problems/:id/active - Toggle active/inactive
router.patch('/problems/:id/active', toggleActiveDSAProblem);

// DELETE /api/admin/dsa/problems/:id - Safe deletion (soft-deletes if solved records exist)
router.delete('/problems/:id', deleteDSAProblem);

export default router;
