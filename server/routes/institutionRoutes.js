const express = require('express');
const {
    applyAsInstitution,
    getPendingInstitutions,
    approveInstitution
} = require('../controllers/institutionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/apply', protect, authorize('institution'), applyAsInstitution);
router.get('/pending', protect, authorize('admin'), getPendingInstitutions);
router.put('/approve/:id', protect, authorize('admin'), approveInstitution);

module.exports = router;
