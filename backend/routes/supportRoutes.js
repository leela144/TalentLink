import express from 'express';
import { sendSupportMessage } from '../controllers/supportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', sendSupportMessage);

export default router;
