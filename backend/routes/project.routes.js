import express from 'express';
import {
    createProject,
    getProjects,
    updateProject,
    deleteProject,
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

const projectSchema = {
    name: { required: true, type: 'string', minLength: 3 },
    description: { required: false, type: 'string' },
    assignedMembers: { required: false, type: 'array' }
};

const updateProjectSchema = {
    name: { required: false, type: 'string', minLength: 3 },
    description: { required: false, type: 'string' },
    assignedMembers: { required: false, type: 'array' }
};

// All authenticated users can view projects (needed for report form dropdown)
router.get('/', protect, getProjects);

// Only managers can create/edit/delete projects
router.post('/', protect, requireRole('manager'), validateRequest(projectSchema), createProject);
router.put('/:id', protect, requireRole('manager'), validateRequest(updateProjectSchema), updateProject);
router.delete('/:id', protect, requireRole('manager'), deleteProject);

export default router;