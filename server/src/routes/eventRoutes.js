
const express = require('express');
const router = express.Router();
const {
  getEvents,
  getUpcomingEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// Public Routes
router.get('/', getEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/:slug', getEventBySlug);

// Admin Routes
router.post('/', protect, authorize('admin'), createEvent);
router.put('/:id', protect, authorize('admin'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);
router.put('/:id/status', protect, authorize('admin'), updateEventStatus);

module.exports = router;
