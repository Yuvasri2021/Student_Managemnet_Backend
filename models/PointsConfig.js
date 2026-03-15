const mongoose = require('mongoose');

const pointsConfigSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['College', 'Inter-College', 'State', 'National', 'International'],
    required: true,
    unique: true
  },
  points: { type: Number, required: true, default: 0 },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PointsConfig', pointsConfigSchema);
