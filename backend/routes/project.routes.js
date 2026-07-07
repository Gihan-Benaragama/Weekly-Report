import express from 'express';
import {
    createProject,
    getProjects,
    updateProject,
    deleteProject,
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// All authenticated users can view projects (needed for report form dropdown)
router.get('/', protect, getProjects);

// Only managers can create/edit/delete projects
router.post('/', protect, requireRole('manager'), createProject);
router.put('/:id', protect, requireRole('manager'), updateProject);
router.delete('/:id', protect, requireRole('manager'), deleteProject);

export default router;