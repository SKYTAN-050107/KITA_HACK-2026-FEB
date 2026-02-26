// backend/src/routes/authRoutes.js — POST /api/v1/verify

const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebaseAdmin');

/**
 * POST /api/v1/verify
 * Verify Firebase ID token, upsert user doc in Firestore.
 * This endpoint does its OWN token verification (not behind authMiddleware).
 */
router.post('/verify', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                error: 'idToken is required',
                code: 'AUTH_003',
            });
        }

        // Verify the Firebase ID token
        const decoded = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decoded;

        // Upsert user document in Firestore
        const userRef = db.collection('users').doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            // New user — create document with defaults
            await userRef.set({
                email: email || null,
                displayName: name || email?.split('@')[0] || 'User',
                avatarUrl: picture || null,
                totalScans: 0,
                impactKg: 0,
                co2Saved: 0,
                points: 0,
                streak: 0,
                lastCheckIn: null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastActive: admin.firestore.FieldValue.serverTimestamp(),
            });
        } else {
            // Existing user — update last active
            await userRef.update({
                lastActive: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Get the (possibly just created) user data
        const userData = (await userRef.get()).data();

        res.json({
            success: true,
            user: {
                uid,
                email: userData.email,
                displayName: userData.displayName,
                avatarUrl: userData.avatarUrl,
                totalScans: userData.totalScans,
                points: userData.points,
                streak: userData.streak,
            },
        });
    } catch (err) {
        console.error('Verify error:', err.message);
        res.status(401).json({
            success: false,
            error: 'Token verification failed',
            code: 'AUTH_002',
        });
    }
});

module.exports = router;
