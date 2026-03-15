const User = require('../models/User');


module.exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // hide password
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'User profile fetched successfully',
      user
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
