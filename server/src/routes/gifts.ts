import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/auth';
import {
  listGifts,
  createGift,
  updateGift,
  deleteGift,
  reserveGift,
} from '../controllers/giftController';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listGifts));
router.post('/', asyncHandler(createGift));
router.post('/:id/reserve', asyncHandler(reserveGift));
router.patch('/:id', asyncHandler(updateGift));
router.delete('/:id', asyncHandler(deleteGift));

export default router;
