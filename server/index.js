const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const http = require('http');
const { Server } = require('socket.io');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Map to store student userIds to socketIds
const userSockets = new Map();

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId && userId !== 'undefined') {
        userSockets.set(userId, socket.id);
        console.log(`User connected: ${userId} (Socket: ${socket.id})`);
    }

    socket.on('disconnect', () => {
        if (userId) {
            userSockets.delete(userId);
            console.log(`User disconnected: ${userId}`);
        }
    });
});

// Make io available to routes via req.app.get('socketio')
app.set('socketio', io);
app.set('userSockets', userSockets);

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/ai', aiRoutes);
console.log('AI Routes registered at /api/ai');

// Health Check
app.get('/', (req, res) => {
    res.send('Academic Identity API is running...');
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
connectDB().then(async () => {
    // Seed dummy data for testing
    const User = require('./models/User');
    const Institution = require('./models/Institution');
    const Certificate = require('./models/Certificate');

    try {
        console.log('Verifying demo accounts...');
        
        // 1. Ensure Student demo account exists
        let student = await User.findOne({ email: 'student@example.com' });
        if (!student) {
            student = await User.create({
                name: 'John Student',
                email: 'student@example.com',
                password: 'password123',
                role: 'student'
            });
            console.log('Created demo student');
        } else {
            student.password = 'password123';
            await student.save();
        }

        // 2. Ensure Institution demo account exists
        let instUser = await User.findOne({ email: 'admin@annauniv.edu' });
        if (!instUser) {
            instUser = await User.create({
                name: 'Anna University Admin',
                email: 'admin@annauniv.edu',
                password: 'password123',
                role: 'institution'
            });
            console.log('Created demo institution user');
        } else {
            instUser.password = 'password123';
            await instUser.save();
        }

        let inst = await Institution.findOne({ user: instUser._id });
        if (!inst) {
            inst = await Institution.create({
                user: instUser._id,
                name: 'Anna University',
                accreditationId: 'AU-001',
                address: 'Chennai, Tamil Nadu',
                walletAddress: '0x000000000000000000000000000000000000dead',
                isApproved: true
            });
            console.log('Created demo institution');
        }

        // 3. Ensure Admin demo account exists
        let adminUser = await User.findOne({ email: 'admin@admin.com' });
        if (!adminUser) {
            adminUser = await User.create({
                name: 'Super Admin',
                email: 'admin@admin.com',
                password: 'password123',
                role: 'admin'
            });
            console.log('Created demo admin');
        } else {
            adminUser.password = 'password123';
            await adminUser.save();
        }

        // 4. Seed certificates if they don't exist
        const certCount = await Certificate.countDocuments();
        if (certCount === 0) {
            const fakeCerts = [
                { course: 'MERN Stack Mastery', grade: 'O+', credits: 60, sem: 'Summer' },
                { course: 'Advanced Cryptography', grade: 'A+', credits: 45, sem: 'Fall' },
                { course: 'Blockchain Fundamentals', grade: 'O', credits: 30, sem: 'Spring' },
                { course: 'Distributed Systems', grade: 'A', credits: 45, sem: 'Fall' },
                { course: 'Smart Contract Development', grade: 'O+', credits: 60, sem: 'Winter' }
            ];

            for (const c of fakeCerts) {
                await Certificate.create({
                    student: student._id,
                    institution: inst._id,
                    courseName: c.course,
                    grade: c.grade,
                    ipfsHash: `Qm${Math.random().toString(36).substring(2, 12)}`,
                    blockchainTxHash: '0x' + Math.random().toString(16).slice(2, 42).padEnd(40, '0'),
                    certId: 'ACAD_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                    verificationStatus: 'valid',
                    metadata: { credits: c.credits, semester: c.sem }
                });
            }
            console.log('Demo certificates seeded!');
        }
    } catch (err) {
        console.error('Error verifying/seeding data:', err);
    }

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Database connection failed', err);
});
