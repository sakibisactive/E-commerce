import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendVerificationEmail, sendOTPEmail } from '../services/emailService.js';
import { logActivity } from '../middleware/logMiddleware.js';

// Helper to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'default_secret_for_local_development_123456', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  try {
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET || 'default_secret_for_local_development_123456', { expiresIn: '1d' });

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'customer',
      verificationToken,
      isVerified: false,
    });

    if (user) {
      // Send verification email in background to prevent request delays
      sendVerificationEmail(user.email, user.name, verificationToken).catch((err) => {
        console.error('Verification email send error:', err.message);
      });
      
      await logActivity(user._id, 'Login', { status: 'Registered, pending verification' });

      res.status(201).json({
        message: 'Registration successful! You can now log in.',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Verify user email
// @route   GET /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_for_local_development_123456');
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    await logActivity(user._id, 'Login', { status: 'Verified email successfully' });

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Email Verification Error:', error.message);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

// @desc    Log in user & send OTP
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // 2FA - Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      console.log('================ 2FA OTP GENERATED ================');
      console.log(`User: ${user.email} | OTP Code: ${otp}`);
      console.log('==================================================');

      // Send OTP via email in background
      sendOTPEmail(user.email, user.name, otp).catch((err) => {
        console.error('OTP email send error:', err.message);
      });

      res.status(200).json({
        otpRequired: true,
        email: user.email,
        message: 'A 2FA verification OTP code has been sent to your email.',
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Verify OTP & issue token
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify OTP
    if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Clear OTP details
    user.otp = undefined;
    user.otpExpires = undefined;
    
    // Auto-verify if they haven't verified their email but got OTP
    if (!user.isVerified) {
      user.isVerified = true;
    }
    
    await user.save();

    // Create session audit log
    await logActivity(user._id, 'Login', { status: 'Authenticated successfully' });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePhoto: user.profilePhoto,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error('OTP Verification Error:', error.message);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  try {
    await logActivity(req.user._id, 'Logout', { status: 'Logged out successfully' });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during logout' });
  }
};
