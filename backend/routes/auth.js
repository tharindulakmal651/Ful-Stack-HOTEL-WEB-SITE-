const express  = require('express');
const router   = express.Router();
const { body } = require('express-validator');
const ctrl     = require('../controllers/authController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

// ── Guest Register (role = guest) ────────────────────────────
router.post('/register',
  [ body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().trim() ],
  validate,
  ctrl.register
);

// ── Login (guest + admin) ─────────────────────────────────────
router.post('/login',
  [ body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required') ],
  validate,
  ctrl.login
);

// ── Admin Register ────────────────────────────────────────────
// Authorised by: existing admin JWT  OR  ADMIN_SETUP_KEY in .env
router.post('/register-admin',
  optionalAuth,                         // attach req.user if token present
  [ body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Admin password must be at least 8 characters'),
    body('phone').optional().trim(),
    body('setupKey').optional().trim() ],
  validate,
  ctrl.registerAdmin
);

// ── List all admins (admin only) ──────────────────────────────
router.get('/admins', authMiddleware, ctrl.listAdmins);

// ── Current user ──────────────────────────────────────────────
router.get('/me', authMiddleware, ctrl.getMe);

// ── Update own profile ────────────────────────────────────────
router.put('/profile',
  authMiddleware,
  [ body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim() ],
  validate,
  ctrl.updateProfile
);

// ── Change own password ───────────────────────────────────────
router.put('/change-password',
  authMiddleware,
  [ body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters') ],
  validate,
  ctrl.changePassword
);

module.exports = router;
