const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'urgent'],
    default: 'info'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'student', 'faculty', 'admin'],
    default: 'all'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date },
  priority: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
