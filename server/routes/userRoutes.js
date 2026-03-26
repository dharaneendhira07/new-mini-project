const express = require('express');
const {
    getUsers,
    updateUserProfile,
    getAuditLogs
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.put('/profile', protect, updateUserProfile);

router.get('/audit-logs', protect, authorize('admin'), getAuditLogs);

module.exports = router;
