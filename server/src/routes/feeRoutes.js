const express = require('express');
const router = express.Router();
const { getMyFees, createFee, getAllFees } = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, getMyFees);
router.post('/', protect, authorize('admin'), createFee);
router.get('/', protect, authorize('admin'), getAllFees);

module.exports = router;