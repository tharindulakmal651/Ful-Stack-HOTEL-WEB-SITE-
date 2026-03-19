const express   = require('express');
const path      = require('path');
const cors      = require('cors');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ── CORS ─────────────────────────────────────────────────────
// Allow all localhost origins - works for both port 3000 and 3001
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Rate limiting ─────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15*60*1000, max: 500 });
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 50 });
app.use(limiter);

// ── Serve uploaded images as static files ───────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',       authLimiter, require('./routes/auth'));
app.use('/api/rooms',      require('./routes/rooms'));
app.use('/api/bookings',   require('./routes/bookings'));
app.use('/api/packages',   require('./routes/packages'));
app.use('/api/restaurant', require('./routes/restaurant'));
app.use('/api/staff',      require('./routes/staff'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/contact',    require('./routes/contact'));
app.use('/api/setup',      require('./routes/setup'));
app.use('/api/upload',     require('./routes/upload'));

// ── Health ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', port: process.env.PORT || 5000 });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// ── Start ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅  Backend running  →  http://localhost:${PORT}/api/health`);
  console.log(`   User  frontend  →  http://localhost:3000`);
  console.log(`   Admin frontend  →  http://localhost:3001\n`);
});

module.exports = app;
