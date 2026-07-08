import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type:       { type: String, enum: ['project_assigned', 'project_removed'], required: true },
        title:      { type: String, required: true },
        message:    { type: String, required: true },
        project:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        read:       { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
