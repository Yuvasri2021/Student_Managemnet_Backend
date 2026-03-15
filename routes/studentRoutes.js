const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Create Student (also creates User account)
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, department, year, phone, rollNumber, studentId, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create User account first
    const user = await User.create({
      name,
      email,
      password: password || 'student123', // Default password if not provided
      role: 'student',
      isActive: true
    });
    
    // Create Student record
    const student = await Student.create({
      studentId: studentId || user._id.toString().slice(-6),
      name,
      email,
      department,
      year,
      phone,
      rollNumber
    });
    
    res.status(201).json({ 
      message: 'Student and user account created successfully',
      student,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error: error.message });
  }
});

// Get All Students (includes all registered users with student role)
router.get('/', auth, async (req, res) => {
  try {
    // Get all users with student role
    const studentUsers = await User.find({ role: 'student' }).select('-password');
    
    // Get all student records
    const studentRecords = await Student.find();
    
    // Merge the data
    const allStudents = studentUsers.map(user => {
      // Find matching student record by email
      const studentRecord = studentRecords.find(s => s.email === user.email);
      
      if (studentRecord) {
        // If student record exists, return it (it has more details)
        return studentRecord.toObject();
      } else {
        // If no student record, create one from user data
        return {
          _id: user._id,
          studentId: user._id.toString().slice(-6), // Generate ID from user ID
          name: user.name,
          email: user.email,
          department: 'Not Set',
          year: 0,
          phone: '',
          rollNumber: '',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isFromUserTable: true // Flag to identify these records
        };
      }
    });
    
    res.json(allStudents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

// Get Single Student
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
});

// Update Student (also updates User account)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, department, year, phone, rollNumber, studentId } = req.body;
    
    // Try to find in Student collection first
    let student = await Student.findById(req.params.id);
    
    if (student) {
      // Update existing Student record
      student = await Student.findByIdAndUpdate(
        req.params.id, 
        { studentId, name, email, department, year, phone, rollNumber }, 
        { new: true }
      );
      // Update User record too
      await User.findOneAndUpdate(
        { email: student.email },
        { name, email },
        { new: true }
      );
    } else {
      // This is a user-only record (isFromUserTable), create a Student record for it
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ message: 'Student not found' });
      }
      // Create a proper Student record now
      student = await Student.create({
        studentId: studentId || req.params.id.toString().slice(-6),
        name,
        email,
        department,
        year,
        phone,
        rollNumber
      });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
});

// Delete Student (also deletes User account)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Try Student collection first
    const student = await Student.findByIdAndDelete(req.params.id);
    if (student) {
      await User.findOneAndDelete({ email: student.email });
    } else {
      // It's a user-only record
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Student not found' });
      }
    }
    res.json({ message: 'Student and user account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
});

module.exports = router;
