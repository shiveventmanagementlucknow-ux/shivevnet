import jwt from 'jsonwebtoken';
import { User, ClientUser } from '../models/index.js';

const extractToken = (req) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

// ── Admin / Staff middleware ──────────────────────────────────────────────────
export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req)

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    // Hard reject user-type tokens on admin routes
    if (decoded.type !== 'admin') {
      console.warn(`⚠️  Non-admin token (type: ${decoded.type}) on admin route — IP: ${req.ip}`);
      return res.status(401).json({ success: false, message: 'Access denied. Admin token required.' });
    }

    // Fetch user + tokenVersion to verify session is still valid
    const user = await User.findById(decoded.id).select('+tokenVersion');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Account not found. Please login again.' });
    }

    if (!user.isActive) {
      console.warn(`⚠️  Request from deactivated admin: ${user.email}`);
      return res.status(401).json({ success: false, message: 'Your account has been deactivated.' });
    }

    // ── tokenVersion check — prevents use of old tokens after logout/password change ──
    // If tokenVersion in DB doesn't match what's in the JWT, this session was invalidated
    const currentVersion = user.tokenVersion ?? 0;
    const tokenVersion = decoded.tokenVersion ?? 0;

    if (tokenVersion !== currentVersion) {
      console.warn(`⚠️  Stale token rejected for ${user.email} (token v${tokenVersion} vs DB v${currentVersion})`);
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    next(error);
  }
};

// ── Role guards ───────────────────────────────────────────────────────────────

export const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'superadmin') return next();
  console.warn(`⚠️  Unauthorized role access by ${req.user?.email} (role: ${req.user?.role})`);
  return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
};

export const superAdminOnly = (req, res, next) => {
  if (req.user?.role === 'superadmin') return next();
  console.warn(`⚠️  Superadmin-only route accessed by ${req.user?.email} (role: ${req.user?.role})`);
  return res.status(403).json({ success: false, message: 'Access denied. Superadmin privileges required.' });
};

// ── Client / Public user middleware ──────────────────────────────────────────
export const userProtect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. Please login.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    // Hard reject admin tokens on client routes
    if (decoded.type !== 'user') {
      return res.status(401).json({ success: false, message: 'Invalid token type.' });
    }

    const user = await ClientUser.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Account not found. Please login again.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated. Contact support.' });
    }

    req.clientUser = user;
    next();
  } catch (error) {
    console.error('User auth middleware error:', error.message);
    next(error);
  }
};