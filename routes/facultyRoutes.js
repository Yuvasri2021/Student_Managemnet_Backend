const express = require('express');
const Faculty = require('../models/Faculty');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Create Faculty (also creates User account)
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, department, phone, designation, qualification, specialization, facultyId, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create User account first
    const user = await User.create({
      name,
      email,
      password: password || 'faculty123', // Default password if not provided
      role: 'faculty',
      isActive: true
    });
    
    // Create Faculty record
    const faculty = await Faculty.create({
      facultyId: facultyId || user._id.toString().slice(-6),
      name,
      email,
      department,
      phone,
      designation,
      qualification,
      specialization,
      joiningDate: new Date()
    });
    
    res.status(201).json({ 
      message: 'Faculty and user account created successfully',
      faculty,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating faculty', error: error.message });
  }
});

// Get All Faculty (includes all registered users with faculty role)
router.get('/', auth, async (req, res) => {
  try {
    // Get all users with faculty role
    const facultyUsers = await User.find({ role: 'faculty' }).select('-password');
    
    // Get all faculty records
    const facultyRecords = await Faculty.find();
    
    // Merge the data
    const allFaculty = facultyUsers.map(user => {
      // Find matching faculty record by email
      const facultyRecord = facultyRecords.find(f => f.email === user.email);
      
      if (facultyRecord) {
        // If faculty record exists, return it (it has more details)
        return facultyRecord.toObject();
      } else {
        // If no faculty record, create one from user data
        return {
          _id: user._id,
          facultyId: user._id.toString().slice(-6), // Generate ID from user ID
          name: user.name,
          email: user.email,
          department: 'Not Set',
          phone: '',
          designation: 'Not Set',
          qualification: 'Not Set',
          specialization: 'Not Set',
          joiningDate: user.createdAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isFromUserTable: true // Flag to identify these records
        };
      }
    });
    
    res.json(allFaculty);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching faculty', error: error.message });
  }
});

// Get Single Faculty
router.get('/:id', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching faculty', error: error.message });
  }
});

// Update Faculty (also updates User account)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, department, phone, designation, qualification, specialization, facultyId } = req.body;
    
    // Try to find in Faculty collection first
    let faculty = await Faculty.findById(req.params.id);
    
    if (faculty) {
      faculty = await Faculty.findByIdAndUpdate(
        req.params.id, 
        { facultyId, name, email, department, phone, designation, qualification, specialization }, 
        { new: true }
      );
      await User.findOneAndUpdate(
        { email: faculty.email },
        { name, email },
        { new: true }
      );
    } else {
      // User-only record - update user and create Faculty record
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ message: 'Faculty not found' });
      }
      faculty = await Faculty.create({
        facultyId: facultyId || req.params.id.toString().slice(-6),
        name,
        email,
        department,
        phone,
        designation,
        qualification,
        specialization,
        joiningDate: new Date()
      });
    }
    
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Error updating faculty', error: error.message });
  }
});

// Delete Faculty (also deletes User account)
router.delete('/:id', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (faculty) {
      await User.findOneAndDelete({ email: faculty.email });
    } else {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Faculty not found' });
      }
    }
    res.json({ message: 'Faculty and user account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting faculty', error: error.message });
  }
});

module.exports = router;
