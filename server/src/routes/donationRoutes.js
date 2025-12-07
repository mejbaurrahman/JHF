
const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getMyDonations,
  updateDonationStatus
} = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to optionally attach user if token is present, but not block request
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production_2024';
      const decoded = jwt.verify(token, jwtSecret);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // If token invalid, just continue as guest
    }
  }
  next();
};

// Public Route (with optional auth for tracking user)
router.post('/', optionalAuth, createDonation);

// Private User Route (mapped to /api/donations/my via index router mounting /api/donations, so this path is /my)
router.get('/my', protect, getMyDonations);

// Admin Routes
router.get('/', protect, authorize('admin'), getDonations);
router.put('/:id/status', protect, authorize('admin'), updateDonationStatus);

module.exports = router;
