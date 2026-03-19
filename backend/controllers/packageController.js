const db = require('../config/db');

const parsePkg = (p) => ({
  ...p,
  includes: p.includes
    ? (typeof p.includes === 'string' ? JSON.parse(p.includes) : p.includes)
    : []
});

// ── GET /api/packages  (public) ──────────────────────────────
const getAllPackages = async (req, res) => {
  try {
    const { type } = req.query;
    let q      = 'SELECT * FROM packages WHERE is_active = TRUE';
    const params = [];
    if (type) { q += ' AND type = ?'; params.push(type); }
    q += ' ORDER BY price ASC';
    const [rows] = await db.query(q, params);
    res.json(rows.map(parsePkg));
  } catch (err) {
    console.error('[PackageController.getAllPackages]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/packages/all  (admin – includes inactive) ───────
const getAllPackagesAdmin = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM packages ORDER BY type, price ASC'
    );
    res.json(rows.map(parsePkg));
  } catch (err) {
    console.error('[PackageController.getAllPackagesAdmin]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/packages/:id ─────────────────────────────────────
const getPackageById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM packages WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Package not found.' });
    res.json(parsePkg(rows[0]));
  } catch (err) {
    console.error('[PackageController.getPackageById]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── POST /api/packages  (admin) ───────────────────────────────
const createPackage = async (req, res) => {
  try {
    const { name, type, price, description, includes, duration, image_url } = req.body;
    const [result] = await db.query(
      `INSERT INTO packages (name, type, price, description, includes, duration, image_url)
       VALUES (?,?,?,?,?,?,?)`,
      [
        name, type, price, description,
        JSON.stringify(includes || []),
        duration   || null,
        image_url  || null
      ]
    );
    res.status(201).json({ message: 'Package created.', id: result.insertId });
  } catch (err) {
    console.error('[PackageController.createPackage]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PUT /api/packages/:id  (admin) ───────────────────────────
const updatePackage = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM packages WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Package not found.' });

    const p = rows[0];
    const { name, type, price, description, includes, duration, image_url, is_active } = req.body;

    await db.query(
      `UPDATE packages
         SET name=?, type=?, price=?, description=?, includes=?,
             duration=?, image_url=?, is_active=?
       WHERE id=?`,
      [
        name        ?? p.name,
        type        ?? p.type,
        price       ?? p.price,
        description ?? p.description,
        includes    ? JSON.stringify(includes) : p.includes,
        duration    ?? p.duration,
        image_url   ?? p.image_url,
        is_active   !== undefined ? is_active : p.is_active,
        req.params.id
      ]
    );
    res.json({ message: 'Package updated.' });
  } catch (err) {
    console.error('[PackageController.updatePackage]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PATCH /api/packages/:id/toggle  (admin) ──────────────────
const togglePackage = async (req, res) => {
  try {
    await db.query(
      'UPDATE packages SET is_active = NOT is_active WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Package status toggled.' });
  } catch (err) {
    console.error('[PackageController.togglePackage]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── DELETE /api/packages/:id  (admin) ────────────────────────
const deletePackage = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id FROM packages WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Package not found.' });

    await db.query('DELETE FROM packages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Package deleted.' });
  } catch (err) {
    console.error('[PackageController.deletePackage]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getAllPackages,
  getAllPackagesAdmin,
  getPackageById,
  createPackage,
  updatePackage,
  togglePackage,
  deletePackage
};
