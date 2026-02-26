// backend/src/middleware/authMiddleware.js — Firebase ID Token verification

const { admin } = require('../config/firebaseAdmin');

/**
 * Middleware: Verify Firebase ID token from Authorization header.
 * Sets req.user = { uid, email, role } on success.
 * Returns 401 on missing/invalid token.
 */
module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Missing or malformed authorization token',
            code: 'AUTH_001',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = {
            uid: decoded.uid,
            email: decoded.email || null,
            role: decoded.role || 'user',
        };
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
            code: 'AUTH_002',
        });
    }
};
