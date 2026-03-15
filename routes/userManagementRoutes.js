const express = require('express');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get All Users with Role Filter
router.get('/', auth, async (req, res) => {
  try {
    const { role, status } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = { $ne: false };
    if (status === 'inactive') filter.isActive = false;
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get User Statistics - MUST be before /:id routes
router.get('/stats', auth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    // Count active: isActive is true OR isActive is not set (undefined/null treated as active)
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const activeUsers = totalUsers - inactiveUsers;
    const students = await User.countDocuments({ role: 'student' });
    const faculty = await User.countDocuments({ role: 'faculty' });
    const admins = await User.countDocuments({ role: 'admin' });
    
    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      students,
      faculty,
      admins
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
});

// Update User Role
router.put('/:id/role', auth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
});

// Activate/Deactivate User
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
});

// Delete User (and related records)
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete related records based on role
    if (user.role === 'student') {
      await Student.deleteOne({ email: user.email });
    } else if (user.role === 'faculty') {
      await Faculty.deleteOne({ email: user.email });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User and related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;
