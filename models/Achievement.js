const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  badge: {
    type: String,
    enum: ['First Timer', 'Active Participant', 'Champion', 'All Rounder', 'Leader', 'Consistent', 'Rising Star', 'Legend'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  earnedDate: { type: Date, default: Date.now },
  criteria: { type: String },
  points: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
