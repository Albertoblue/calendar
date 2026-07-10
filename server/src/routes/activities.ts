import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/auth';
import {
  listActivities,
  listMemories,
  onThisDay,
  createActivity,
  updateActivity,
  deleteActivity,
  addException,
  detachOccurrence,
} from '../controllers/activityController';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listActivities));
router.get('/memories', asyncHandler(listMemories));
router.get('/on-this-day', asyncHandler(onThisDay));
router.post('/', asyncHandler(createActivity));
router.post('/:id/exceptions', asyncHandler(addException));
router.post('/:id/detach', asyncHandler(detachOccurrence));
router.patch('/:id', asyncHandler(updateActivity));
router.delete('/:id', asyncHandler(deleteActivity));

export default router;
