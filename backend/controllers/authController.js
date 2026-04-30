import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

// ── Token factory — embeds tokenVersion to enable server-side invalidation ────
const generateToken = (id, tokenVersion) => {
  return jwt.sign(
    { id, type: 'admin', tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ── In-memory brute-force guard ───────────────────────────────────────────────
// For multi-instance production: replace with Redis + rate-limiter-flexible
const loginAttempts = new Map(); // email → { count, lockedUntil }

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const checkRateLimit = (email) => {
  const record = loginAttempts.get(email);
  if (!record) return { blocked: false };
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const remainingMin = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return { blocked: true, remainingMin };
  }
  if (record.lockedUntil && Date.now() >= record.lockedUntil) loginAttempts.delete(email);
  return { blocked: false };
};

const recordFailedAttempt = (email) => {
  const record = loginAttempts.get(email) || { count: 0, lockedUntil: null };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCK_DURATION_MS;
    console.warn(`🔒 Admin login locked: ${email} after ${MAX_ATTEMPTS} failed attempts`);
  }
  loginAttempts.set(email, record);
};

const clearAttempts = (email) => loginAttempts.delete(email);

// ── @desc    Login admin
// ── @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { blocked, remainingMin } = checkRateLimit(normalizedEmail);
    if (blocked) {
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Try again in ${remainingMin} minute${remainingMin > 1 ? 's' : ''}.`,
      });
    }

    // Must select +tokenVersion here so we can embed it in the JWT
    const user = await User.findOne({ email: normalizedEmail }).select('+password +tokenVersion');

    if (!user || !(await user.comparePassword(password))) {
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      console.warn(`⚠️  Login attempt — deactivated account: ${normalizedEmail}`);
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.',
      });
    }

    clearAttempts(normalizedEmail);

    const token = generateToken(user._id, user.tokenVersion ?? 0);
    console.log(`✅ Admin logged in: ${user.email} (${user.role})`);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    next(error);
  }
};

// ── @desc    Get current admin user
// ── @route   GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// ── @desc    Logout — invalidates ALL sessions for this admin
// ── @route   POST /api/auth/logout
// ── @desc    Logout — invalidates ALL sessions for this admin
// ── @route   POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    // ✅ FIX: select('+tokenVersion') already done in protect middleware
    // but findById se fresh fetch karo taaki stale data na ho
    const user = await User.findById(req.user._id).select('+tokenVersion');

    // ✅ FIX: null check — agar user delete ho chuka ho
    if (!user) {
      return res.json({ success: true, message: 'Logged out successfully' });
    }

    await user.invalidateSessions();
    console.log(`✅ Admin logged out + all sessions invalidated: ${user.email}`);
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Register first admin (one-time setup)
// ── @route   POST /api/auth/setup
export const setupAdmin = async (req, res, next) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      return res.status(403).json({
        success: false,
        message: 'Setup already completed. An admin account already exists.',
      });
    }

    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const admin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'superadmin',
      tokenVersion: 0,
    });

    const token = generateToken(admin._id, 0);
    console.log(`✅ First superadmin created: ${admin.email}`);

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        token,
        user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Change admin password — invalidates ALL other sessions
// ── @route   PATCH /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required' });
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must differ from current password' });
    }

    const user = await User.findById(req.user._id).select('+password +tokenVersion');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Rotate tokenVersion → all other sessions become invalid immediately
    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    // Issue fresh token for this browser so current session stays logged in
    const newToken = generateToken(user._id, user.tokenVersion);

    console.log(`✅ Password changed + sessions rotated: ${user.email}`);
    return res.json({
      success: true,
      message: 'Password updated. All other sessions have been logged out.',
      data: { token: newToken },
    });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Create additional admin/staff (superadmin only)
// ── @route   POST /api/auth/create-admin
export const createAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      console.warn(`⚠️  ${req.user.email} attempted to create admin (role: ${req.user.role})`);
      return res.status(403).json({ success: false, message: 'Only superadmin can create new admins' });
    }

    const { name, email, password, role } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const ALLOWED_ROLES = ['admin', 'superadmin'];
    const assignedRole = ALLOWED_ROLES.includes(role) ? role : 'admin';

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const newAdmin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      tokenVersion: 0,
    });

    console.log(`✅ New admin created: ${newAdmin.email} (role: ${newAdmin.role}) by ${req.user.email}`);

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        user: {
          id: newAdmin._id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
          isActive: newAdmin.isActive,
        },
      },
    });
  } catch (error) {
    console.error('Create admin error:', error.message);
    next(error);
  }
};

// ── @desc    Forgot password
// ── @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    console.log(`\n➡️ [API HIT] Forgot Password request received for: ${email}`);

    const genericResponse = {
      success: true,
      message: 'If an account exists with this email, an OTP has been sent.',
    };

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log(`⚠️ [DEBUG] User not found for email: ${email}. Silently returning success for security.`);
      return res.status(200).json(genericResponse);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetData = otp;

    console.log(`\n🚨 [DEBUG] Forgot Password requested for ${email}. OTP is: ${otp}\n`);

    try {
      await sendPasswordResetEmail(user.email, resetData, user.name);
      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Email send error:', emailError.message);
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: 'Failed to send reset email. Please try again.' });
    }

    return res.json(genericResponse);
  } catch (error) {
    next(error);
  }
};

// ── @desc    Reset password via token — also invalidates all sessions
// ── @route   POST /api/auth/reset-password/:token
export const resetPassword = async (req, res, next) => {
  try {
    const otp = req.body.otp || req.params.token;
    const { newPassword, confirmPassword } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Both password fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    }).select('+resetToken +resetTokenExpiry +tokenVersion');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please request a new one.' });
    }

    // Rotate tokenVersion → all existing sessions invalidated
    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    console.log(`✅ Password reset + sessions invalidated: ${user.email}`);

    return res.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};