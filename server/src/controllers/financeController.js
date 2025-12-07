
const asyncHandler = require('express-async-handler');
const Donation = require('../models/Donation');
const Fee = require('../models/Fee');
const User = require('../models/User');
const Event = require('../models/Event');
const Expense = require('../models/Expense');

// @desc    Get finance summary
// @route   GET /api/finance/summary
// @access  Private (Admin)
const getFinanceSummary = asyncHandler(async (req, res) => {
  // Aggregate Donations
  const donationStats = await Donation.aggregate([
    {
      $group: {
        _id: null,
        totalDonations: { $sum: '$amount' },
        totalConfirmedDonations: {
          $sum: {
            $cond: [{ $eq: ['$status', 'confirmed'] }, '$amount', 0]
          }
        }
      }
    }
  ]);

  // Aggregate Fees
  const feeStats = await Fee.aggregate([
    {
      $match: { status: 'paid' }
    },
    {
      $group: {
        _id: null,
        totalFees: { $sum: '$amount' }
      }
    }
  ]);

  // Aggregate Expenses
  const expenseStats = await Expense.aggregate([
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: '$amount' }
      }
    }
  ]);

  // Operational Counts
  const userCount = await User.countDocuments({});
  const eventCount = await Event.countDocuments({ status: { $in: ['upcoming', 'ongoing'] } });
  const pendingDonationCount = await Donation.countDocuments({ status: 'pending' });
  
  const totalExpenses = expenseStats[0]?.totalExpenses || 0;

  const stats = {
    totalDonations: donationStats[0]?.totalDonations || 0,
    totalConfirmedDonations: donationStats[0]?.totalConfirmedDonations || 0,
    totalFees: feeStats[0]?.totalFees || 0,
    totalExpenses: totalExpenses,
    netBalance: (donationStats[0]?.totalConfirmedDonations || 0) + (feeStats[0]?.totalFees || 0) - totalExpenses,
    userCount,
    eventCount,
    pendingDonationCount
  };

  res.json(stats);
});

module.exports = { getFinanceSummary };