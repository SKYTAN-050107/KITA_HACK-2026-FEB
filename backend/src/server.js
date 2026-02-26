// backend/src/server.js — KITA_HACK Backend API server

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
require('dotenv').config();

const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Multer fallback for judge file uploads ──
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB

// ── Global Middleware ──
const allowedOrigins = [
    'https://kitahack-487005.web.app',
    'https://kitahack-487005.firebaseapp.com',
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Local backend testing
];
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? allowedOrigins.filter(o => o.startsWith('https://'))
        : allowedOrigins,
    credentials: true,
}));

app.use(express.json({ limit: '15mb' })); // Large limit for base64 images
app.use(express.urlencoded({ extended: true }));

// Rate limiting (global)
const globalLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests', code: 'RATE_001' },
});
app.use(globalLimiter);

// Logging middleware (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// ── Public Routes (no auth required) ──
app.use('/api/scan', require('./routes/scanRoutes'));

// ── Auth Route (does its own token verification) ──
app.use('/api/v1', require('./routes/authRoutes'));

// ── Protected Routes (all require auth middleware) ──
app.use('/api/v1', authMiddleware, require('./routes/scanSaveRoutes'));
app.use('/api/v1', authMiddleware, require('./routes/scanHistoryRoutes'));
app.use('/api/v1', authMiddleware, require('./routes/userRoutes'));
app.use('/api/v1', authMiddleware, require('./routes/checkinRoutes'));
app.use('/api/v1', authMiddleware, require('./routes/weeklyRoutes'));
app.use('/api/v1', authMiddleware, require('./routes/nearbyRoutes'));
app.use('/api/v1', authMiddleware, require('./routes/guidelinesRoutes'));

// ── Root route ──
app.get('/', (req, res) => {
    res.json({
        message: '🚀 KITA_HACK Backend API is running',
        endpoints: {
            health: '/api/health',
            scan: '/api/scan',
            validate: '/api/scan/validate',
        },
    });
});

// ── Health check ──
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'KITA_HACK Backend',
    });
});

// ── 404 handler ──
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// ── Error handler ──
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// ── Start server ──
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KITA_HACK Backend running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
