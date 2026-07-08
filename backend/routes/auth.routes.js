import express from 'express';
import { registerUser, loginUser, getMe, googleLogin, getMembers } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

const registerSchema = {
    name: { required: true, type: 'string', minLength: 2 },
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string', minLength: 8 },
    role: { required: false, type: 'string', enum: ['member', 'manager'] }
};

const loginSchema = {
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string' }
};

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.get('/members', protect, requireRole('manager'), getMembers);

export default router;