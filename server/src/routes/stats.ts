import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { getStats } from '../controllers/statsController';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(getStats));

export default router;
