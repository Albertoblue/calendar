import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/auth';
import {
  listWishlist,
  createWish,
  updateWish,
  deleteWish,
  scheduleWish,
} from '../controllers/wishlistController';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listWishlist));
router.post('/', asyncHandler(createWish));
router.patch('/:id', asyncHandler(updateWish));
router.delete('/:id', asyncHandler(deleteWish));
router.post('/:id/schedule', asyncHandler(scheduleWish));

export default router;
