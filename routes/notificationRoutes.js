const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Create Notification (Admin/Faculty can send to specific users or roles)
router.post('/', auth, async (req, res) => {
  try {
    const { recipientRole, recipientIds, ...notificationData } = req.body;
    const senderId = req.user.id || req.user._id;

    // If recipientIds provided, send to specific users
    if (recipientIds && recipientIds.length > 0) {
      const notifications = recipientIds.map(recipientId => ({
        ...notificationData,
        recipient: recipientId,
        recipientRole,
        sender: senderId
      }));
      const created = await Notification.insertMany(notifications);
      return res.status(201).json(created);
    }
    
    // Send to all users of a role
    const users = await User.find({ role: recipientRole }).select('_id');
    
    if (users.length === 0) {
      return res.status(200).json({ message: 'No users found for this role', count: 0, notifications: [] });
    }
    
    const notifications = users.map(user => ({
      ...notificationData,
      recipient: user._id,
      recipientRole,
      sender: senderId
    }));
    
    const created = await Notification.insertMany(notifications);
    res.status(201).json({ message: `Sent to ${created.length} users`, notifications: created });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
});

// Get User's Notifications
router.get('/my-notifications', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const notifications = await Notification
      .find({ recipient: userId })
      .populate('sender', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });
    
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Get Sent Notifications (Admin view)
router.get('/sent', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const notifications = await Notification
      .find({ sender: userId })
      .populate('recipient', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ notifications, total: notifications.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sent notifications', error: error.message });
  }
});

// Mark as Read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});

// Mark All as Read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
});

// Delete Notification
router.delete('/:id', auth, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

module.exports = router;
