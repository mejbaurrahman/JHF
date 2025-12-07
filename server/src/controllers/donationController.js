
const asyncHandler = require('express-async-handler');
const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Create a donation
// @route   POST /api/donations
// @access  Public (Optional Auth)
const createDonation = asyncHandler(async (req, res) => {
  const {
    eventId,
    donorName,
    donorPhone,
    amount,
    paymentMethod,
    transactionId,
    isAnonymous
  } = req.body;

  if (!amount || !paymentMethod || !donorName) {
    res.status(400);
    throw new Error('Please provide donor name, amount, and payment method');
  }

  // Determine User ID: use authenticated user if available
  let userId = null;
  if (req.headers.authorization) {
     // The optionalAuth middleware should have attached user if valid
     if(req.user) userId = req.user.id;
  }

  const donation = await Donation.create({
    userId,
    eventId: eventId || null,
    donorName,
    donorPhone,
    amount,
    paymentMethod,
    transactionId,
    isAnonymous: isAnonymous || false
  });

  res.status(201).json(donation);
});

// @desc    List all donations (Admin)
// @route   GET /api/donations
// @access  Private (Admin)
const getDonations = asyncHandler(async (req, res) => {
  const { eventId, status, userId, from, to } = req.query;
  
  let query = {};

  if (eventId) {
    query.eventId = eventId;
  }
  
  if (status && status !== 'all') {
    query.status = status;
  }

  if (userId) {
    query.userId = userId;
  }

  if (from || to) {
    query.donationDate = {};
    if (from) query.donationDate.$gte = new Date(from);
    if (to) query.donationDate.$lte = new Date(to);
  }

  const donations = await Donation.find(query)
    .populate('eventId', 'title')
    .populate('userId', 'name email')
    .sort({ donationDate: -1 });

  res.json(donations);
});

// @desc    Get logged-in user's donations
// @route   GET /api/donations/my
// @access  Private
const getMyDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ userId: req.user.id })
    .populate('eventId', 'title')
    .sort({ donationDate: -1 });
  res.json(donations);
});

// @desc    Update donation status
// @route   PUT /api/donations/:id/status
// @access  Private (Admin)
const updateDonationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Please provide status');
  }

  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  donation.status = status;
  await donation.save();

  res.json(donation);
});

module.exports = {
  createDonation,
  getDonations,
  getMyDonations,
  updateDonationStatus
};
