import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOTPEmail } from '../services/emailService.js';
import { logActivity } from '../middleware/logMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'apex_ecommerce_jwt_secret_key_2026';

// Helper to generate JWT auth token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register request: Send OTP to email without creating user in DB yet
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

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check if email or phone already exists in DB
    const userExists = await User.findOne({ $or: [{ email: cleanEmail }, { phone: cleanPhone }] });
    if (userExists) {
      return res.status(400).json({ message: 'Email or Phone number is already registered. Please sign in.' });
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create signed temporary signup token (15 mins validity)
    const signupToken = jwt.sign(
      {
        name,
        email: cleanEmail,
        phone: cleanPhone,
        password,
        otp,
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    console.log('==================================================');
    console.log('🔑 REGISTRATION OTP GENERATED (NOT YET IN DB)');
    console.log(`User Email: ${cleanEmail}`);
    console.log(`6-Digit OTP Code: ${otp}`);
    console.log('==================================================');

    // Send OTP via email to provided email address
    sendOTPEmail(cleanEmail, name, otp).catch((err) => {
      console.error('Registration OTP Email Dispatch Error:', err.message);
    });

    // Return response with signupToken. USER IS NOT IN DB YET!
    res.status(201).json({
      otpRequired: true,
      email: cleanEmail,
      signupToken,
      message: `Verification OTP has been sent to ${cleanEmail}. Please enter the code to complete registration.`,
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Verify OTP, CREATE user in MongoDB, and issue login token
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  const { email, otp, signupToken } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. If signupToken exists (New Registration Flow)
    if (signupToken) {
      let decoded;
      try {
        decoded = jwt.verify(signupToken, JWT_SECRET);
      } catch (err) {
        return res.status(400).json({ message: 'OTP session expired. Please register again.' });
      }

      if (decoded.email !== cleanEmail || decoded.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP code. Please check your email.' });
      }

      // Check if user was registered in the meantime
      const existingUser = await User.findOne({ $or: [{ email: cleanEmail }, { phone: decoded.phone }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Account already created. Please sign in.' });
      }

      // NOW CREATE THE USER IN MONGO DB (AFTER OTP VERIFICATION)
      const newUser = await User.create({
        name: decoded.name,
        email: decoded.email,
        phone: decoded.phone,
        password: decoded.password,
        role: 'customer',
        isVerified: true,
      });

      await logActivity(newUser._id, 'Login', { status: 'Registered & verified OTP successfully' });

      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        profilePhoto: newUser.profilePhoto,
        token: generateToken(newUser._id, newUser.role),
      });
    }

    // 2. Fallback for Existing DB User OTP Verification
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: 'User account not found. Please register.' });
    }

    if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    await logActivity(user._id, 'Login', { status: 'Verified OTP & logged in successfully' });

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

    const cleanIdentifier = identifier.trim();

    // Find user by email OR phone
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier.toLowerCase() }, { phone: cleanIdentifier }],
    });

    if (user && (await user.matchPassword(password))) {
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
