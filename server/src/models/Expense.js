const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String, // e.g., 'Event', 'Maintenance', 'Salary', 'Other'
    default: 'Other'
  },
  description: {
    type: String
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);