import express from 'express';
import {
  getAdminTheoryList,
  createTheory,
  updateTheory,
  deleteTheory,
  publishTheory,
  unpublishTheory,
} from '../controllers/adminCoreCSTheoryController.js';
import authenticate from '../middleware/authMiddleware.js';
import requireAdmin from '../middleware/adminMiddleware.js';
import { uploadCoreCSMaterial } from '../utils/coreCSStorage.js';

const router = express.Router();

// Admin routes strictly require authentication AND admin role
router.use(authenticate, requireAdmin);

router.get('/', getAdminTheoryList);
router.post('/', uploadCoreCSMaterial.single('file'), createTheory);
router.put('/:id', uploadCoreCSMaterial.single('file'), updateTheory);
router.delete('/:id', deleteTheory);
router.patch('/:id/publish', publishTheory);
router.patch('/:id/unpublish', unpublishTheory);

export default router;
