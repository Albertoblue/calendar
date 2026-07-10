import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/auth';
import {
  listCountdowns,
  createCountdown,
  updateCountdown,
  deleteCountdown,
} from '../controllers/countdownController';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listCountdowns));
router.post('/', asyncHandler(createCountdown));
router.patch('/:id', asyncHandler(updateCountdown));
router.delete('/:id', asyncHandler(deleteCountdown));

export default router;
