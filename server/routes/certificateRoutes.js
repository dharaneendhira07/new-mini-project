const express = require('express');
const {
    issueCertificate,
    getCertificates,
    getStudentCertificates,
    getInstitutionCertificates,
    verifyCertificate
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');

const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for local file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(__dirname, '../uploads');
        console.log('Multer saving to:', dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/issue', protect, authorize('institution'), upload.single('file'), issueCertificate);
router.get('/all', protect, authorize('admin'), getCertificates);
router.get('/student', protect, authorize('student'), getStudentCertificates);
router.get('/institution', protect, authorize('institution'), getInstitutionCertificates);
router.get('/verify/:certId', verifyCertificate);

module.exports = router;
