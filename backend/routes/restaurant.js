const express  = require('express');
const router   = express.Router();
const { body, param } = require('express-validator');
const ctrl     = require('../controllers/restaurantController');
const { authMiddleware, adminMiddleware, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

// ── Menu ─────────────────────────────────────────────────────
router.get('/menu',        ctrl.getMenu);
router.get('/menu/all',    adminMiddleware, ctrl.getMenuAdmin);
router.get('/menu/:id',    [param('id').isInt()], validate, ctrl.getMenuItemById);

router.post('/menu',
  adminMiddleware,
  [ body('name').trim().notEmpty().withMessage('Name is required'),
    body('category').isIn(['breakfast','lunch','dinner','beverage','dessert']).withMessage('Invalid category'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('is_vegetarian').optional().isBoolean() ],
  validate,
  ctrl.createMenuItem
);

router.put('/menu/:id',
  adminMiddleware,
  [ param('id').isInt(),
    body('price').optional().isFloat({ min: 0 }),
    body('category').optional().isIn(['breakfast','lunch','dinner','beverage','dessert']) ],
  validate,
  ctrl.updateMenuItem
);

router.delete('/menu/:id', adminMiddleware, [param('id').isInt()], validate, ctrl.deleteMenuItem);

// ── Offers ────────────────────────────────────────────────────
router.get('/offers',      ctrl.getOffers);
router.get('/offers/all',  adminMiddleware, ctrl.getOffersAdmin);

router.post('/offers',
  adminMiddleware,
  [ body('title').trim().notEmpty().withMessage('Title is required'),
    body('discount_percent').optional().isInt({ min: 0, max: 100 }),
    body('valid_from').optional().isDate(),
    body('valid_until').optional().isDate() ],
  validate,
  ctrl.createOffer
);

router.put('/offers/:id',    adminMiddleware, [param('id').isInt()], validate, ctrl.updateOffer);
router.delete('/offers/:id', adminMiddleware, [param('id').isInt()], validate, ctrl.deleteOffer);

// ── Orders ────────────────────────────────────────────────────
router.post('/orders',
  optionalAuth,
  [ body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('items.*.id').isInt().withMessage('Each item must have a valid id'),
    body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('delivery_type').optional().isIn(['room','restaurant']),
    body('special_instructions').optional().trim().isLength({ max: 400 }) ],
  validate,
  ctrl.createOrder
);

router.get('/orders/my', authMiddleware, ctrl.getMyOrders);
router.get('/orders',    adminMiddleware, ctrl.getAllOrders);

router.get('/orders/:id',
  authMiddleware,
  [param('id').isInt()], validate,
  ctrl.getOrderById
);

router.put('/orders/:id',
  adminMiddleware,
  [ param('id').isInt(),
    body('status').isIn(['pending','preparing','ready','delivered','cancelled']).withMessage('Invalid status') ],
  validate,
  ctrl.updateOrderStatus
);

router.delete('/orders/:id', adminMiddleware, [param('id').isInt()], validate, ctrl.deleteOrder);

module.exports = router;
