const express = require('express');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get All Audit Logs (with pagination and filters)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, action, entity, userId } = req.query;
    
    const filter = {};
    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    if (userId) filter.user = userId;
    
    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await AuditLog.countDocuments(filter);
    
    res.json({
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
});

// Create Audit Log
router.post('/', auth, async (req, res) => {
  try {
    const log = await AuditLog.create({
      ...req.body,
      user: req.user._id
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error creating audit log', error: error.message });
  }
});

// Get User's Activity History
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const logs = await AuditLog.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user logs', error: error.message });
  }
});

module.exports = router;
