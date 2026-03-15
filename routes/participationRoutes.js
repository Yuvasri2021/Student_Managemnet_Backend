const express = require('express');
const Participation = require('../models/Participation');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Create Participation
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== CREATE PARTICIPATION ===');
    console.log('Request body:', req.body);
    
    const record = await Participation.create(req.body);
    console.log('Created participation:', record);
    
    // Populate the record before sending response
    const populatedRecord = await Participation.findById(record._id)
      .populate({
        path: 'student',
        select: 'studentId name email department year phone rollNumber'
      })
      .populate({
        path: 'activity',
        select: 'title category date venue status'
      });
    
    console.log('Populated participation:', populatedRecord);
    
    res.status(201).json(populatedRecord);
  } catch (error) {
    console.error('Error creating participation:', error);
    res.status(500).json({ message: 'Error creating participation', error: error.message });
  }
});

// Get All Participations
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Filter by student email if provided
    if (req.query.studentEmail) {
      const Student = require('../models/Student');
      const student = await Student.findOne({ email: req.query.studentEmail });
      if (student) {
        query.student = student._id;
      } else {
        return res.json([]); // Return empty array if student not found
      }
    }

    // Filter by activityId if provided
    if (req.query.activityId) {
      query.activity = req.query.activityId;
    }
    
    const records = await Participation
      .find(query)
      .populate({
        path: 'student',
        select: 'studentId name email department year phone rollNumber'
      })
      .populate({
        path: 'activity',
        select: 'title category date venue status'
      })
      .sort({ createdAt: -1 });
    
    // Enhance records with User data if Student data is incomplete or null
    const User = require('../models/User');
    const enhancedRecords = await Promise.all(records.map(async (record) => {
      const recordObj = record.toObject();
      
      if (!recordObj.student) {
        // Student populate returned null - try to find by the raw student ID stored on the record
        const rawStudentId = record.student;
        if (rawStudentId) {
          const user = await User.findById(rawStudentId).select('name email').catch(() => null);
          if (user) {
            recordObj.student = { _id: user._id, name: user.name, email: user.email };
          }
        }
      } else if (recordObj.student && !recordObj.student.name) {
        // Student record exists but name is missing, get from User table
        const user = await User.findOne({ email: recordObj.student.email }).select('name email').catch(() => null);
        if (user) {
          recordObj.student = {
            ...recordObj.student,
            name: user.name,
            email: recordObj.student.email || user.email
          };
        }
      }
      
      return recordObj;
    }));
    
    res.json(enhancedRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching participations', error: error.message });
  }
});

// Get Single Participation
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await Participation.findById(req.params.id)
      .populate('student')
      .populate('activity');
    if (!record) return res.status(404).json({ message: 'Participation not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching participation', error: error.message });
  }
});

// Update Participation
router.put('/:id', auth, async (req, res) => {
  try {
    const record = await Participation.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student')
      .populate('activity');
    if (!record) return res.status(404).json({ message: 'Participation not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error updating participation', error: error.message });
  }
});

// Delete Participation
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await Participation.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Participation not found' });
    res.json({ message: 'Participation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting participation', error: error.message });
  }
});

module.exports = router;
