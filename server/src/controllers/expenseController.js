const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private (Admin)
const getExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({})
    .populate('eventId', 'title')
    .sort({ date: -1 });
  res.json(expenses);
});

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private (Admin)
const createExpense = asyncHandler(async (req, res) => {
  const { title, amount, date, category, description, eventId } = req.body;

  if (!title || !amount) {
    res.status(400);
    throw new Error('Please add a title and amount');
  }

  const expense = await Expense.create({
    title,
    amount,
    date: date || Date.now(),
    category,
    description,
    eventId: eventId || null,
    createdBy: req.user.id
  });

  res.status(201).json(expense);
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (Admin)
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  await expense.deleteOne();
  res.json({ id: req.params.id });
});

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense
};