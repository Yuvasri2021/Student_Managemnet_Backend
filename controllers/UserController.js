// server/controllers/UserController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');

// ================== CREATE USER ==================
module.exports.CreateUser = async (req, res) => {
  const { name, gmail, password, phoneNo, role, dept, programme } = req.body;

  try {
    // 1. Validation
    if (!name || !gmail || !password || !phoneNo || !role || !dept || !programme) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // 2. Check if user exists
    const userExist = await User.findOne({ gmail });
    if (userExist) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // 3. Role validation (accept id or name)
    let roleDoc = null;
    if (mongoose.Types.ObjectId.isValid(role)) {
      roleDoc = await Role.findById(role);
    }
    if (!roleDoc) {
      roleDoc = await Role.findOne({ role: role });
    }
    if (!roleDoc) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Save user
    const user = new User({
      name,
      gmail,
      password: hashedPassword,
      phoneNo,
      role: roleDoc._id,
      dept,
      programme
    });
    await user.save();

    // 6. JWT token
    const token = jwt.sign(
      { id: user._id, gmail: user.gmail, role: roleDoc.role },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1d' }
    );

    // 7. Prepare user object to return (without password)
    const userToReturn = await User.findById(user._id).populate('role', 'role').select('-password');

    // 8. Response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      role: roleDoc.role,
      user: userToReturn
    });

  } catch (err) {
    console.error('CreateUser error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ================== GET ALL USERS ==================
module.exports.GetUser = async (req, res) => {
  try {
    const users = await User.find()
      .populate('role', 'role') // only get role name
      .sort({ createdAt: -1 })
      .select('-password'); // don't return password hashes

    // keep behavior: returning plain array (your client expects array)
    res.status(200).json(users);
  } catch (error) {
    console.error('GetUser error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ================== DELETE USER ==================
module.exports.DeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('DeleteUser error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ================== UPDATE USER ==================
// Supports:
//   PUT /api/UpdateUser/:id
//   PUT /api/UpdateUser   (with { id: '...', ... } in body)
module.exports.UpdateUser = async (req, res) => {
  try {
    // Accept id from params or body for flexibility
    const id = req.params.id || req.body.id;
    if (!id) {
      return res.status(400).json({ success: false, message: 'User id is required (params or body).' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
    }

    // Check user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Destructure allowed updatable fields from body
    const {
      name,
      gmail,
      password,      // optional: only update if provided
      phoneNo,
      role,          // can be role id or role name
      dept,
      programme
    } = req.body;

    // require at least one updatable field
    if (
      typeof name === 'undefined' &&
      typeof gmail === 'undefined' &&
      typeof password === 'undefined' &&
      typeof phoneNo === 'undefined' &&
      typeof role === 'undefined' &&
      typeof dept === 'undefined' &&
      typeof programme === 'undefined'
    ) {
      return res.status(400).json({ success: false, message: 'At least one updatable field must be provided.' });
    }

    // Build update object
    const update = {};

    if (typeof name !== 'undefined') update.name = name;
    if (typeof gmail !== 'undefined') update.gmail = gmail;
    if (typeof phoneNo !== 'undefined') update.phoneNo = phoneNo;
    if (typeof dept !== 'undefined') update.dept = dept;
    if (typeof programme !== 'undefined') update.programme = programme;

    // Handle role resolution (role id or role name)
    if (typeof role !== 'undefined' && role !== null && role !== '') {
      let roleDoc = null;
      if (mongoose.Types.ObjectId.isValid(role)) {
        roleDoc = await Role.findById(role);
      }
      if (!roleDoc) {
        roleDoc = await Role.findOne({ role: role });
      }
      if (!roleDoc) {
        return res.status(400).json({ success: false, message: 'Invalid role provided.' });
      }
      update.role = roleDoc._id;
    }

    // Handle password: only update when provided and non-empty
    if (typeof password !== 'undefined' && password !== null && password !== '') {
      const hashed = await bcrypt.hash(password, 10);
      update.password = hashed;
    }

    // Perform update and return the new document
    const updatedUser = await User.findByIdAndUpdate(id, update, { new: true })
      .populate('role', 'role') // return role name only
      .select('-password');     // never return password hash

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    console.error('UpdateUser error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
