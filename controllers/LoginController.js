const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports.login = async (req, res) => {
  const { gmail, email, password } = req.body;
  const userEmail = gmail || email; // Support both fields

  try {
    // 1. Validation
    if (!userEmail || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // 2. Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // 3. Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact the administrator.' });
    }

    // 4. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // 5. Create token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1d' }
    );

    // 6. Send response
    res.json({
      success: true,
      message: 'Login success',
      token,
      role: user.role,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
