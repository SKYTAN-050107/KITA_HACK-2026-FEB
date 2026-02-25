// backend/src/routes/userRoutes.js — User stats, profile, delete

const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebaseAdmin');

/**
 * GET /api/v1/user/stats
 * Aggregate user stats for Analytics dashboard.
 */
router.get('/user/stats', async (req, res) => {
    try {
        const { uid } = req.user;
        const userRef = db.collection('users').doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return res.status(404).json({ success: false, error: 'User not found', code: 'USER_001' });
        }

        const data = userSnap.data();

        res.json({
            success: true,
            totalScans: data.totalScans || 0,
            impactKg: data.impactKg || 0,
            co2Saved: data.co2Saved || 0,
            points: data.points || 0,
            streak: data.streak || 0,
            lastCheckIn: data.lastCheckIn || null,
        });
    } catch (err) {
        console.error('User stats error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch user stats' });
    }
});

/**
 * PUT /api/v1/user/profile
 * Update display name and optional avatar.
 */
router.put('/user/profile', async (req, res) => {
    try {
        const { uid } = req.user;
        const { displayName, avatarBase64 } = req.body;

        const updates = {};
        if (displayName !== undefined) updates.displayName = displayName;

        // If avatar base64 provided, store URL (simplified — in production, upload to Storage)
        if (avatarBase64) {
            // For hackathon: store the base64 directly or a placeholder
            // In production, upload to Firebase Storage and save the URL
            updates.avatarUrl = avatarBase64.startsWith('data:') ? avatarBase64 : null;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }

        updates.lastActive = admin.firestore.FieldValue.serverTimestamp();

        const userRef = db.collection('users').doc(uid);
        await userRef.update(updates);

        const updatedSnap = await userRef.get();
        const userData = updatedSnap.data();

        res.json({
            success: true,
            user: {
                uid,
                displayName: userData.displayName,
                avatarUrl: userData.avatarUrl,
                email: userData.email,
            },
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
});

/**
 * DELETE /api/v1/user
 * Delete account: anonymise scans, delete user doc, delete auth user.
 */
router.delete('/user', async (req, res) => {
    try {
        const { uid } = req.user;

        // Anonymise scans (keep for aggregate stats, remove PII link)
        const scansSnap = await db.collection('scans').where('userId', '==', uid).get();
        const batch = db.batch();

        scansSnap.forEach(doc => {
            batch.update(doc.ref, { userId: null });
        });

        // Delete user document
        batch.delete(db.collection('users').doc(uid));

        await batch.commit();

        // Delete Firebase Auth user
        await admin.auth().deleteUser(uid);

        res.json({ success: true });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ success: false, error: 'Failed to delete account' });
    }
});

module.exports = router;
