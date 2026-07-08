import express from 'express';
import { askAssistant } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

const askSchema = {
    question: { required: true, type: 'string', minLength: 3, maxLength: 500, trim: true }
};

router.post('/ask', protect, requireRole('manager'), validateRequest(askSchema), askAssistant);

export default router;