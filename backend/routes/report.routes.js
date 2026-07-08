import express from 'express';
import {
    createReport,
    getMyReports,
    updateReport,
    deleteReport,
    getAllReports,
    getReportStats,
    downloadReportPDF,
} from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

const createReportSchema = {
    project:        { required: true,  type: 'objectId' },
    weekStart:      { required: true,  type: 'date' },
    weekEnd:        { required: true,  type: 'date' },
    tasksCompleted: { required: true,  type: 'string', minLength: 5, maxLength: 2000, trim: true },
    tasksPlanned:   { required: true,  type: 'string', minLength: 5, maxLength: 2000, trim: true },
    blockers:       { required: false, type: 'string', maxLength: 1000 },
    hoursWorked:    { required: false, type: 'number', min: 0, max: 168 },
    notes:          { required: false, type: 'string', maxLength: 1000 },
    status:         { required: false, type: 'string', enum: ['submitted', 'pending', 'late'] },
};

const updateReportSchema = {
    project:        { required: false, type: 'objectId' },
    weekStart:      { required: false, type: 'date' },
    weekEnd:        { required: false, type: 'date' },
    tasksCompleted: { required: false, type: 'string', minLength: 5, maxLength: 2000, trim: true },
    tasksPlanned:   { required: false, type: 'string', minLength: 5, maxLength: 2000, trim: true },
    blockers:       { required: false, type: 'string', maxLength: 1000 },
    hoursWorked:    { required: false, type: 'number', min: 0, max: 168 },
    notes:          { required: false, type: 'string', maxLength: 1000 },
    status:         { required: false, type: 'string', enum: ['submitted', 'pending', 'late'] },
};

// Team member routes
router.post('/', protect, validateRequest(createReportSchema), createReport);
router.get('/my-reports', protect, getMyReports);
router.put('/:id', protect, validateRequest(updateReportSchema), updateReport);
router.delete('/:id', protect, deleteReport);

// Manager routes
router.get('/', protect, requireRole('manager'), getAllReports);
router.get('/stats', protect, requireRole('manager'), getReportStats);
router.get('/:id/pdf', protect, requireRole('manager'), downloadReportPDF);

export default router;