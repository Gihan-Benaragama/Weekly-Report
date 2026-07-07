import mongoose from 'mongoose';
import Report from '../models/Report.js';
import Project from '../models/Project.js';

// Team member creates their own report
export const createReport = async (req, res) => {
    try {
        const {
            project,
            weekStart,
            weekEnd,
            tasksCompleted,
            tasksPlanned,
            blockers,
            hoursWorked,
            notes,
            status,
        } = req.body;

        if (!project || !mongoose.Types.ObjectId.isValid(project)) {
            return res.status(400).json({ message: 'Invalid project ID format' });
        }

        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(400).json({ message: 'Project not found' });
        }

        const report = await Report.create({
            user: req.user.id, // always the logged-in user, never trust client-sent user id
            project,
            weekStart,
            weekEnd,
            tasksCompleted,
            tasksPlanned,
            blockers,
            hoursWorked,
            notes,
            status: status === 'submitted' ? 'submitted' : 'pending',
        });

        const populated = await report.populate('project', 'name');
        res.status(201).json(populated);
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Team member's own report history
export const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user.id })
            .populate('project', 'name')
            .sort({ weekStart: -1 });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Team member edits their own report
export const updateReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Ensure users can only edit their own reports
        if (report.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this report' });
        }

        if (req.body.project !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(req.body.project)) {
                return res.status(400).json({ message: 'Invalid project ID format' });
            }
            const projectExists = await Project.findById(req.body.project);
            if (!projectExists) {
                return res.status(400).json({ message: 'Project not found' });
            }
        }

        const updatable = [
            'project', 'weekStart', 'weekEnd', 'tasksCompleted',
            'tasksPlanned', 'blockers', 'hoursWorked', 'notes', 'status',
        ];
        updatable.forEach((field) => {
            if (req.body[field] !== undefined) report[field] = req.body[field];
        });

        await report.save();
        const populated = await report.populate('project', 'name');
        res.status(200).json(populated);
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Manager: view all reports, with filters
export const getAllReports = async (req, res) => {
    try {
        const { member, project, startDate, endDate, status } = req.query;
        const filter = {};

        if (member) filter.user = member;
        if (project) filter.project = project;
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.weekStart = {};
            if (startDate) filter.weekStart.$gte = new Date(startDate);
            if (endDate) filter.weekStart.$lte = new Date(endDate);
        }

        const reports = await Report.find(filter)
            .populate('user', 'name email')
            .populate('project', 'name')
            .sort({ weekStart: -1 });

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Manager: dashboard summary stats
export const getReportStats = async (req, res) => {
    try {
        const totalReports = await Report.countDocuments();
        const submittedCount = await Report.countDocuments({ status: 'submitted' });
        const pendingCount = await Report.countDocuments({ status: 'pending' });
        const lateCount = await Report.countDocuments({ status: 'late' });

        const openBlockers = await Report.countDocuments({
            blockers: { $exists: true, $ne: '' },
            status: { $ne: 'submitted' },
        });

        const complianceRate =
            totalReports > 0 ? Math.round((submittedCount / totalReports) * 100) : 0;

        res.status(200).json({
            totalReports,
            submittedCount,
            pendingCount,
            lateCount,
            openBlockers,
            complianceRate,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }


};

// Team member deletes their own report
export const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (report.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this report' });
        }

        await report.deleteOne();
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};