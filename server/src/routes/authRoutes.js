
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, createUser, getAllUsers, deleteUser, updateUserRole } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Admin Routes
router.post('/users', protect, authorize('admin'), createUser);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);

module.exports = router;
