const fs = require('fs');
const path = require('path');
const { uploadToIPFS } = require('../utils/ipfsUtil');
const Certificate = require('../models/Certificate');
const Institution = require('../models/Institution');
const User = require('../models/User');

// @desc    Issue certificate — student register aagala na auto-create pannum
const issueCertificate = async (req, res, next) => {
    try {
        console.log('--- ISSUANCE START ---');
        console.log('Body:', req.body);
        console.log('File received:', req.file ? req.file.filename : 'NO FILE');

        const { studentEmail, courseName, grade, blockchainTxHash, certId, studentName } = req.body;

        // Basic validation
        if (!studentEmail || !courseName || !grade) {
            console.log('Validation failed: Missing fields');
            res.status(400);
            throw new Error('studentEmail, courseName and grade are required');
        }

        // 1. Double check uploads directory exists (Bulletproof)
        const uploadDir = path.resolve(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 2. IPFS Upload (if file exists)
        let finalIpfsHash = req.body.ipfsHash || 'N/A';
        if (req.file) {
            try {
                console.log('--- FILE PROCESSING START ---');
                console.log('Reading file from path:', req.file.path);

                if (!fs.existsSync(req.file.path)) {
                    console.error('CRITICAL: File not found after Multer save!');
                    // This can happen if Multer fails silently or disk is full
                    throw new Error('File was not saved correctly by the system.');
                }

                const fileBuffer = fs.readFileSync(req.file.path);
                console.log('File size:', fileBuffer.length, 'bytes');

                console.log('Uploading to Pinata IPFS...');
                const ipfsResult = await uploadToIPFS(fileBuffer, req.file.originalname);
                if (ipfsResult) {
                    finalIpfsHash = ipfsResult;
                    console.log('IPFS Success. Hash:', finalIpfsHash);
                }
            } catch (ipfsErr) {
                console.warn('IPFS/Read Step Skipped/Failed:', ipfsErr.message);
                // We proceed with 'N/A' or previous hash so issuance doesn't stop
            }
        }

        // Student DB check/create
        const email = studentEmail.toLowerCase().trim();
        let student = await User.findOne({ email });
        if (!student) {
            console.log('Creating new student:', email);
            student = await User.create({
                name: studentName || studentEmail.split('@')[0],
                email: email,
                password: Math.random().toString(36).slice(2),
                role: 'student',
            });
        }

        // Institution check/create
        let institution = await Institution.findOne({ user: req.user._id });
        if (!institution) {
            institution = await Institution.create({
                user: req.user._id,
                name: req.user.name || 'Unknown Institution',
                accreditationId: 'AUTO-' + req.user._id.toString().slice(-6).toUpperCase(),
            });
        }

        console.log('Saving certificate to MongoDB...');
        const certificate = await Certificate.create({
            student: student._id,
            institution: institution._id,
            courseName,
            grade,
            ipfsHash: finalIpfsHash,
            blockchainTxHash: blockchainTxHash || 'N/A',
            certId: certId || `CERT-${Date.now()}`,
            verificationStatus: 'valid',
            supportingDocument: req.file ? req.file.filename : '', // Save filename ONLY
        });

        const populated = await Certificate.findById(certificate._id)
            .populate('student', 'name email')
            .populate('institution', 'name');

        const { logActivity } = require('../utils/logUtil');
        await logActivity('Certificate Issued', req.user._id, `${courseName} to ${studentEmail}`);
        
        // --- REAL-TIME NOTIFICATION ---
        try {
            const io = req.app.get('socketio');
            const userSockets = req.app.get('userSockets');
            const studentSocketId = userSockets.get(student._id.toString());

            if (io && studentSocketId) {
                io.to(studentSocketId).emit('notification', {
                    type: 'success',
                    title: 'New Certificate Issued!',
                    message: `You have received a new certificate for ${courseName} from ${institution.name}.`,
                    icon: '🎓'
                });
                console.log(`Socket notification sent to student: ${student._id}`);
            }
        } catch (socketErr) {
            console.error('Socket notification failed:', socketErr.message);
        }

        console.log('--- ISSUANCE SUCCESS ---');
        res.status(201).json(populated);
    } catch (error) {
        console.error('--- ISSUANCE FAILED ---');
        console.error(error);
        next(error);
    }
};

// @desc    Get all certificates (Admin)
const getCertificates = async (req, res, next) => {
    try {
        const certificates = await Certificate.find({})
            .populate('student', 'name email')
            .populate('institution', 'name');
        res.json(certificates);
    } catch (error) {
        next(error);
    }
};

// @desc    Get student certificates
const getStudentCertificates = async (req, res, next) => {
    try {
        const certificates = await Certificate.find({ student: req.user._id })
            .populate('institution', 'name');
        res.json(certificates);
    } catch (error) {
        next(error);
    }
};

// @desc    Get certificates issued by the institution
const getInstitutionCertificates = async (req, res, next) => {
    try {
        let institution = await Institution.findOne({ user: req.user._id });
        if (!institution) {
            // Auto-initialize if they are an institution user but record missing
            institution = await Institution.create({
                user: req.user._id,
                name: req.user.name || 'New Institution',
                accreditationId: 'INST-' + req.user._id.toString().slice(-6).toUpperCase()
            });
            return res.json([]); // Return empty list for new institution
        }

        const certificates = await Certificate.find({ institution: institution._id })
            .populate('student', 'name email');
        res.json(certificates);
    } catch (error) {
        next(error);
    }
};

// @desc    Verify certificate by ID
const verifyCertificate = async (req, res, next) => {
    try {
        const certificate = await Certificate.findOne({ certId: req.params.certId })
            .populate('student', 'name email')
            .populate('institution', 'name');

        if (certificate) {
            res.json(certificate);
        } else {
            res.status(404);
            throw new Error('Certificate not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    issueCertificate,
    getCertificates,
    getStudentCertificates,
    getInstitutionCertificates,
    verifyCertificate
};
