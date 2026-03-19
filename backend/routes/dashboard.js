const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/dashboardController');
const { adminMiddleware } = require('../middleware/auth');

router.get('/summary',              adminMiddleware, ctrl.getSummary);
router.get('/revenue/monthly',      adminMiddleware, ctrl.getMonthlyRevenue);
router.get('/revenue/by-room-type', adminMiddleware, ctrl.getRevenueByRoomType);
router.get('/bookings/recent',      adminMiddleware, ctrl.getRecentBookings);
router.get('/orders/recent',        adminMiddleware, ctrl.getRecentOrders);
router.get('/occupancy/today',      adminMiddleware, ctrl.getTodayOccupancy);
router.get('/checkins/today',       adminMiddleware, ctrl.getTodayCheckIns);

module.exports = router;
