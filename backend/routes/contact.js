const express  = require('express');
const router   = express.Router();
const { body, param } = require('express-validator');
const ctrl     = require('../controllers/contactController');
const { adminMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/',
  [ body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().isLength({ min: 10, max: 2000 })
      .withMessage('Message must be 10–2000 characters'),
    body('phone').optional().trim() ],
  validate,
  ctrl.submitContact
);

router.get('/',              adminMiddleware, ctrl.getAllMessages);
router.patch('/:id/read',    adminMiddleware, ctrl.markAsRead);
router.delete('/:id',        adminMiddleware, ctrl.deleteMessage);

module.exports = router;
