const express = require('express');
const Department = require('../models/Department');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get All Departments
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('head', 'name email')
      .sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
});

// Create Department
router.post('/', auth, async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error: error.message });
  }
});

// Update Department
router.put('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error updating department', error: error.message });
  }
});

// Delete Department
router.delete('/:id', auth, async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error: error.message });
  }
});

// Get Department Statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    const students = await Student.countDocuments({ department: department.name });
    const faculty = await Faculty.countDocuments({ department: department.name });
    
    res.json({
      department,
      studentCount: students,
      facultyCount: faculty
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department stats', error: error.message });
  }
});

module.exports = router;
