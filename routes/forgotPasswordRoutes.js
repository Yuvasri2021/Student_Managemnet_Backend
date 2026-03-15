const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Forgot password routes are working!' });
});

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Configure email transporter
const createTransporter = () => {
  // For Gmail
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com', // Add your Gmail
      pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Add your App Password
    }
  });
};

// Send OTP to email
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'Student Activity Portal',
      to: email,
      subject: 'Password Reset OTP - Student Activity Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #6366F1; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .otp { font-size: 32px; font-weight: bold; color: #6366F1; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Student Activity Portal</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>You have requested to reset your password. Please use the OTP below to verify your identity:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code</p>
                <div class="otp">${otp}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0;">
                  <li>This OTP will expire in <strong>10 minutes</strong></li>
                  <li>Do not share this OTP with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>
              
              <p>After entering the OTP, you'll be able to create a new password for your account.</p>
              
              <p>Best regards,<br><strong>Student Activity Portal Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 Student Activity Portal. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    
    // Also log to console for development
    console.log(`\n========================================`);
    console.log(`OTP for ${email}: ${otp}`);
    console.log(`This OTP will expire in 10 minutes`);
    console.log(`========================================\n`);
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    // Still log to console as fallback
    console.log(`\n========================================`);
    console.log(`⚠️ Email failed, but here's the OTP for ${email}: ${otp}`);
    console.log(`This OTP will expire in 10 minutes`);
    console.log(`========================================\n`);
    throw error;
  }
};

// Step 1: Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    console.log('Request OTP endpoint hit');
    console.log('Request body:', req.body);
    
    const { email } = req.body;

    if (!email) {
      console.log('Error: Email is required');
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Error: User not found with email:', email);
      return res.status(404).json({ message: 'User not found with this email' });
    }

    console.log('User found:', user.email);

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    console.log('Generated OTP:', otp);

    // Store OTP
    otpStorage.set(email, {
      otp,
      expiresAt,
      attempts: 0
    });

    console.log('OTP stored successfully');

    // Send OTP via email
    await sendOTPEmail(email, otp);

    console.log('OTP sent successfully');

    res.json({ 
      success: true,
      message: 'OTP sent to your email. Please check your console for development.',
      email 
    });

  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Step 2: Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Get stored OTP
    const storedData = otpStorage.get(email);

    if (!storedData) {
      return res.status(400).json({ message: 'No OTP request found. Please request a new OTP.' });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStorage.delete(email);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      otpStorage.delete(email);
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      otpStorage.set(email, storedData);
      return res.status(400).json({ 
        message: 'Invalid OTP',
        attemptsLeft: 3 - storedData.attempts
      });
    }

    // OTP verified successfully
    // Mark as verified
    storedData.verified = true;
    otpStorage.set(email, storedData);

    res.json({ 
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      email 
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Step 3: Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if OTP was verified
    const storedData = otpStorage.get(email);
    if (!storedData || !storedData.verified) {
      return res.status(400).json({ message: 'Please verify OTP first' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Clear OTP data
    otpStorage.delete(email);

    res.json({ 
      success: true,
      message: 'Password reset successfully. You can now login with your new password.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store new OTP
    otpStorage.set(email, {
      otp,
      expiresAt,
      attempts: 0
    });

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.json({ 
      success: true,
      message: 'New OTP sent to your email',
      email 
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
