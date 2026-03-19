const db = require('../config/db');

const EXTRAS_COST = { none: 0, breakfast: 40, lunch_dinner: 87 };

// ── POST /api/bookings ───────────────────────────────────────
const createBooking = async (req, res) => {
  try {
    const {
      room_id, check_in, check_out,
      guests = 1, extras = 'none',
      special_requests = ''
    } = req.body;

    // Date validations
    const checkInDate  = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const today        = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today)
      return res.status(400).json({ message: 'Check-in date cannot be in the past.' });
    if (checkOutDate <= checkInDate)
      return res.status(400).json({ message: 'Check-out must be after check-in.' });

    const nights = Math.ceil((checkOutDate - checkInDate) / 86400000);

    // Verify room exists and is available
    const [roomRows] = await db.query(
      'SELECT * FROM rooms WHERE id = ? AND is_available = TRUE', [room_id]
    );
    if (!roomRows.length)
      return res.status(404).json({ message: 'Room not found or currently unavailable.' });

    const room = roomRows[0];

    if (parseInt(guests) > room.max_guests)
      return res.status(400).json({
        message: `This room accommodates a maximum of ${room.max_guests} guests.`
      });

    // Check for booking conflicts on the same room
    const [conflicts] = await db.query(
      `SELECT id FROM bookings
       WHERE room_id = ?
         AND status NOT IN ('cancelled')
         AND check_in < ? AND check_out > ?`,
      [room_id, check_out, check_in]
    );
    if (conflicts.length)
      return res.status(409).json({
        message: 'This room is already booked for the selected dates. Please choose different dates.'
      });

    // Calculate total price
    const extraCost   = (EXTRAS_COST[extras] || 0) * nights;
    const total_price = parseFloat((room.price_per_night * nights + extraCost).toFixed(2));

    const [result] = await db.query(
      `INSERT INTO bookings
         (user_id, room_id, check_in, check_out, guests, extras, total_price, special_requests)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        req.user.id, room_id, check_in, check_out,
        guests, extras, total_price,
        special_requests || null
      ]
    );

    res.status(201).json({
      message: 'Booking confirmed successfully.',
      id:          result.insertId,
      total_price,
      nights
    });
  } catch (err) {
    console.error('[BookingController.createBooking]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ── GET /api/bookings/my ─────────────────────────────────────
const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let q      = `SELECT b.*, r.room_number, r.room_type, r.view_type,
                         r.price_per_night, r.image_url
                  FROM bookings b
                  JOIN rooms r ON b.room_id = r.id
                  WHERE b.user_id = ?`;
    const params = [req.user.id];

    if (status) { q += ' AND b.status = ?'; params.push(status); }

    // count
    const cntQ    = q.replace(/SELECT b\.\*.*?WHERE/s, 'SELECT COUNT(*) AS total FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE');
    const [cnt]   = await db.query(cntQ, params);

    q += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.query(q, params);

    res.json({
      data: rows,
      pagination: { total: cnt[0].total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) {
    console.error('[BookingController.getMyBookings]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/bookings/my/summary ─────────────────────────────
const getMyBookingSummary = async (req, res) => {
  try {
    const [[row]] = await db.query(
      `SELECT
         COUNT(*)                                                          AS total_bookings,
         SUM(status = 'confirmed')                                         AS confirmed,
         SUM(status = 'pending')                                           AS pending,
         SUM(status = 'cancelled')                                         AS cancelled,
         SUM(status = 'completed')                                         AS completed,
         COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price END), 0) AS total_spent
       FROM bookings
       WHERE user_id = ?`,
      [req.user.id]
    );
    res.json(row);
  } catch (err) {
    console.error('[BookingController.getMyBookingSummary]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/bookings  (admin) ───────────────────────────────
const getAllBookings = async (req, res) => {
  try {
    const {
      status, room_type,
      check_in_from, check_in_to,
      search, page = 1, limit = 50
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let q = `SELECT b.*, u.name AS guest_name, u.email AS guest_email,
                    u.phone AS guest_phone,
                    r.room_number, r.room_type, r.view_type
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN rooms r ON b.room_id = r.id
             WHERE 1=1`;
    const params = [];

    if (status)        { q += ' AND b.status = ?';      params.push(status); }
    if (room_type)     { q += ' AND r.room_type = ?';   params.push(room_type); }
    if (check_in_from) { q += ' AND b.check_in >= ?';   params.push(check_in_from); }
    if (check_in_to)   { q += ' AND b.check_in <= ?';   params.push(check_in_to); }
    if (search) {
      q += ' AND (u.name LIKE ? OR u.email LIKE ? OR r.room_number LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const [cnt] = await db.query(
      q.replace(
        /SELECT b\.\*.*?WHERE 1=1/s,
        'SELECT COUNT(*) AS total FROM bookings b JOIN users u ON b.user_id = u.id JOIN rooms r ON b.room_id = r.id WHERE 1=1'
      ),
      params
    );

    q += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.query(q, params);

    res.json({
      data: rows,
      pagination: {
        total: cnt[0].total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(cnt[0].total / limit)
      }
    });
  } catch (err) {
    console.error('[BookingController.getAllBookings]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/bookings/:id ────────────────────────────────────
const getBookingById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, u.name AS guest_name, u.email AS guest_email,
              r.room_number, r.room_type, r.view_type, r.price_per_night
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN rooms r ON b.room_id = r.id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Booking not found.' });

    const booking = rows[0];
    // guests can only see their own; admins see all
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id)
      return res.status(403).json({ message: 'Access denied.' });

    res.json(booking);
  } catch (err) {
    console.error('[BookingController.getBookingById]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PUT /api/bookings/:id  (admin) ───────────────────────────
const updateBooking = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM bookings WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Booking not found.' });

    const { status, special_requests, check_in, check_out } = req.body;

    await db.query(
      `UPDATE bookings SET
         status           = COALESCE(?, status),
         special_requests = COALESCE(?, special_requests),
         check_in         = COALESCE(?, check_in),
         check_out        = COALESCE(?, check_out)
       WHERE id = ?`,
      [
        status           || null,
        special_requests || null,
        check_in         || null,
        check_out        || null,
        req.params.id
      ]
    );

    res.json({ message: 'Booking updated successfully.' });
  } catch (err) {
    console.error('[BookingController.updateBooking]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── DELETE /api/bookings/:id  (cancel) ───────────────────────
const cancelBooking = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM bookings WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Booking not found.' });

    const booking = rows[0];

    // Guests can only cancel their own
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id)
      return res.status(403).json({ message: 'You can only cancel your own bookings.' });

    if (booking.status === 'cancelled')
      return res.status(400).json({ message: 'This booking is already cancelled.' });

    if (booking.status === 'completed')
      return res.status(400).json({ message: 'Completed bookings cannot be cancelled.' });

    // Guests cannot cancel within 24 hours of check-in
    if (req.user.role !== 'admin') {
      const hoursUntilCheckIn = (new Date(booking.check_in) - new Date()) / 3600000;
      if (hoursUntilCheckIn < 24)
        return res.status(400).json({
          message: 'Bookings cannot be cancelled within 24 hours of check-in. Please call the front desk.'
        });
    }

    await db.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      [req.params.id]
    );

    res.json({ message: 'Booking cancelled successfully.' });
  } catch (err) {
    console.error('[BookingController.cancelBooking]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getMyBookingSummary,
  getAllBookings,
  getBookingById,
  updateBooking,
  cancelBooking
};
