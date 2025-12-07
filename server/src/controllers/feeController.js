const asyncHandler = require('express-async-handler');
const Fee = require('../models/Fee');

// @desc    Get current user fees
// @route   GET /api/fees/my
// @access  Private
const getMyFees = asyncHandler(async (req, res) => {
  const fees = await Fee.find({ userId: req.user.id }).sort({ year: -1, month: -1 });
  res.json(fees);
});

// @desc    Create a fee record (Admin)
// @route   POST /api/fees
// @access  Private (Admin)
const createFee = asyncHandler(async (req, res) => {
  const { userId, amount, month, year, paymentMethod, transactionId, status, paidAt } = req.body;

  if (!userId || !amount || !month || !year || !paymentMethod) {
    res.status(400);
    throw new Error('Please provide all required fields (userId, amount, month, year, paymentMethod)');
  }

  const fee = await Fee.create({
    userId,
    amount,
    month,
    year,
    paymentMethod,
    transactionId,
    status: status || 'paid',
    paidAt: paidAt || Date.now()
  });

  res.status(201).json(fee);
});

// @desc    Get all fees
// @route   GET /api/fees
// @access  Private (Admin)
const getAllFees = asyncHandler(async (req, res) => {
  const { userId, month, year, status } = req.query;
  const query = {};

  if (userId) query.userId = userId;
  if (month) query.month = month;
  if (year) query.year = year;
  if (status) query.status = status;

  const fees = await Fee.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  res.json(fees);
});

module.exports = {
  getMyFees,
  createFee,
  getAllFees
};