import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/auth';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listCategories));
router.post('/', asyncHandler(createCategory));
router.patch('/:id', asyncHandler(updateCategory));
router.delete('/:id', asyncHandler(deleteCategory));

export default router;
