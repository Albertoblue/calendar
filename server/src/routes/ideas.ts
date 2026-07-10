import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/auth';
import {
  listIdeas,
  createIdea,
  updateIdea,
  deleteIdea,
  rateIdea,
  searchMoviesCtrl,
  searchPlacesCtrl,
  topRatedCtrl,
  discoverPlacesCtrl,
} from '../controllers/ideaController';

const router = Router();

router.use(requireAuth);
router.get('/search/movies', asyncHandler(searchMoviesCtrl));
router.get('/search/places', asyncHandler(searchPlacesCtrl));
router.get('/discover/movies', asyncHandler(topRatedCtrl));
router.get('/discover/places', asyncHandler(discoverPlacesCtrl));
router.get('/', asyncHandler(listIdeas));
router.post('/', asyncHandler(createIdea));
router.post('/:id/rate', asyncHandler(rateIdea));
router.patch('/:id', asyncHandler(updateIdea));
router.delete('/:id', asyncHandler(deleteIdea));

export default router;
