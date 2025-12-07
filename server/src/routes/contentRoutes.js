
const express = require('express');
const router = express.Router();
const {
  getSiteContent,
  updateSiteContent,
  getCommitteeMembers,
  addCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
  getGalleryItems,
  addGalleryItem,
  deleteGalleryItem
} = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');

// Site Content
router.get('/site/:section', getSiteContent);
router.put('/site/:section', protect, authorize('admin'), updateSiteContent);

// Committee
router.get('/committee', getCommitteeMembers);
router.post('/committee', protect, authorize('admin'), addCommitteeMember);
router.put('/committee/:id', protect, authorize('admin'), updateCommitteeMember);
router.delete('/committee/:id', protect, authorize('admin'), deleteCommitteeMember);

// Gallery
router.get('/gallery', getGalleryItems);
router.post('/gallery', protect, authorize('admin'), addGalleryItem);
router.delete('/gallery/:id', protect, authorize('admin'), deleteGalleryItem);

module.exports = router;
