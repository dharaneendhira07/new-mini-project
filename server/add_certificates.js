const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Institution = require('./models/Institution');
const Certificate = require('./models/Certificate');

dotenv.config();

const addCertificates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected...');

        // Find the existing student
        let student = await User.findOne({ email: 'student@example.com' });
        if (!student) {
            console.log('⚠️  Student not found. Creating student...');
            student = await User.create({
                name: 'John Student',
                email: 'student@example.com',
                password: 'password123',
                role: 'student'
            });
        }
        console.log('👤 Student found:', student.name);

        // Find or create institution
        let instUser = await User.findOne({ email: 'admin@annauniv.edu' });
        if (!instUser) {
            instUser = await User.create({
                name: 'Anna University Admin',
                email: 'admin@annauniv.edu',
                password: 'password123',
                role: 'institution'
            });
        }

        let institution = await Institution.findOne({ user: instUser._id });
        if (!institution) {
            institution = await Institution.create({
                user: instUser._id,
                name: 'Anna University',
                accreditationId: 'AU-' + Date.now(),
                address: 'Chennai, Tamil Nadu',
                walletAddress: '0x000000000000000000000000000000000000dead',
                isApproved: true
            });
        }
        console.log('🏛️  Institution found:', institution.name);

        // All certificates to add
        const newCerts = [
            { course: 'MERN Stack Mastery', grade: 'O+', credits: 60, sem: 'Summer 2024' },
            { course: 'Advanced Cryptography', grade: 'A+', credits: 45, sem: 'Fall 2024' },
            { course: 'Blockchain Fundamentals', grade: 'O', credits: 30, sem: 'Spring 2024' },
            { course: 'Distributed Systems', grade: 'A', credits: 45, sem: 'Fall 2023' },
            { course: 'Smart Contract Development', grade: 'O+', credits: 60, sem: 'Winter 2023' },
            { course: 'Bachelor of Computer Science', grade: 'O+', credits: 160, sem: '2020–2024' },
            { course: 'Full Stack Development', grade: 'A', credits: 40, sem: 'Summer 2023' },
            { course: 'Advanced Machine Learning', grade: 'O', credits: 15, sem: 'Fall 2023' },
            { course: 'Cybersecurity Fundamentals', grade: 'A+', credits: 10, sem: 'Spring 2023' },
            { course: 'Database Management Systems', grade: 'O', credits: 12, sem: 'Fall 2022' },
            { course: 'Cloud Computing Architecture', grade: 'O+', credits: 20, sem: 'Winter 2023' },
            { course: 'UI/UX Design Masterclass', grade: 'A', credits: 8, sem: 'Spring 2022' },
        ];

        let added = 0;
        for (const c of newCerts) {
            const certId = 'ACAD_' + Math.random().toString(36).substring(2, 10).toUpperCase();
            await Certificate.create({
                student: student._id,
                institution: institution._id,
                courseName: c.course,
                grade: c.grade,
                ipfsHash: `Qm${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 8)}`,
                blockchainTxHash: '0x' + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
                certId: certId,
                verificationStatus: 'valid',
                issueDate: new Date(),
                metadata: { credits: c.credits, semester: c.sem }
            });
            console.log(`   ✅ Added: ${c.course} (${c.grade}) - ID: ${certId}`);
            added++;
        }

        const total = await Certificate.countDocuments({ student: student._id });
        console.log(`\n🎉 Done! Added ${added} certificates.`);
        console.log(`📊 Total certificates for ${student.name}: ${total}`);
        console.log(`\n🔑 Login:  student@example.com / password123`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

addCertificates();
