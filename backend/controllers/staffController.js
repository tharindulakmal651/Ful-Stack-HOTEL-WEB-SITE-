const db = require('../config/db');

// ── GET /api/staff ────────────────────────────────────────────
const getAllStaff = async (req, res) => {
  try {
    const { department } = req.query;
    let q      = 'SELECT * FROM staff';
    const params = [];
    if (department) { q += ' WHERE department = ?'; params.push(department); }
    q += ' ORDER BY department, name ASC';
    const [rows] = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    console.error('[StaffController.getAllStaff]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/staff/departments ───────────────────────────────
const getDepartments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT department, COUNT(*) AS count
       FROM staff
       GROUP BY department
       ORDER BY department ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('[StaffController.getDepartments]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/staff/:id ────────────────────────────────────────
const getStaffById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM staff WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Staff member not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[StaffController.getStaffById]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── POST /api/staff  (admin) ──────────────────────────────────
const createStaff = async (req, res) => {
  try {
    const { name, position, department, email, phone, bio, image_url } = req.body;
    const [result] = await db.query(
      `INSERT INTO staff (name, position, department, email, phone, bio, image_url)
       VALUES (?,?,?,?,?,?,?)`,
      [
        name, position, department,
        email     || null,
        phone     || null,
        bio       || null,
        image_url || null
      ]
    );
    res.status(201).json({ message: 'Staff member added.', id: result.insertId });
  } catch (err) {
    console.error('[StaffController.createStaff]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PUT /api/staff/:id  (admin) ───────────────────────────────
const updateStaff = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM staff WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Staff member not found.' });

    const s = rows[0];
    const { name, position, department, email, phone, bio, image_url } = req.body;

    await db.query(
      `UPDATE staff
         SET name=?, position=?, department=?,
             email=?, phone=?, bio=?, image_url=?
       WHERE id=?`,
      [
        name       ?? s.name,
        position   ?? s.position,
        department ?? s.department,
        email      ?? s.email,
        phone      ?? s.phone,
        bio        ?? s.bio,
        image_url  ?? s.image_url,
        req.params.id
      ]
    );
    res.json({ message: 'Staff member updated.' });
  } catch (err) {
    console.error('[StaffController.updateStaff]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── DELETE /api/staff/:id  (admin) ────────────────────────────
const deleteStaff = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id FROM staff WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Staff member not found.' });

    await db.query('DELETE FROM staff WHERE id = ?', [req.params.id]);
    res.json({ message: 'Staff member removed.' });
  } catch (err) {
    console.error('[StaffController.deleteStaff]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getAllStaff,
  getDepartments,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};
