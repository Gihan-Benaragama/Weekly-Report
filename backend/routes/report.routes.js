import express from 'express';
import {
    createReport,
    getMyReports,
    updateReport,
    deleteReport,
    getAllReports,
    getReportStats,
} from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// Team member routes
router.post('/', protect, createReport);
router.get('/my-reports', protect, getMyReports);
router.put('/:id', protect, updateReport);
router.delete('/:id', protect, deleteReport);

// Manager routes
router.get('/', protect, requireRole('manager'), getAllReports);
router.get('/stats', protect, requireRole('manager'), getReportStats);

export default router;