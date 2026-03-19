const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
require('dotenv').config();

// POST /api/setup/create-admin
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword)
      return res.status(400).json({ message: 'All fields are required.' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match.' });

    const [existing] = await db.query('SELECT id, role FROM users WHERE email = ?', [email]);

    if (existing.length > 0) {
      if (existing[0].role === 'admin')
        return res.status(409).json({ message: 'An admin account with this email already exists.' });
      // Promote guest to admin
      await db.query('UPDATE users SET name=?, role=? WHERE email=?', [name, 'admin', email]);
      const token = jwt.sign({ id: existing[0].id, email, role: 'admin' },
        process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ message: 'Account promoted to admin!', token,
        user: { id: existing[0].id, name, email, role: 'admin' } });
    }

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
      [name, email, hashed, 'admin']
    );
    const token = jwt.sign({ id: result.insertId, email, role: 'admin' },
      process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Admin account created successfully!',
      token,
      user: { id: result.insertId, name, email, role: 'admin' }
    });

  } catch (err) {
    console.error('[setup/create-admin]', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
