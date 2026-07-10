import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { suggest } from '../controllers/suggestController';

const router = Router();

router.use(requireAuth);
router.post('/', asyncHandler(suggest));

export default router;
