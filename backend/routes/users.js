const express  = require('express');
const router   = express.Router();
const { body, param } = require('express-validator');
const ctrl     = require('../controllers/userController');
const { adminMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/',       adminMiddleware, ctrl.getAllUsers);
router.get('/stats',  adminMiddleware, ctrl.getUserStats);
router.get('/:id',    adminMiddleware, [param('id').isInt()], validate, ctrl.getUserById);

router.put('/:id',
  adminMiddleware,
  [ param('id').isInt(),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['guest','admin']) ],
  validate,
  ctrl.updateUser
);

router.put('/:id/reset-password',
  adminMiddleware,
  [ param('id').isInt(),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters') ],
  validate,
  ctrl.resetUserPassword
);

router.delete('/:id', adminMiddleware, [param('id').isInt()], validate, ctrl.deleteUser);

module.exports = router;
