
const mongoose = require('mongoose');

const siteContentSchema = mongoose.Schema({
  section: {
    type: String,
    required: true,
    unique: true, // e.g., 'home', 'about', 'contact'
  },
  data: {
    type: Object,
    required: true,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SiteContent', siteContentSchema);
