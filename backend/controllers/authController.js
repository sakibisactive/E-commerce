import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOTPEmail } from '../services/emailService.js';
import { logActivity } from '../middleware/logMiddleware.js';

// Helper to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'apex_ecommerce_jwt_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user & send OTP to provided email
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  try {
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Check if email or phone already exists in DB
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });

    let user;

    if (userExists) {
      // If user exists and is ALREADY verified, reject duplicate registration
      if (userExists.isVerified) {
        return res.status(400).json({ message: 'Email or Phone number is already registered. Please sign in.' });
      }

      // If user exists but is NOT verified yet, update details and send a fresh OTP
      userExists.name = name;
      userExists.email = email;
      userExists.phone = phone;
      userExists.password = password;
      userExists.otp = otp;
      userExists.otpExpires = otpExpires;
      user = await userExists.save();
    } else {
      // Create new unverified user record
      user = await User.create({
        name,
        email,
        phone,
        password,
        role: 'customer',
        otp,
        otpExpires,
        isVerified: false,
      });
    }

    if (user) {
      // Send OTP via email to provided email address
      sendOTPEmail(user.email, user.name, otp).catch((err) => {
        console.error('Registration OTP Email Dispatch Error:', err.message);
      });

      await logActivity(user._id, 'Login', { status: 'Registered, pending OTP verification' });

      // Return response WITHOUT on-screen OTP code
      res.status(201).json({
        otpRequired: true,
        email: user.email,
        message: `Verification OTP has been sent to ${user.email}. Please check your inbox.`,
      });
    } else {
      res.status(400).json({ message: 'Invalid registration user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Verify OTP for registration, set isVerified=true, and issue login token
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // Validate OTP code and expiration
    if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Mark verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Audit log
    await logActivity(user._id, 'Login', { status: 'Verified OTP & logged in successfully' });

    // Respond with user data and auth token for instant login
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

// @desc    Verify user email (legacy/link endpoint)
// @route   GET /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  res.status(200).json({ message: 'Account is verified. Please log in.' });
};

// @desc    Direct Login with Email or Phone + Password for verified users
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { emailOrPhone, email, phone, password } = req.body;

  try {
    const identifier = emailOrPhone || email || phone;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please enter your phone number / email and password' });
    }

    // Find user by email OR phone
    const user = await User.findOne({
      $or: [{ email: identifier.trim() }, { phone: identifier.trim() }],
    });

    if (user && (await user.matchPassword(password))) {
      // If account is not verified yet, resend OTP email and prompt verification
      if (!user.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        sendOTPEmail(user.email, user.name, otp).catch((err) => {
          console.error('Unverified Login OTP Dispatch Error:', err.message);
        });

        return res.status(200).json({
          otpRequired: true,
          email: user.email,
          message: `Your account is not verified yet. A fresh OTP code has been sent to ${user.email}.`,
        });
      }

      // Direct login for verified returning users
      await logActivity(user._id, 'Login', { status: 'Direct login successful' });

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhoto: user.profilePhoto,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials. Please check your phone number / email and password.' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  try {
    if (req.user?._id) {
      await logActivity(req.user._id, 'Logout', { status: 'Logged out successfully' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during logout' });
  }
};
