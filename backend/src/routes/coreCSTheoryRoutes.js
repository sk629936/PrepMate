import express from 'express';
import {
  getPublishedTheoryList,
  getPublishedTheoryById,
  streamTheoryFile,
} from '../controllers/coreCSTheoryController.js';

const router = express.Router();

// Public Theory & Study Material browsing (published only)
router.get('/', getPublishedTheoryList);
router.get('/:id', getPublishedTheoryById);
router.get('/:id/file', streamTheoryFile);

export default router;
