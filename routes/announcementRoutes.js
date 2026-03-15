const express = require('express');
const Announcement = require('../models/Announcement');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Create Announcement
router.post('/', auth, async (req, res) => {
  try {
    const announcementData = {
      ...req.body,
      createdBy: req.user.id || req.user._id,
    };
    const announcement = await Announcement.create(announcementData);
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Error creating announcement', error: error.message });
  }
});

// Get All Announcements
router.get('/', auth, async (req, res) => {
  try {
    const announcements = await Announcement
      .find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ priority: -1, createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
});

// Update Announcement
router.put('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Error updating announcement', error: error.message });
  }
});

// Delete Announcement
router.delete('/:id', auth, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting announcement', error: error.message });
  }
});

module.exports = router;
