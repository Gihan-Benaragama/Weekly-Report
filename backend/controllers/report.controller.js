import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
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
        const { member, project, startDate, endDate, status, summary } = req.query;
        const filter = {};

        if (member) filter.user = member;
        if (project) filter.project = project;
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.weekStart = {};
            if (startDate) filter.weekStart.$gte = new Date(startDate);
            if (endDate) filter.weekStart.$lte = new Date(endDate);
        }

        const query = Report.find(filter);

        // Optimize payload size if only summary info is required
        if (summary === 'true') {
            query.select('status project weekStart user');
        }

        const reports = await query
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
        const [totalReports, submittedCount, pendingCount, lateCount, openBlockers] = await Promise.all([
            Report.countDocuments(),
            Report.countDocuments({ status: 'submitted' }),
            Report.countDocuments({ status: 'pending' }),
            Report.countDocuments({ status: 'late' }),
            Report.countDocuments({
                blockers: { $exists: true, $ne: '' },
                status: { $ne: 'submitted' },
            })
        ]);

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

// Manager: download single report as A4 PDF document
export const downloadReportPDF = async (req, res) => {
    try {
        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Forbidden: Managers only' });
        }

        const report = await Report.findById(req.params.id)
            .populate('user', 'name email')
            .populate('project', 'name');

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${report._id}.pdf`);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        doc.pipe(res);

        // Header: "Weekly Report — [Member Name]"
        doc.fillColor('#0f172a').fontSize(22).font('Helvetica-Bold').text(`Weekly Report — ${report.user?.name || 'N/A'}`, { align: 'left' });
        doc.moveDown(0.5);

        // Horizontal line
        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1);

        // Metadata fields
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b').text('Submitted by: ', { continued: true })
           .font('Helvetica').fillColor('#0f172a').text(`${report.user?.name || 'N/A'} (${report.user?.email || 'N/A'})`);
        doc.moveDown(0.4);

        doc.font('Helvetica-Bold').fillColor('#64748b').text('Project / Category: ', { continued: true })
           .font('Helvetica').fillColor('#0f172a').text(report.project?.name || 'General');
        doc.moveDown(0.4);

        doc.font('Helvetica-Bold').fillColor('#64748b').text('Week Period: ', { continued: true })
           .font('Helvetica').fillColor('#0f172a').text(`${new Date(report.weekStart).toLocaleDateString()} — ${new Date(report.weekEnd).toLocaleDateString()}`);
        doc.moveDown(0.4);

        const hoursText = report.hoursWorked !== null && report.hoursWorked !== undefined ? `${report.hoursWorked} hours` : 'Not logged';
        doc.font('Helvetica-Bold').fillColor('#64748b').text('Status: ', { continued: true })
           .font('Helvetica').fillColor('#0f172a').text(`${report.status || 'pending'}   |   `, { continued: true })
           .font('Helvetica-Bold').fillColor('#64748b').text('Hours Worked: ', { continued: true })
           .font('Helvetica').fillColor('#0f172a').text(hoursText);
        doc.moveDown(1.5);

        const renderSection = (title, content, titleColor = '#0f172a') => {
            doc.font('Helvetica-Bold').fontSize(12).fillColor(titleColor).text(title);
            doc.moveDown(0.3);
            doc.font('Helvetica').fontSize(10).fillColor('#334155').text(content || 'None', {
                align: 'justify',
                lineGap: 3
            });
            doc.moveDown(1.2);
        };

        // Section: Completed Tasks
        renderSection('Completed Tasks', report.tasksCompleted, '#0d9488');

        // Section: Planned for Next Week
        renderSection('Planned for Next Week', report.tasksPlanned, '#0f766e');

        // Section: Active Blockers
        if (report.blockers) {
            renderSection('Active Blockers', report.blockers, '#ef4444');
        }

        // Section: Additional Notes
        if (report.notes) {
            renderSection('Additional Notes', report.notes, '#475569');
        }

        // Footer block: Submitted on [createdAt date] and Downloaded by [manager name] on [current date/time]
        const pageHeight = doc.page.height;
        const footerY = pageHeight - 80;
        
        doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, footerY - 10).lineTo(545, footerY - 10).stroke();
        
        doc.fontSize(8).font('Helvetica').fillColor('#94a3b8');
        doc.text(`Submitted on: ${new Date(report.createdAt).toLocaleString()}`, 50, footerY);
        doc.text(`Downloaded by: ${req.user.name || 'Manager'} on ${new Date().toLocaleString()}`, 50, footerY + 12);

        doc.end();
    } catch (error) {
        console.error('PDF Generation error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
        }
    }
};