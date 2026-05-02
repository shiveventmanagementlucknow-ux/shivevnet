import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ClientUser } from '../models/index.js';
import { sendWelcomeEmail, sendPasswordResetEmail, sendAccountVerificationEmail } from '../services/emailService.js';

// In-memory store for pending registrations. For production, use Redis.
const pendingRegistrations = new Map();
const PENDING_REGISTRATION_TTL = 15 * 60 * 1000; // 15 minutes

const generateToken = (id) => {
    return jwt.sign({ id, type: 'user' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
};

// @desc    Register new user
// @route   POST /api/users/register
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, phone, city } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await ClientUser.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + PENDING_REGISTRATION_TTL;

        // Store pending registration data
        pendingRegistrations.set(normalizedEmail, {
            userData: { name, email: normalizedEmail, password, phone, city },
            otp,
            expiry,
        });

        // Auto-delete from map after TTL
        setTimeout(() => {
            if (pendingRegistrations.get(normalizedEmail)?.otp === otp) {
                pendingRegistrations.delete(normalizedEmail);
                console.log(`Cleared expired pending registration for: ${normalizedEmail}`);
            }
        }, PENDING_REGISTRATION_TTL);

        await sendAccountVerificationEmail(normalizedEmail, otp, name);

        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email. Please check your inbox.',
            data: { email: normalizedEmail }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify user email with OTP and create account
// @route   POST /api/users/verify
export const verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        const pending = pendingRegistrations.get(normalizedEmail);

        if (!pending || pending.expiry < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please try registering again.' });
        }

        if (pending.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Incorrect OTP.' });
        }

        // OTP is correct, prevent double-click race conditions by removing immediately
        const { userData } = pending;
        pendingRegistrations.delete(normalizedEmail);

        const user = await ClientUser.create(userData);
        const token = generateToken(user._id);

        sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err.message));

        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            data: {
                token,
                user: { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, avatar: user.avatar }
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/users/login
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await ClientUser.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, avatar: user.avatar }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user profile
// @route   GET /api/users/me
export const getUserProfile = async (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.clientUser._id,
            name: req.clientUser.name,
            email: req.clientUser.email,
            phone: req.clientUser.phone,
            city: req.clientUser.city,
            avatar: req.clientUser.avatar,
            createdAt: req.clientUser.createdAt,
        }
    });
};

// @desc    Update user profile
// @route   PUT /api/users/me
export const updateUserProfile = async (req, res, next) => {
    try {
        const { name, phone, city, avatar } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (phone !== undefined) updates.phone = phone;
        if (city !== undefined) updates.city = city;
        if (avatar !== undefined) updates.avatar = avatar;

        const user = await ClientUser.findByIdAndUpdate(req.clientUser._id, updates, { new: true, runValidators: true });

        res.json({
            success: true,
            message: 'Profile updated',
            data: {
                id: user._id, name: user.name, email: user.email,
                phone: user.phone, city: user.city, avatar: user.avatar,
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Change user password
// @route   PATCH /api/users/change-password
export const changeUserPassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await ClientUser.findById(req.clientUser._id).select('+password');
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot user password
// @route   POST /api/users/forgot-password
export const forgotUserPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await ClientUser.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            // Silently return success to prevent email enumeration
            return res.status(200).json({ success: true, message: 'If an account exists, a reset link has been sent.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetToken = crypto.createHash('sha256').update(otp).digest('hex');
        user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();

        try {
            // Pass 'user' type to customize email content
            await sendPasswordResetEmail(user.email, otp, user.name, 'user');
            return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
        } catch (emailError) {
            console.error('Email send error:', emailError.message);
            user.resetToken = undefined;
            user.resetTokenExpiry = undefined;
            await user.save();
            return res.status(500).json({ success: false, message: 'Failed to send reset email. Please try again.' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Reset user password
// @route   POST /api/users/reset-password/:token
export const resetUserPassword = async (req, res, next) => {
    try {
        const otp = req.body.otp || req.params.token;
        const { newPassword, confirmPassword } = req.body;

        if (!otp || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Reset token/OTP and both passwords are required' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');
        const user = await ClientUser.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: new Date() }
        }).select('+resetToken +resetTokenExpiry');

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset link/OTP.' });
        }

        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        return res.json({ success: true, message: 'Password reset successfully. You can now login.' });
    } catch (error) {
        next(error);
    }
};

// ==================== ADMIN ENDPOINTS ====================

// @desc    Get all users (admin)
// @route   GET /api/users/admin/all
export const getAllUsersAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search } = req.query; // Default to page 1, limit 20
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
            ];
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Run count and find queries in parallel for better performance
        const [total, users] = await Promise.all([
            ClientUser.countDocuments(query),
            ClientUser.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        ]);

        res.json({
            success: true,
            data: users,
            pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum), limit: limitNum },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user stats (admin)
// @route   GET /api/users/admin/stats
export const getUserStatsAdmin = async (req, res, next) => {
    try {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        // Use a single aggregation pipeline to get all stats in one DB call
        const statsResult = await ClientUser.aggregate([
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    active: [{ $match: { isActive: true } }, { $count: 'count' }],
                    thisMonth: [{ $match: { createdAt: { $gte: startOfMonth } } }, { $count: 'count' }],
                    thisWeek: [{ $match: { createdAt: { $gte: oneWeekAgo } } }, { $count: 'count' }],
                },
            },
            {
                $project: {
                    total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
                    active: { $ifNull: [{ $arrayElemAt: ['$active.count', 0] }, 0] },
                    thisMonth: { $ifNull: [{ $arrayElemAt: ['$thisMonth.count', 0] }, 0] },
                    thisWeek: { $ifNull: [{ $arrayElemAt: ['$thisWeek.count', 0] }, 0] },
                },
            },
        ]);

        res.json({
            success: true,
            data: statsResult[0] || { total: 0, active: 0, thisMonth: 0, thisWeek: 0 },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user (admin)
// @route   GET /api/users/admin/:id
export const getUserAdmin = async (req, res, next) => {
    try {
        const user = await ClientUser.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle user active status (admin)
// @route   PATCH /api/users/admin/:id/toggle
export const toggleUserAdmin = async (req, res, next) => {
    try {
        const user = await ClientUser.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.isActive = !user.isActive;
        await user.save();
        res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/admin/:id
export const deleteUserAdmin = async (req, res, next) => {
    try {
        const user = await ClientUser.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        next(error);
    }
};
