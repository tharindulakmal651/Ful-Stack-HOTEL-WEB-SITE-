const express  = require('express');
const router   = express.Router();
const { body, param } = require('express-validator');
const ctrl     = require('../controllers/staffController');
const { adminMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/',             ctrl.getAllStaff);
router.get('/departments',  ctrl.getDepartments);
router.get('/:id',          [param('id').isInt()], validate, ctrl.getStaffById);

router.post('/',
  adminMiddleware,
  [ body('name').trim().notEmpty().withMessage('Name is required'),
    body('position').trim().notEmpty().withMessage('Position is required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('bio').optional().trim().isLength({ max: 500 }) ],
  validate,
  ctrl.createStaff
);

router.put('/:id',    adminMiddleware, [param('id').isInt()], validate, ctrl.updateStaff);
router.delete('/:id', adminMiddleware, [param('id').isInt()], validate, ctrl.deleteStaff);

module.exports = router;
