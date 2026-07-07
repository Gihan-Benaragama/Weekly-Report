import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        weekStart: { type: Date, required: true },
        weekEnd: { type: Date, required: true },
        tasksCompleted: { type: String, required: true },
        tasksPlanned: { type: String, required: true },
        blockers: { type: String, default: '' },
        hoursWorked: { type: Number, default: null },
        notes: { type: String, default: '' },
        status: {
            type: String,
            enum: ['submitted', 'pending', 'late'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;