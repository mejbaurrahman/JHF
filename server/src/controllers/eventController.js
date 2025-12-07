
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Event = require('../models/Event');

// Helper to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Utility to generate slug from title if not provided
const generateSlug = (title) => {
  if (!title || typeof title !== 'string') {
    return `event-${Date.now()}`;
  }
  
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  
  // If slug is empty after processing, use a fallback
  if (!slug || slug.length === 0) {
    slug = `event-${Date.now()}`;
  }
  
  return slug;
};

// @desc    Get public events (filter by status optional)
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { isPublic: true };
  
  if (status) {
    filter.status = status;
  }

  // Sort by date ascending for upcoming, descending for others typically, 
  // but standard list is often chronological
  const events = await Event.find(filter).sort({ startDate: 1 });
  res.json(events);
});

// @desc    Get upcoming public events
// @route   GET /api/events/upcoming
// @access  Public
const getUpcomingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ 
    isPublic: true, 
    status: { $in: ['upcoming', 'ongoing'] } 
  }).sort({ startDate: 1 });
  
  res.json(events);
});

// @desc    Get single event by slug
// @route   GET /api/events/:slug
// @access  Public
const getEventBySlug = asyncHandler(async (req, res) => {
  // Try to find by slug, if not valid ObjectId, or if slug format
  let event = await Event.findOne({ slug: req.params.slug })
    .populate('managerIds', 'name email phone')
    .populate('createdBy', 'name');

  // Fallback: try ID if slug lookup fails
  if (!event && req.params.slug.match(/^[0-9a-fA-F]{24}$/)) {
     event = await Event.findById(req.params.slug)
        .populate('managerIds', 'name email phone')
        .populate('createdBy', 'name');
  }

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  res.json(event);
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin)
const createEvent = asyncHandler(async (req, res) => {
  // Check database connection
  if (mongoose.connection.readyState !== 1) {
    console.error('Database not connected. Connection state:', mongoose.connection.readyState);
    res.status(503);
    throw new Error('Database connection is not available. Please check your MongoDB connection.');
  }

  console.log('Creating event - User:', req.user?.id, req.user?.role);
  console.log('Event data received:', req.body);

  const { 
    title, type, description, location, 
    startDate, endDate, status, 
    estimatedBudget, isPublic, managerIds, slug, bannerUrl
  } = req.body;

  if (!title || !title.trim()) {
    res.status(400);
    throw new Error('Please add an event title');
  }

  // Generate or validate slug
  let eventSlug = '';
  if (slug && typeof slug === 'string' && slug.trim() !== '') {
    eventSlug = slug.trim().toLowerCase();
  } else {
    eventSlug = generateSlug(title);
  }
  
  // Ensure slug is not empty
  if (!eventSlug || eventSlug.trim() === '') {
    eventSlug = `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  // Clean up slug: remove leading/trailing dashes and ensure valid format
  eventSlug = eventSlug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  
  // Final fallback if still empty
  if (!eventSlug || eventSlug.length === 0) {
    eventSlug = `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  console.log('Generated slug:', eventSlug);

  // Check if slug exists - if it does, append a unique suffix
  let finalSlug = eventSlug;
  let slugExists = await Event.findOne({ slug: finalSlug });
  let suffixCounter = 1;
  
  while (slugExists) {
    finalSlug = `${eventSlug}-${suffixCounter}`;
    slugExists = await Event.findOne({ slug: finalSlug });
    suffixCounter++;
    
    // Safety check to avoid infinite loop
    if (suffixCounter > 1000) {
      finalSlug = `${eventSlug}-${Date.now()}`;
      break;
    }
  }
  
  eventSlug = finalSlug;

  // Convert date strings to Date objects, or undefined if empty
  let processedStartDate = undefined;
  let processedEndDate = undefined;
  
  if (startDate) {
    const dateStr = String(startDate).trim();
    if (dateStr !== '') {
      processedStartDate = new Date(dateStr);
      if (isNaN(processedStartDate.getTime())) {
        res.status(400);
        throw new Error('Invalid start date format');
      }
    }
  }
  
  if (endDate) {
    const dateStr = String(endDate).trim();
    if (dateStr !== '') {
      processedEndDate = new Date(dateStr);
      if (isNaN(processedEndDate.getTime())) {
        res.status(400);
        throw new Error('Invalid end date format');
      }
    }
  }

  // Validate and filter managerIds (must be valid ObjectIds)
  let processedManagerIds = [];
  if (Array.isArray(managerIds) && managerIds.length > 0) {
    processedManagerIds = managerIds
      .filter(id => id && String(id).trim() !== '')
      .filter(id => isValidObjectId(id));
    // Mongoose will automatically convert valid ObjectId strings
  }

  // Validate createdBy is a valid ObjectId
  if (!req.user || !req.user.id || !isValidObjectId(req.user.id)) {
    res.status(400);
    throw new Error('Invalid user ID');
  }

  // Final validation and normalization of slug before creating
  if (!eventSlug || typeof eventSlug !== 'string' || eventSlug.trim() === '') {
    console.error('Slug validation failed! Slug:', eventSlug, 'Title:', title);
    // Last resort: create a slug from timestamp
    eventSlug = `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    console.log('Using fallback slug:', eventSlug);
  }
  
  // Normalize slug one more time - ensure it's a valid slug format
  let normalizedSlug = String(eventSlug || '')
    .trim()
    .toLowerCase();
  
  // Clean special characters but keep dashes
  normalizedSlug = normalizedSlug.replace(/[^a-z0-9-]+/g, '-');
  // Remove leading/trailing dashes
  normalizedSlug = normalizedSlug.replace(/^-+|-+$/g, '');
  // Replace multiple consecutive dashes with single dash
  normalizedSlug = normalizedSlug.replace(/-+/g, '-');
  
  // Final check - if normalized slug is empty or invalid, use timestamp-based slug
  const finalSlugForSave = (normalizedSlug && normalizedSlug.length > 0 && normalizedSlug !== '-') 
    ? normalizedSlug 
    : `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  console.log('Final slug for save:', finalSlugForSave);
  console.log('Final slug validation - type:', typeof finalSlugForSave, 'length:', finalSlugForSave?.length, 'value:', finalSlugForSave);

  // Prepare event data
  const eventData = {
    title: title.trim(),
    slug: finalSlugForSave,
    type: type || 'other',
    description: description || '',
    location: location || '',
    startDate: processedStartDate,
    endDate: processedEndDate,
    status: status || 'upcoming',
    estimatedBudget: estimatedBudget || 0,
    bannerUrl: bannerUrl || '',
    isPublic: isPublic !== undefined ? isPublic : true,
    managerIds: processedManagerIds,
    createdBy: req.user.id  // Mongoose will handle ObjectId conversion
  };

  console.log('Creating event with data:', JSON.stringify(eventData, null, 2));
  console.log('Slug being used:', eventData.slug);
  console.log('Slug type:', typeof eventData.slug, 'Length:', eventData.slug?.length);

  // Final check: ensure slug is present and valid
  if (!eventData.slug || typeof eventData.slug !== 'string' || eventData.slug.trim() === '') {
    console.error('CRITICAL: Slug is empty before Event.create()!', eventData);
    res.status(500);
    throw new Error('Internal error: Failed to generate slug. Please try again.');
  }

  // Create the event
  const event = await Event.create(eventData);
  
  console.log('Event created successfully:', event._id);
  console.log('Event details:', {
    id: event._id,
    title: event.title,
    slug: event.slug,
    status: event.status
  });
  
  res.status(201).json(event);
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin)
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // If slug is being updated, check uniqueness
  if (req.body.slug && req.body.slug !== event.slug) {
      const slugExists = await Event.findOne({ slug: req.body.slug });
      if (slugExists) {
          res.status(400);
          throw new Error('Slug already in use');
      }
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id, 
    req.body, 
    { new: true, runValidators: true }
  );

  res.json(updatedEvent);
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  await event.deleteOne();

  res.json({ id: req.params.id, message: 'Event deleted' });
});

// @desc    Update event status
// @route   PUT /api/events/:id/status
// @access  Private (Admin)
const updateEventStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    res.status(400);
    throw new Error('Please provide a status');
  }

  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  event.status = status;
  await event.save();

  res.json(event);
});

module.exports = {
  getEvents,
  getUpcomingEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus
};
