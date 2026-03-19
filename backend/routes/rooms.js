const express  = require('express');
const router   = express.Router();
const { body, param } = require('express-validator');
const ctrl     = require('../controllers/roomController');
const { adminMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/',      ctrl.getAllRooms);
router.get('/types', ctrl.getRoomTypes);
router.get('/all',   adminMiddleware, ctrl.getAllRoomsAdmin);
router.get('/:id',   [param('id').isInt()], validate, ctrl.getRoomById);

router.post('/',
  adminMiddleware,
  [ body('room_number').trim().notEmpty().withMessage('Room number is required'),
    body('room_type').isIn(['Standard','Deluxe','Premier','Suite']).withMessage('Invalid room type'),
    body('price_per_night').isFloat({ min: 1 }).withMessage('Price must be positive'),
    body('max_guests').optional().isInt({ min: 1 }),
    body('amenities').optional().isArray() ],
  validate,
  ctrl.createRoom
);

router.put('/:id',
  adminMiddleware,
  [ param('id').isInt(),
    body('price_per_night').optional().isFloat({ min: 1 }),
    body('room_type').optional().isIn(['Standard','Deluxe','Premier','Suite']) ],
  validate,
  ctrl.updateRoom
);

router.patch('/:id/availability',
  adminMiddleware,
  [ param('id').isInt(), body('is_available').isBoolean() ],
  validate,
  ctrl.toggleAvailability
);

router.delete('/:id',
  adminMiddleware,
  [param('id').isInt()],
  validate,
  ctrl.deleteRoom
);

module.exports = router;
