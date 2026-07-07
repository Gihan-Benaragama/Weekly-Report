import express from 'express';
import { askAssistant } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/ask', protect, requireRole('manager'), askAssistant);

export default router;