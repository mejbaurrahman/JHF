
const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  slug: {
    type: String,
    required: [true, 'Please add a slug'],
    unique: true,
    trim: true,
    lowercase: true
  },
  type: {
    type: String,
    enum: ['tafseer', 'mahfil', 'quran_class', 'charity', 'other'],
    default: 'other'
  },
  description: {
    type: String
  },
  location: {
    type: String
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  estimatedBudget: {
    type: Number,
    default: 0
  },
  bannerUrl: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  managerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for donations linked to this event
eventSchema.virtual('donations', {
  ref: 'Donation',
  localField: '_id',
  foreignField: 'eventId',
  justOne: false
});

module.exports = mongoose.model('Event', eventSchema);
