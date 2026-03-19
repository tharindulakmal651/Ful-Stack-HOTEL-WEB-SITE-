const db = require('../config/db');

// ── POST /api/contact ─────────────────────────────────────────
const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const [result] = await db.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?,?,?,?,?)',
      [name, email, phone || null, subject, message]
    );

    // Optional: send email notification if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        const nodemailer  = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host:   process.env.SMTP_HOST,
          port:   parseInt(process.env.SMTP_PORT) || 587,
          secure: false,
          auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
        await transporter.sendMail({
          from:    `"Araliya Website" <${process.env.SMTP_USER}>`,
          to:      process.env.HOTEL_EMAIL,
          subject: `[Contact Form] ${subject} — from ${name}`,
          text:    `Name:    ${name}\nEmail:   ${email}\nPhone:   ${phone || 'N/A'}\nSubject: ${subject}\n\n${message}`
        });
      } catch (mailErr) {
        // Non-critical: log but do not fail the request
        console.warn('[ContactController] Email notification failed:', mailErr.message);
      }
    }

    res.status(201).json({
      message: "Thank you! Your message has been sent. We'll get back to you within 24 hours.",
      id: result.insertId
    });
  } catch (err) {
    console.error('[ContactController.submitContact]', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ── GET /api/contact  (admin) ─────────────────────────────────
const getAllMessages = async (req, res) => {
  try {
    const { is_read, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let q      = 'SELECT * FROM contact_messages WHERE 1=1';
    const params = [];
    if (is_read !== undefined) {
      q += ' AND is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }

    const [cnt] = await db.query(
      q.replace('SELECT *', 'SELECT COUNT(*) AS total'), params
    );

    q += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.query(q, params);

    res.json({
      data: rows,
      pagination: { total: cnt[0].total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) {
    console.error('[ContactController.getAllMessages]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PATCH /api/contact/:id/read  (admin) ─────────────────────
const markAsRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE contact_messages SET is_read = TRUE WHERE id = ?', [req.params.id]
    );
    res.json({ message: 'Message marked as read.' });
  } catch (err) {
    console.error('[ContactController.markAsRead]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── DELETE /api/contact/:id  (admin) ─────────────────────────
const deleteMessage = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM contact_messages WHERE id = ?', [req.params.id]
    );
    res.json({ message: 'Message deleted.' });
  } catch (err) {
    console.error('[ContactController.deleteMessage]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  submitContact,
  getAllMessages,
  markAsRead,
  deleteMessage
};
