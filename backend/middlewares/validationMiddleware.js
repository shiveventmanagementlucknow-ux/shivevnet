import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

export const bookingValidation = [
  body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian phone number'),
  body('email').isEmail().withMessage('Enter a valid email address'), // normalizeEmail() removed
  body('eventType').notEmpty().withMessage('Event type is required'),
  body('date').isISO8601().toDate().custom(val => {
    if (val <= new Date()) throw new Error('Event date must be in the future');
    return true;
  }),
  body('budget').optional({ values: 'falsy' }).isNumeric().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('message').optional({ values: 'falsy' }).isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  handleValidationErrors
];

export const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email'), // normalizeEmail() removed
  body('message').isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  handleValidationErrors
];

export const blogValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  handleValidationErrors
];

// ✅ FIX: normalizeEmail() removed — yeh email transform karke DB mismatch karata tha
export const loginValidation = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const userRegisterValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Enter a valid email'), // normalizeEmail() removed
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim(),
  body('city').optional().trim(),
  handleValidationErrors
];

export const userLoginValidation = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Enter a valid email'), // normalizeEmail() removed
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];