const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Institution = require('./models/Institution');
const Certificate = require('./models/Certificate');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing data (optional, but good for consistent dummy data)
        await User.deleteMany({});
        await Institution.deleteMany({});
        await Certificate.deleteMany({});

        // 1. Create a Student
        const student = await User.create({
            name: 'John Student',
            email: 'student@example.com',
            password: 'password123',
            role: 'student',
            walletAddress: '0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82' // Example hardhat account
        });

        // 2. Create an Institution User
        const institutionUser = await User.create({
            name: 'Anna University',
            email: 'admin@annauniv.edu',
            password: 'password123',
            role: 'institution',
            walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // Example hardhat account 0
        });

        // 3. Create the Institution Record
        const institution = await Institution.create({
            user: institutionUser._id,
            name: 'Anna University',
            accreditationId: 'AU-12345',
            address: 'Sardar Patel Road, Chennai, Tamil Nadu 600025',
            walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            isApproved: true
        });

        // 4. Create Dummy Certificates
        const fakeCertsData = [
            { course: 'Bachelor of Computer Science', grade: 'O+', credits: 160, sem: '2020-2024' },
            { course: 'Full Stack Development Certification', grade: 'A', credits: 40, sem: 'Summer 2023' },
            { course: 'Advanced Machine Learning', grade: 'O', credits: 15, sem: 'Fall 2023' },
            { course: 'Cybersecurity Fundamentals', grade: 'A+', credits: 10, sem: 'Spring 2023' },
            { course: 'Database Management Systems', grade: 'O', credits: 12, sem: 'Fall 2022' },
            { course: 'Cloud Computing Architecture', grade: 'O+', credits: 20, sem: 'Winter 2023' },
            { course: 'UI/UX Design Masterclass', grade: 'A', credits: 8, sem: 'Spring 2022' }
        ];

        for (const c of fakeCertsData) {
            await Certificate.create({
                student: student._id,
                institution: institution._id,
                courseName: c.course,
                grade: c.grade,
                ipfsHash: `Qm${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`,
                blockchainTxHash: '0x' + Math.random().toString(16).slice(2, 42).padEnd(40, '0'),
                certId: 'ACAD_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                verificationStatus: 'valid',
                metadata: { credits: c.credits, semester: c.sem }
            });
        }

        console.log('Dummy certificates and users added successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
