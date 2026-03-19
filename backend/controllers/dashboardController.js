const db = require('../config/db');

// ── GET /api/dashboard/summary ───────────────────────────────
const getSummary = async (req, res) => {
  try {
    const [[bookingStats]] = await db.query(`
      SELECT
        COUNT(*)                                                             AS total_bookings,
        SUM(status = 'pending')                                              AS pending_bookings,
        SUM(status = 'confirmed')                                            AS confirmed_bookings,
        SUM(status = 'completed')                                            AS completed_bookings,
        SUM(status = 'cancelled')                                            AS cancelled_bookings,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price END), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() AND status != 'cancelled'
                          THEN total_price END), 0)                          AS today_revenue,
        SUM(DATE(created_at) = CURDATE())                                    AS bookings_today,
        SUM(DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY))        AS bookings_this_week
      FROM bookings
    `);

    const [[orderStats]] = await db.query(`
      SELECT
        COUNT(*)                          AS total_orders,
        SUM(status = 'pending')           AS pending_orders,
        SUM(status = 'preparing')         AS preparing_orders,
        SUM(status = 'delivered')         AS delivered_orders,
        COALESCE(SUM(total_amount), 0)    AS total_order_revenue,
        SUM(DATE(created_at) = CURDATE()) AS orders_today
      FROM food_orders
    `);

    const [[userStats]] = await db.query(`
      SELECT
        COUNT(*)                                                           AS total_users,
        SUM(role = 'guest')                                                AS guests,
        SUM(role = 'admin')                                                AS admins,
        SUM(DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY))     AS new_this_week
      FROM users
    `);

    const [[roomStats]] = await db.query(`
      SELECT
        COUNT(*)           AS total_rooms,
        SUM(is_available)  AS available_rooms,
        SUM(!is_available) AS occupied_rooms
      FROM rooms
    `);

    const [[msgStats]] = await db.query(`
      SELECT
        COUNT(*)         AS total_messages,
        SUM(!is_read)    AS unread_messages
      FROM contact_messages
    `);

    res.json({
      bookings: bookingStats,
      orders:   orderStats,
      users:    userStats,
      rooms:    roomStats,
      messages: msgStats
    });
  } catch (err) {
    console.error('[DashboardController.getSummary]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/dashboard/revenue/monthly ───────────────────────
const getMonthlyRevenue = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [rows] = await db.query(`
      SELECT
        MONTH(created_at)        AS month,
        MONTHNAME(created_at)    AS month_name,
        COUNT(*)                 AS bookings,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price END), 0) AS revenue
      FROM bookings
      WHERE YEAR(created_at) = ?
      GROUP BY MONTH(created_at), MONTHNAME(created_at)
      ORDER BY MONTH(created_at) ASC
    `, [year]);
    res.json(rows);
  } catch (err) {
    console.error('[DashboardController.getMonthlyRevenue]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/dashboard/revenue/by-room-type ──────────────────
const getRevenueByRoomType = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        r.room_type,
        COUNT(b.id)  AS total_bookings,
        COALESCE(SUM(CASE WHEN b.status != 'cancelled' THEN b.total_price END), 0) AS revenue
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id
      GROUP BY r.room_type
      ORDER BY revenue DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('[DashboardController.getRevenueByRoomType]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/dashboard/bookings/recent ───────────────────────
const getRecentBookings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query(`
      SELECT b.id, b.check_in, b.check_out, b.total_price, b.status, b.created_at,
             u.name AS guest_name, u.email AS guest_email,
             r.room_number, r.room_type
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC
      LIMIT ?
    `, [limit]);
    res.json(rows);
  } catch (err) {
    console.error('[DashboardController.getRecentBookings]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/dashboard/orders/recent ─────────────────────────
const getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query(
      'SELECT * FROM food_orders ORDER BY created_at DESC LIMIT ?', [limit]
    );
    res.json(rows.map(o => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
    })));
  } catch (err) {
    console.error('[DashboardController.getRecentOrders]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/dashboard/occupancy/today ───────────────────────
const getTodayOccupancy = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await db.query(`
      SELECT
        r.room_number, r.room_type, r.view_type, r.price_per_night,
        b.id AS booking_id, b.check_in, b.check_out, b.status,
        u.name AS guest_name
      FROM rooms r
      LEFT JOIN bookings b
        ON r.id = b.room_id
       AND b.check_in <= ? AND b.check_out > ?
       AND b.status IN ('confirmed','pending')
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY r.room_number ASC
    `, [today, today]);
    res.json(rows);
  } catch (err) {
    console.error('[DashboardController.getTodayOccupancy]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/dashboard/checkins/today ────────────────────────
const getTodayCheckIns = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [checkins] = await db.query(`
      SELECT b.*, u.name AS guest_name, u.email AS guest_email,
             u.phone AS guest_phone, r.room_number, r.room_type, r.view_type
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      WHERE b.check_in = ? AND b.status IN ('confirmed','pending')
      ORDER BY b.created_at ASC
    `, [today]);

    const [checkouts] = await db.query(`
      SELECT b.*, u.name AS guest_name, r.room_number, r.room_type
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      WHERE b.check_out = ? AND b.status = 'confirmed'
      ORDER BY b.created_at ASC
    `, [today]);

    res.json({ checkins, checkouts });
  } catch (err) {
    console.error('[DashboardController.getTodayCheckIns]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getSummary,
  getMonthlyRevenue,
  getRevenueByRoomType,
  getRecentBookings,
  getRecentOrders,
  getTodayOccupancy,
  getTodayCheckIns
};
