const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin'), getExpenses)
  .post(protect, authorize('admin'), createExpense);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteExpense);

module.exports = router;