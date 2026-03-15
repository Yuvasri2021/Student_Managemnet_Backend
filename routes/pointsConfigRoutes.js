const express = require('express');
const PointsConfig = require('../models/PointsConfig');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get All Points Configurations
router.get('/', auth, async (req, res) => {
  try {
    const configs = await PointsConfig.find().sort({ points: -1 });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching points config', error: error.message });
  }
});

// Create or Update Points Config
router.post('/', auth, async (req, res) => {
  try {
    const { level, points, description } = req.body;
    
    // Check if config exists for this level
    let config = await PointsConfig.findOne({ level });
    
    if (config) {
      // Update existing
      config.points = points;
      config.description = description;
      await config.save();
    } else {
      // Create new
      config = await PointsConfig.create({ level, points, description });
    }
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error saving points config', error: error.message });
  }
});

// Update Points Config
router.put('/:id', auth, async (req, res) => {
  try {
    const config = await PointsConfig.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error updating points config', error: error.message });
  }
});

// Delete Points Config
router.delete('/:id', auth, async (req, res) => {
  try {
    await PointsConfig.findByIdAndDelete(req.params.id);
    res.json({ message: 'Points config deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting points config', error: error.message });
  }
});

module.exports = router;
