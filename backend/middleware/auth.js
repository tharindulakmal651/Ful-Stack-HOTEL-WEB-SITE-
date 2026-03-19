const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Verify JWT and attach user payload to req.user
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

/**
 * Require admin role (must run after authMiddleware)
 */
const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
    next();
  });
};

/**
 * Optional auth — attaches user if token present, continues if not
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, optionalAuth };
