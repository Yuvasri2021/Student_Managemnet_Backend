const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Sports', 'Cultural', 'Technical', 'Social Service'],
    required: true
  },
  level: {
    type: String,
    enum: ['College', 'Inter-College', 'State', 'National', 'International'],
    default: 'College'
  },
  description: { type: String, required: true },
  conductedBy: { type: String, required: true },
  date: { type: Date },
  venue: { type: String },
  maxParticipants: { type: Number },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
