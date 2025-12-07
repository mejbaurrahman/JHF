
const asyncHandler = require('express-async-handler');
const SiteContent = require('../models/SiteContent');
const CommitteeMember = require('../models/CommitteeMember');
const GalleryItem = require('../models/GalleryItem');

// --- Site Content ---

// @desc    Get site content by section
// @route   GET /api/content/site/:section
// @access  Public
const getSiteContent = asyncHandler(async (req, res) => {
  const content = await SiteContent.findOne({ section: req.params.section });
  // Return empty object if not found to handle defaults in frontend
  res.json(content ? content.data : {});
});

// @desc    Update site content
// @route   PUT /api/content/site/:section
// @access  Private (Admin)
const updateSiteContent = asyncHandler(async (req, res) => {
  const { section } = req.params;
  const data = req.body;

  let content = await SiteContent.findOne({ section });

  if (content) {
    content.data = { ...content.data, ...data };
    await content.save();
  } else {
    content = await SiteContent.create({ section, data });
  }

  res.json(content.data);
});

// --- Committee ---

// @desc    Get all committee members
// @route   GET /api/content/committee
// @access  Public
const getCommitteeMembers = asyncHandler(async (req, res) => {
  const members = await CommitteeMember.find({}).sort({ order: 1 });
  res.json(members);
});

// @desc    Add committee member
// @route   POST /api/content/committee
// @access  Private (Admin)
const addCommitteeMember = asyncHandler(async (req, res) => {
  const member = await CommitteeMember.create(req.body);
  res.status(201).json(member);
});

// @desc    Update committee member
// @route   PUT /api/content/committee/:id
// @access  Private (Admin)
const updateCommitteeMember = asyncHandler(async (req, res) => {
  const member = await CommitteeMember.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(member);
});

// @desc    Delete committee member
// @route   DELETE /api/content/committee/:id
// @access  Private (Admin)
const deleteCommitteeMember = asyncHandler(async (req, res) => {
  const member = await CommitteeMember.findById(req.params.id);
  if (member) {
    await member.deleteOne();
    res.json({ message: 'Member removed' });
  } else {
    res.status(404);
    throw new Error('Member not found');
  }
});

// --- Gallery ---

// @desc    Get gallery items
// @route   GET /api/content/gallery
// @access  Public
const getGalleryItems = asyncHandler(async (req, res) => {
  const items = await GalleryItem.find({}).sort({ date: -1 });
  res.json(items);
});

// @desc    Add gallery item
// @route   POST /api/content/gallery
// @access  Private (Admin)
const addGalleryItem = asyncHandler(async (req, res) => {
  const item = await GalleryItem.create(req.body);
  res.status(201).json(item);
});

// @desc    Delete gallery item
// @route   DELETE /api/content/gallery/:id
// @access  Private (Admin)
const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);
  if (item) {
    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

module.exports = {
  getSiteContent,
  updateSiteContent,
  getCommitteeMembers,
  addCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
  getGalleryItems,
  addGalleryItem,
  deleteGalleryItem
};
