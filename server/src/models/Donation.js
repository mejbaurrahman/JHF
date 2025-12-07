
const mongoose = require('mongoose');

const donationSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  donorName: {
    type: String,
    required: [true, 'Please add donor name']
  },
  donorPhone: {
    type: String
  },
  amount: {
    type: Number,
    required: [true, 'Please add amount']
  },
  paymentMethod: {
    type: String,
    enum: ['bkash', 'nagad', 'cash', 'bank'],
    required: [true, 'Please select a payment method']
  },
  transactionId: {
    type: String
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  donationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);
