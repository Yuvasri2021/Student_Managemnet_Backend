const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  level: {
    type: String,
    enum: ['College', 'Inter-College', 'State', 'National', 'International'],
    required: true
  },
  achievement: { type: String },
  position: { type: String },
  certificate: { type: String },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: { type: String },
  attendance: {
    type: String,
    enum: ['present', 'absent', 'not-marked'],
    default: 'not-marked'
  },
  rank: { type: String },
  achievementLevel: { type: String },
  points: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Participation', participationSchema);
