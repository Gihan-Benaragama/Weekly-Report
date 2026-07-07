import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String },
        googleId: { type: String },
        avatar: { type: String },
        role: { type: String, enum: ['member', 'manager'], default: 'member' },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;