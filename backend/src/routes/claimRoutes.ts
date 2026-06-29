import { Router } from 'express';
import {
  createClaim,
  getClaims,
  getMyClaims,
  approveClaim,
  rejectClaim
} from '../controllers/claimController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/:itemId', authenticate, createClaim);
router.get('/', authenticate, getClaims);
router.get('/my', authenticate, getMyClaims);
router.post('/:claimId/approve', authenticate, approveClaim);
router.post('/:claimId/reject', authenticate, rejectClaim);

export default router;