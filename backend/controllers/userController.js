const bcrypt = require('bcryptjs');
const db     = require('../config/db');

// ── GET /api/users  (admin) ───────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let q      = 'SELECT id, name, email, phone, role, created_at, last_login FROM users WHERE 1=1';
    const params = [];
    if (role)   { q += ' AND role = ?';  params.push(role); }
    if (search) {
      q += ' AND (name LIKE ? OR email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s);
    }

    const [cnt] = await db.query(
      q.replace('SELECT id, name, email, phone, role, created_at, last_login', 'SELECT COUNT(*) AS total'),
      params
    );

    q += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.query(q, params);

    res.json({
      data: rows,
      pagination: {
        total: cnt[0].total,
        page:  parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('[UserController.getAllUsers]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/users/stats  (admin) ─────────────────────────────
const getUserStats = async (req, res) => {
  try {
    const [[row]] = await db.query(`
      SELECT
        COUNT(*)                                                           AS total_users,
        SUM(role = 'guest')                                                AS guests,
        SUM(role = 'admin')                                                AS admins,
        SUM(DATE(created_at) = CURDATE())                                  AS new_today,
        SUM(DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY))      AS new_this_week,
        SUM(DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY))     AS new_this_month
      FROM users
    `);
    res.json(row);
  } catch (err) {
    console.error('[UserController.getUserStats]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/users/:id  (admin) ───────────────────────────────
const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, role, created_at, last_login FROM users WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'User not found.' });

    // Attach booking + order summaries
    const [[bookings]] = await db.query(
      `SELECT
         COUNT(*)                                                          AS total,
         SUM(status = 'confirmed')                                         AS confirmed,
         SUM(status = 'cancelled')                                         AS cancelled,
         COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price END), 0) AS total_spent
       FROM bookings WHERE user_id = ?`,
      [req.params.id]
    );

    const [[orders]] = await db.query(
      `SELECT
         COUNT(*) AS total,
         COALESCE(SUM(total_amount), 0) AS total_spent
       FROM food_orders WHERE user_id = ?`,
      [req.params.id]
    );

    res.json({ ...rows[0], bookings, orders });
  } catch (err) {
    console.error('[UserController.getUserById]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PUT /api/users/:id  (admin) ───────────────────────────────
const updateUser = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'User not found.' });

    const u = rows[0];
    const { name, email, phone, role } = req.body;

    // Ensure new email is not already taken by another user
    if (email && email !== u.email) {
      const [dup] = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.params.id]
      );
      if (dup.length)
        return res.status(409).json({ message: 'This email is already in use by another account.' });
    }

    await db.query(
      'UPDATE users SET name=?, email=?, phone=?, role=? WHERE id=?',
      [
        name  ?? u.name,
        email ?? u.email,
        phone ?? u.phone,
        role  ?? u.role,
        req.params.id
      ]
    );

    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    console.error('[UserController.updateUser]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PUT /api/users/:id/reset-password  (admin) ───────────────
const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashed = await bcrypt.hash(newPassword, 12);
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashed, req.params.id]
    );
    res.json({ message: 'User password reset successfully.' });
  } catch (err) {
    console.error('[UserController.resetUserPassword]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── DELETE /api/users/:id  (admin) ────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'User not found.' });

    if (rows[0].role === 'admin')
      return res.status(403).json({
        message: 'Admin accounts cannot be deleted via API. Use MySQL directly.'
      });

    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User account deleted successfully.' });
  } catch (err) {
    console.error('[UserController.deleteUser]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getAllUsers,
  getUserStats,
  getUserById,
  updateUser,
  resetUserPassword,
  deleteUser
};
