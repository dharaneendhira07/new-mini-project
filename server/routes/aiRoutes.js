const express = require('express');
const { getAIInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/insights', protect, getAIInsights);

module.exports = router;
