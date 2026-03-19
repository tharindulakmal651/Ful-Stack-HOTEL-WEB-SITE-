const express  = require('express');
const router   = express.Router();
const { body, param } = require('express-validator');
const ctrl     = require('../controllers/packageController');
const { adminMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/',    ctrl.getAllPackages);
router.get('/all', adminMiddleware, ctrl.getAllPackagesAdmin);
router.get('/:id', [param('id').isInt()], validate, ctrl.getPackageById);

router.post('/',
  adminMiddleware,
  [ body('name').trim().notEmpty().withMessage('Name is required'),
    body('type').isIn(['day-out','wedding','honeymoon']).withMessage('Invalid type'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('includes').optional().isArray() ],
  validate,
  ctrl.createPackage
);

router.put('/:id',
  adminMiddleware,
  [ param('id').isInt(),
    body('price').optional().isFloat({ min: 0 }),
    body('type').optional().isIn(['day-out','wedding','honeymoon']) ],
  validate,
  ctrl.updatePackage
);

router.patch('/:id/toggle', adminMiddleware, [param('id').isInt()], validate, ctrl.togglePackage);
router.delete('/:id',       adminMiddleware, [param('id').isInt()], validate, ctrl.deletePackage);

module.exports = router;
