const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Ensure upload directories exist
const UPLOAD_DIRS = {
  rooms:    path.join(__dirname, '../uploads/rooms'),
  menu:     path.join(__dirname, '../uploads/menu'),
  packages: path.join(__dirname, '../uploads/packages'),
  staff:    path.join(__dirname, '../uploads/staff'),
};

Object.values(UPLOAD_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Storage factory — saves files to the right subfolder
const makeStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRS[folder]);
  },
  filename: (req, file, cb) => {
    const ext       = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const safe      = file.originalname.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
    cb(null, `${folder}_${safe}_${timestamp}${ext}`);
  }
});

// Only allow image files
const imageFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext     = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, webp, gif)'), false);
  }
};

// Max 5MB per file
const MAX_SIZE = 5 * 1024 * 1024;

// Multer instances for each category
const uploaders = {
  rooms:    multer({ storage: makeStorage('rooms'),    fileFilter: imageFilter, limits: { fileSize: MAX_SIZE } }),
  menu:     multer({ storage: makeStorage('menu'),     fileFilter: imageFilter, limits: { fileSize: MAX_SIZE } }),
  packages: multer({ storage: makeStorage('packages'), fileFilter: imageFilter, limits: { fileSize: MAX_SIZE } }),
  staff:    multer({ storage: makeStorage('staff'),    fileFilter: imageFilter, limits: { fileSize: MAX_SIZE } }),
};

/**
 * Middleware factories:
 *   uploadRoomImages     → up to 4 images, field name: "images"
 *   uploadMenuImage      → 1 image, field name: "image"
 *   uploadPackageImages  → up to 4 images, field name: "images"
 *   uploadStaffImage     → 1 image, field name: "image"
 */
const uploadRoomImages    = uploaders.rooms.array('images', 4);
const uploadMenuImage     = uploaders.menu.single('image');
const uploadPackageImages = uploaders.packages.array('images', 4);
const uploadStaffImage    = uploaders.staff.single('image');

// Helper: get public URL from saved file path
const getImageUrl = (filename, folder) => {
  if (!filename) return null;
  return `/uploads/${folder}/${filename}`;
};

// Helper: delete a file if it exists
const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = {
  uploadRoomImages,
  uploadMenuImage,
  uploadPackageImages,
  uploadStaffImage,
  getImageUrl,
  deleteFile,
  UPLOAD_DIRS
};
