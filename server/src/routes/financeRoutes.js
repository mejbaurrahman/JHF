const express = require('express');
const router = express.Router();
const { getFinanceSummary } = require('../controllers/financeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/summary', protect, authorize('admin'), getFinanceSummary);

module.exports = router;