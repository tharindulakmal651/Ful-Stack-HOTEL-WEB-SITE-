const express  = require('express');
const router   = express.Router();
const path     = require('path');
const db       = require('../config/db');
const { adminMiddleware } = require('../middleware/auth');
const {
  uploadRoomImages,
  uploadMenuImage,
  uploadPackageImages,
  uploadStaffImage,
  getImageUrl,
  deleteFile
} = require('../middleware/upload');

// ── Helper: wrap multer in a promise ─────────────────────────
const runMulter = (multerFn, req, res) => new Promise((resolve, reject) => {
  multerFn(req, res, (err) => {
    if (err) reject(err);
    else resolve();
  });
});

// ══════════════════════════════════════════════════════════════
//  ROOM IMAGES  (up to 4 per room)
//  POST /api/upload/room/:id
// ══════════════════════════════════════════════════════════════
router.post('/room/:id', adminMiddleware, async (req, res) => {
  try {
    await runMulter(uploadRoomImages, req, res);

    const [rows] = await db.query('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Room not found.' });

    const room = rows[0];

    // Parse existing images array
    let existing = [];
    if (room.image_urls) {
      try { existing = JSON.parse(room.image_urls); } catch { existing = []; }
    } else if (room.image_url) {
      existing = [room.image_url]; // migrate single → array
    }

    // Add new uploaded images
    const newImages = (req.files || []).map(f => getImageUrl(f.filename, 'rooms'));
    const allImages = [...existing, ...newImages].slice(0, 4); // max 4

    await db.query(
      'UPDATE rooms SET image_url = ?, image_urls = ? WHERE id = ?',
      [allImages[0] || null, JSON.stringify(allImages), req.params.id]
    );

    res.json({
      message: `${newImages.length} image(s) uploaded successfully.`,
      images: allImages
    });
  } catch (err) {
    console.error('[Upload.room]', err);
    res.status(400).json({ message: err.message || 'Upload failed.' });
  }
});

// DELETE single room image
router.delete('/room/:id/image', adminMiddleware, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const [rows] = await db.query('SELECT image_urls FROM rooms WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Room not found.' });

    let images = [];
    try { images = JSON.parse(rows[0].image_urls || '[]'); } catch { images = []; }

    const updated = images.filter(u => u !== imageUrl);
    deleteFile(imageUrl);

    await db.query(
      'UPDATE rooms SET image_url = ?, image_urls = ? WHERE id = ?',
      [updated[0] || null, JSON.stringify(updated), req.params.id]
    );

    res.json({ message: 'Image deleted.', images: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
//  MENU ITEM IMAGE  (1 per item)
//  POST /api/upload/menu/:id
// ══════════════════════════════════════════════════════════════
router.post('/menu/:id', adminMiddleware, async (req, res) => {
  try {
    await runMulter(uploadMenuImage, req, res);

    const [rows] = await db.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Menu item not found.' });

    if (!req.file) return res.status(400).json({ message: 'No image file provided.' });

    // Delete old image if exists
    if (rows[0].image_url) deleteFile(rows[0].image_url);

    const imageUrl = getImageUrl(req.file.filename, 'menu');
    await db.query('UPDATE menu_items SET image_url = ? WHERE id = ?', [imageUrl, req.params.id]);

    res.json({ message: 'Image uploaded successfully.', image_url: imageUrl });
  } catch (err) {
    console.error('[Upload.menu]', err);
    res.status(400).json({ message: err.message || 'Upload failed.' });
  }
});

// DELETE menu item image
router.delete('/menu/:id/image', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT image_url FROM menu_items WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Item not found.' });
    deleteFile(rows[0].image_url);
    await db.query('UPDATE menu_items SET image_url = NULL WHERE id = ?', [req.params.id]);
    res.json({ message: 'Image deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
//  PACKAGE IMAGES  (up to 4 per package)
//  POST /api/upload/package/:id
// ══════════════════════════════════════════════════════════════
router.post('/package/:id', adminMiddleware, async (req, res) => {
  try {
    await runMulter(uploadPackageImages, req, res);

    const [rows] = await db.query('SELECT * FROM packages WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Package not found.' });

    const pkg = rows[0];
    let existing = [];
    if (pkg.image_urls) {
      try { existing = JSON.parse(pkg.image_urls); } catch { existing = []; }
    } else if (pkg.image_url) {
      existing = [pkg.image_url];
    }

    const newImages = (req.files || []).map(f => getImageUrl(f.filename, 'packages'));
    const allImages = [...existing, ...newImages].slice(0, 4);

    await db.query(
      'UPDATE packages SET image_url = ?, image_urls = ? WHERE id = ?',
      [allImages[0] || null, JSON.stringify(allImages), req.params.id]
    );

    res.json({
      message: `${newImages.length} image(s) uploaded successfully.`,
      images: allImages
    });
  } catch (err) {
    console.error('[Upload.package]', err);
    res.status(400).json({ message: err.message || 'Upload failed.' });
  }
});

// DELETE single package image
router.delete('/package/:id/image', adminMiddleware, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const [rows] = await db.query('SELECT image_urls FROM packages WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Package not found.' });

    let images = [];
    try { images = JSON.parse(rows[0].image_urls || '[]'); } catch { images = []; }

    const updated = images.filter(u => u !== imageUrl);
    deleteFile(imageUrl);

    await db.query(
      'UPDATE packages SET image_url = ?, image_urls = ? WHERE id = ?',
      [updated[0] || null, JSON.stringify(updated), req.params.id]
    );

    res.json({ message: 'Image deleted.', images: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
//  STAFF IMAGE  (1 per staff member)
//  POST /api/upload/staff/:id
// ══════════════════════════════════════════════════════════════
router.post('/staff/:id', adminMiddleware, async (req, res) => {
  try {
    await runMulter(uploadStaffImage, req, res);

    const [rows] = await db.query('SELECT * FROM staff WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Staff member not found.' });

    if (!req.file) return res.status(400).json({ message: 'No image file provided.' });

    if (rows[0].image_url) deleteFile(rows[0].image_url);

    const imageUrl = getImageUrl(req.file.filename, 'staff');
    await db.query('UPDATE staff SET image_url = ? WHERE id = ?', [imageUrl, req.params.id]);

    res.json({ message: 'Photo uploaded successfully.', image_url: imageUrl });
  } catch (err) {
    console.error('[Upload.staff]', err);
    res.status(400).json({ message: err.message || 'Upload failed.' });
  }
});

// DELETE staff image
router.delete('/staff/:id/image', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT image_url FROM staff WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Staff not found.' });
    deleteFile(rows[0].image_url);
    await db.query('UPDATE staff SET image_url = NULL WHERE id = ?', [req.params.id]);
    res.json({ message: 'Photo deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
