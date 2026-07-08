import Project from '../models/Project.js';
import Notification from '../models/Notification.js';

// Helper: diff old vs new members and send notifications
const sendAssignmentNotifications = async (project, previousMemberIds, currentMemberIds) => {
    const prev = previousMemberIds.map(String);
    const curr = currentMemberIds.map(String);

    const newlyAssigned = curr.filter((id) => !prev.includes(id));
    const removed       = prev.filter((id) => !curr.includes(id));

    const notifications = [];

    for (const userId of newlyAssigned) {
        notifications.push({
            user:    userId,
            type:    'project_assigned',
            title:   'You have been assigned to a project',
            message: `You have been assigned to the project "${project.name}". You can now log weekly reports against it.`,
            project: project._id,
        });
    }

    for (const userId of removed) {
        notifications.push({
            user:    userId,
            type:    'project_removed',
            title:   'Removed from a project',
            message: `You have been removed from the project "${project.name}".`,
            project: project._id,
        });
    }

    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }
};

export const createProject = async (req, res) => {
    try {
        const { name, description, assignedMembers } = req.body;

        const existing = await Project.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: 'Project with this name already exists' });
        }

        const project = await Project.create({
            name,
            description,
            assignedMembers: assignedMembers || []
        });

        const populated = await project.populate('assignedMembers', 'name email');

        // Notify all newly assigned members
        await sendAssignmentNotifications(project, [], assignedMembers || []);

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getProjects = async (req, res) => {
    try {
        let projects;
        if (req.user.role === 'manager') {
            projects = await Project.find()
                .populate('assignedMembers', 'name email')
                .sort({ createdAt: -1 });
        } else {
            projects = await Project.find({
                $or: [
                    { assignedMembers: req.user.id },
                    { assignedMembers: { $size: 0 } },
                    { assignedMembers: { $exists: false } }
                ]
            }).sort({ createdAt: -1 });
        }
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { name, description, assignedMembers } = req.body;

        const existing = await Project.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const previousMemberIds = existing.assignedMembers.map(String);
        const newMemberIds = assignedMembers !== undefined ? assignedMembers : previousMemberIds;

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { name, description, assignedMembers: newMemberIds },
            { new: true, runValidators: true }
        ).populate('assignedMembers', 'name email');

        // Notify members who were newly added or removed
        await sendAssignmentNotifications(project, previousMemberIds, newMemberIds);

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};