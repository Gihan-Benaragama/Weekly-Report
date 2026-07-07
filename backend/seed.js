import dns from 'dns';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js';
import Project from './models/Project.js';
import Report from './models/Report.js';

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany();
        await Project.deleteMany();
        await Report.deleteMany();
        console.log('Cleared existing data.');

        // Create users
        const hashedPassword = await bcrypt.hash('password123', 10);

        const manager = await User.create({
            name: 'Sarah Chen',
            email: 'manager@demo.com',
            password: hashedPassword,
            role: 'manager',
        });

        const members = await User.insertMany([
            { name: 'Alex Rivera', email: 'alex@demo.com', password: hashedPassword, role: 'member' },
            { name: 'Priya Patel', email: 'priya@demo.com', password: hashedPassword, role: 'member' },
            { name: 'Jordan Kim', email: 'jordan@demo.com', password: hashedPassword, role: 'member' },
            { name: 'Sam Okafor', email: 'sam@demo.com', password: hashedPassword, role: 'member' },
        ]);

        console.log(`Created 1 manager + ${members.length} team members.`);

        // Create projects
        const projects = await Project.insertMany([
            { name: 'Client A', description: 'Main client engagement — website redesign' },
            { name: 'Internal Tooling', description: 'Internal dev tools and platform work' },
            { name: 'R&D', description: 'Research and experimental projects' },
            { name: 'Marketing', description: 'Marketing site and campaign support' },
        ]);

        console.log(`Created ${projects.length} projects.`);

        // Helper to get a Monday-based week range
        const getWeekRange = (weeksAgo) => {
            const now = new Date();
            const day = now.getDay();
            const diffToMonday = (day === 0 ? -6 : 1) - day;
            const monday = new Date(now);
            monday.setDate(now.getDate() + diffToMonday - weeksAgo * 7);
            monday.setHours(0, 0, 0, 0);
            const friday = new Date(monday);
            friday.setDate(monday.getDate() + 4);
            return { weekStart: monday, weekEnd: friday };
        };

        const sampleTasks = [
            { completed: 'Implemented user authentication and session handling', planned: 'Build out the dashboard analytics view' },
            { completed: 'Fixed responsive layout bugs on mobile', planned: 'Start integrating payment gateway' },
            { completed: 'Completed API integration for third-party service', planned: 'Write unit tests for new endpoints' },
            { completed: 'Refactored database schema for performance', planned: 'Migrate legacy data to new schema' },
            { completed: 'Designed and implemented new onboarding flow', planned: 'A/B test onboarding conversion rates' },
            { completed: 'Resolved critical production bug in checkout flow', planned: 'Add monitoring and alerting' },
        ];

        const sampleBlockers = [
            'Waiting on design assets from the client',
            'Blocked by a third-party API rate limit',
            'Need clarification on requirements from product',
            '',
            '',
            'Staging environment is down, blocking QA',
        ];

        const statuses = ['submitted', 'submitted', 'submitted', 'pending', 'late'];

        const reportsToCreate = [];

        // Generate 4 weeks of reports for each member across random projects
        for (const member of members) {
            for (let weeksAgo = 0; weeksAgo < 4; weeksAgo++) {
                const { weekStart, weekEnd } = getWeekRange(weeksAgo);
                const task = sampleTasks[Math.floor(Math.random() * sampleTasks.length)];
                const blocker = sampleBlockers[Math.floor(Math.random() * sampleBlockers.length)];
                const project = projects[Math.floor(Math.random() * projects.length)];
                const status = weeksAgo === 0
                    ? statuses[Math.floor(Math.random() * statuses.length)]
                    : 'submitted'; // older weeks are all submitted, current week varies

                reportsToCreate.push({
                    user: member._id,
                    project: project._id,
                    weekStart,
                    weekEnd,
                    tasksCompleted: task.completed,
                    tasksPlanned: task.planned,
                    blockers: blocker,
                    hoursWorked: Math.floor(Math.random() * 15) + 30, // 30-45 hours
                    notes: '',
                    status,
                });
            }
        }

        await Report.insertMany(reportsToCreate);
        console.log(`Created ${reportsToCreate.length} reports across 4 weeks.`);

        console.log('\n--- Seed complete! ---');
        console.log('Manager login: manager@demo.com / password123');
        console.log('Member login: alex@demo.com / password123 (or priya/jordan/sam@demo.com)');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seed();