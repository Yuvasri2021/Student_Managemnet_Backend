const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  facultyId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  designation: { type: String },
  qualification: { type: String },
  specialization: { type: String },
  joiningDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
