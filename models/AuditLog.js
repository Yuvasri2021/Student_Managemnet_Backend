const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    enum: ['create', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'export'],
    required: true 
  },
  entity: { 
    type: String, 
    enum: ['user', 'student', 'faculty', 'activity', 'participation', 'announcement', 'department'],
    required: true 
  },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  description: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  changes: { type: mongoose.Schema.Types.Mixed }, // Store before/after values
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
