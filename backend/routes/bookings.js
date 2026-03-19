const express  = require('express');
const router   = express.Router();
const { body, param } = require('express-validator');
const ctrl     = require('../controllers/bookingController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Guest routes
router.post('/',
  authMiddleware,
  [ body('room_id').isInt({ min: 1 }).withMessage('Valid room_id required'),
    body('check_in').isDate().withMessage('Valid check_in date required (YYYY-MM-DD)'),
    body('check_out').isDate().withMessage('Valid check_out date required (YYYY-MM-DD)'),
    body('guests').optional().isInt({ min: 1, max: 10 }),
    body('extras').optional().isIn(['none','breakfast','lunch_dinner']),
    body('special_requests').optional().trim().isLength({ max: 500 }) ],
  validate,
  ctrl.createBooking
);

router.get('/my',         authMiddleware, ctrl.getMyBookings);
router.get('/my/summary', authMiddleware, ctrl.getMyBookingSummary);
router.get('/:id',        authMiddleware, [param('id').isInt()], validate, ctrl.getBookingById);
router.delete('/:id',     authMiddleware, [param('id').isInt()], validate, ctrl.cancelBooking);

// Admin routes
router.get('/', adminMiddleware, ctrl.getAllBookings);

router.put('/:id',
  adminMiddleware,
  [ param('id').isInt(),
    body('status').optional().isIn(['pending','confirmed','cancelled','completed']) ],
  validate,
  ctrl.updateBooking
);

module.exports = router;
