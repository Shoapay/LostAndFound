import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
  cancelItem
} from '../controllers/itemController';
import { authenticate } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.post('/', authenticate, upload.single('image'), createItem);
router.get('/', getItems);
router.get('/my', authenticate, getMyItems);
router.get('/:id', getItemById);
router.put('/:id', authenticate, updateItem);
router.delete('/:id', authenticate, deleteItem);
router.post('/:id/cancel', authenticate, cancelItem);

export default router;