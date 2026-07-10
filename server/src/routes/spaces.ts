import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { createSpace, joinSpace, currentSpace } from '../controllers/spaceController';

const router = Router();

router.use(requireAuth);
router.post('/', asyncHandler(createSpace));
router.post('/join', asyncHandler(joinSpace));
router.get('/current', asyncHandler(currentSpace));

export default router;
