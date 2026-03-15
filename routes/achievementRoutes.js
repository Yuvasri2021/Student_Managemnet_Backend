const express = require('express');
const Achievement = require('../models/Achievement');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Create Achievement
router.post('/', auth, async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body);
    res.status(201).json(achievement);
  } catch (error) {
    res.status(500).json({ message: 'Error creating achievement', error: error.message });
  }
});

// Get All Achievements
router.get('/', auth, async (req, res) => {
  try {
    const achievements = await Achievement.find().populate('student');
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching achievements', error: error.message });
  }
});

// Get Achievements by Student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const achievements = await Achievement.find({ student: req.params.studentId });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student achievements', error: error.message });
  }
});

// Delete Achievement
router.delete('/:id', auth, async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting achievement', error: error.message });
  }
});

module.exports = router;
