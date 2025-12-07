const mongoose = require('mongoose');

const feeSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['bkash', 'nagad', 'cash'],
    required: true
  },
  transactionId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'paid'
  },
  paidAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Fee', feeSchema);