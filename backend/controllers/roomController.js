const db = require('../config/db');

// ── helper: parse amenities JSON safely ──────────────────────
const parseRoom = (room) => ({
  ...room,
  amenities: room.amenities
    ? (typeof room.amenities === 'string' ? JSON.parse(room.amenities) : room.amenities)
    : []
});

// ── GET /api/rooms  (public, with filters + pagination) ──────
const getAllRooms = async (req, res) => {
  try {
    const {
      check_in, check_out,
      type, min_price, max_price, guests,
      page = 1, limit = 20
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let q      = 'SELECT * FROM rooms WHERE is_available = TRUE';
    const params = [];

    if (type)      { q += ' AND room_type = ?';        params.push(type); }
    if (min_price) { q += ' AND price_per_night >= ?'; params.push(parseFloat(min_price)); }
    if (max_price) { q += ' AND price_per_night <= ?'; params.push(parseFloat(max_price)); }
    if (guests)    { q += ' AND max_guests >= ?';      params.push(parseInt(guests)); }

    if (check_in && check_out) {
      q += ` AND id NOT IN (
               SELECT room_id FROM bookings
               WHERE status NOT IN ('cancelled')
               AND check_in < ? AND check_out > ?
             )`;
      params.push(check_out, check_in);
    }

    // total count
    const countQ        = q.replace('SELECT *', 'SELECT COUNT(*) AS total');
    const [countRows]   = await db.query(countQ, params);
    const total         = countRows[0].total;

    q += ' ORDER BY price_per_night ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rooms] = await db.query(q, params);

    res.json({
      data: rooms.map(parseRoom),
      pagination: {
        total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('[RoomController.getAllRooms]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ── GET /api/rooms/all  (admin – includes unavailable) ───────
const getAllRoomsAdmin = async (req, res) => {
  try {
    const [rooms] = await db.query(
      'SELECT * FROM rooms ORDER BY room_number ASC'
    );
    res.json(rooms.map(parseRoom));
  } catch (err) {
    console.error('[RoomController.getAllRoomsAdmin]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/rooms/types  ────────────────────────────────────
const getRoomTypes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        room_type,
        COUNT(*)           AS total,
        SUM(is_available)  AS available,
        MIN(price_per_night) AS min_price,
        MAX(price_per_night) AS max_price
      FROM rooms
      GROUP BY room_type
      ORDER BY min_price ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('[RoomController.getRoomTypes]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/rooms/:id  ──────────────────────────────────────
const getRoomById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM rooms WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Room not found.' });

    res.json(parseRoom(rows[0]));
  } catch (err) {
    console.error('[RoomController.getRoomById]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── POST /api/rooms  (admin) ─────────────────────────────────
const createRoom = async (req, res) => {
  try {
    const {
      room_number, room_type, view_type,
      price_per_night, max_guests,
      description, amenities, image_url
    } = req.body;

    // Prevent duplicate room numbers
    const [dup] = await db.query(
      'SELECT id FROM rooms WHERE room_number = ?', [room_number]
    );
    if (dup.length)
      return res.status(409).json({ message: `Room number ${room_number} already exists.` });

    const [result] = await db.query(
      `INSERT INTO rooms
         (room_number, room_type, view_type, price_per_night,
          max_guests, description, amenities, image_url)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        room_number, room_type, view_type || null,
        price_per_night, max_guests || 2,
        description || null,
        JSON.stringify(amenities || []),
        image_url || null
      ]
    );

    res.status(201).json({
      message: 'Room created successfully.',
      id: result.insertId
    });
  } catch (err) {
    console.error('[RoomController.createRoom]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ── PUT /api/rooms/:id  (admin) ──────────────────────────────
const updateRoom = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM rooms WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Room not found.' });

    const r = rows[0];
    const {
      room_type, view_type, price_per_night,
      max_guests, description, amenities,
      image_url, is_available
    } = req.body;

    await db.query(
      `UPDATE rooms SET
         room_type       = ?,
         view_type       = ?,
         price_per_night = ?,
         max_guests      = ?,
         description     = ?,
         amenities       = ?,
         image_url       = ?,
         is_available    = ?
       WHERE id = ?`,
      [
        room_type    ?? r.room_type,
        view_type    ?? r.view_type,
        price_per_night ?? r.price_per_night,
        max_guests   ?? r.max_guests,
        description  ?? r.description,
        amenities    ? JSON.stringify(amenities) : r.amenities,
        image_url    ?? r.image_url,
        is_available !== undefined ? is_available : r.is_available,
        req.params.id
      ]
    );

    res.json({ message: 'Room updated successfully.' });
  } catch (err) {
    console.error('[RoomController.updateRoom]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PATCH /api/rooms/:id/availability  (admin) ───────────────
const toggleAvailability = async (req, res) => {
  try {
    const { is_available } = req.body;
    await db.query(
      'UPDATE rooms SET is_available = ? WHERE id = ?',
      [is_available, req.params.id]
    );
    res.json({
      message: `Room marked as ${is_available ? 'available' : 'unavailable'}.`
    });
  } catch (err) {
    console.error('[RoomController.toggleAvailability]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── DELETE /api/rooms/:id  (admin) ───────────────────────────
const deleteRoom = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id FROM rooms WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Room not found.' });

    // Block deletion if active bookings exist
    const [active] = await db.query(
      "SELECT id FROM bookings WHERE room_id = ? AND status IN ('pending','confirmed')",
      [req.params.id]
    );
    if (active.length)
      return res.status(409).json({
        message: 'Cannot delete a room that has active bookings. Cancel bookings first.'
      });

    await db.query('DELETE FROM rooms WHERE id = ?', [req.params.id]);
    res.json({ message: 'Room deleted successfully.' });
  } catch (err) {
    console.error('[RoomController.deleteRoom]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getAllRooms,
  getAllRoomsAdmin,
  getRoomTypes,
  getRoomById,
  createRoom,
  updateRoom,
  toggleAvailability,
  deleteRoom
};
