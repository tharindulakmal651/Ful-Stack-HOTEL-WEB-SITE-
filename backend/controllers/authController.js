const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');
require('dotenv').config();

// ── helper ───────────────────────────────────────────────────
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

// ── POST /api/auth/register ──────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, phone || null, 'guest']
    );

    const user  = { id: result.insertId, name, email, role: 'guest' };
    const token = signToken(user);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user
    });
  } catch (err) {
    console.error('[AuthController.register]', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ── POST /api/auth/login ─────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Invalid email or password.' });

    // Update last login timestamp
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const payload = { id: user.id, email: user.email, role: user.role };
    const token   = signToken(payload);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        role:  user.role
      }
    });
  } catch (err) {
    console.error('[AuthController.login]', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, role, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'User not found.' });

    res.json(rows[0]);
  } catch (err) {
    console.error('[AuthController.getMe]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PUT /api/auth/profile ────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    await db.query(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?',
      [name || null, phone || null, req.user.id]
    );

    const [rows] = await db.query(
      'SELECT id, name, email, phone, role FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: 'Profile updated successfully.', user: rows[0] });
  } catch (err) {
    console.error('[AuthController.updateProfile]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PUT /api/auth/change-password ────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const [rows] = await db.query(
      'SELECT password FROM users WHERE id = ?', [req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'User not found.' });

    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid)
      return res.status(400).json({ message: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]
    );

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('[AuthController.changePassword]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── POST /api/auth/register-admin ────────────────────────────
// Requires: valid admin JWT  OR  ADMIN_SETUP_KEY in body (for first admin)
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, setupKey } = req.body;

    // Two ways to be authorised:
    // 1. Already logged-in admin (req.user set by optional middleware)
    // 2. Provide the ADMIN_SETUP_KEY from .env (for first-ever admin)
    const isLoggedInAdmin  = req.user && req.user.role === 'admin';
    const isValidSetupKey  = setupKey &&
      process.env.ADMIN_SETUP_KEY &&
      setupKey === process.env.ADMIN_SETUP_KEY;

    if (!isLoggedInAdmin && !isValidSetupKey) {
      return res.status(403).json({
        message: 'Not authorised. Provide a valid Admin Setup Key or be logged in as an admin.'
      });
    }

    // Check duplicate email
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length)
      return res.status(409).json({ message: 'This email is already registered.' });

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, phone || null, 'admin']
    );

    const user  = { id: result.insertId, name, email, role: 'admin' };
    const token = signToken(user);

    res.status(201).json({
      message: `Admin account created for ${name}.`,
      token,
      user
    });
  } catch (err) {
    console.error('[AuthController.registerAdmin]', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ── GET /api/auth/admins  (admin only) ───────────────────────
const listAdmins = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, created_at FROM users WHERE role = 'admin' ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error('[AuthController.listAdmins]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, registerAdmin, listAdmins };


