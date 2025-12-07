
const mongoose = require('mongoose');

const committeeMemberSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  roleKey: {
    type: String,
    required: true // e.g., 'president', 'member'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  phone: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CommitteeMember', committeeMemberSchema);
