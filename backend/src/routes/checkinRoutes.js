// backend/src/routes/checkinRoutes.js — Daily check-in with streak + points

const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebaseAdmin');

/**
 * POST /api/v1/checkin
 * Daily check-in: streak tracking, milestone bonuses (7, 14, 30 days).
 * Composite key {uid}_{YYYY-MM-DD} prevents duplicates.
 */
router.post('/checkin', async (req, res) => {
    try {
        const { uid } = req.user;
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const docId = `${uid}_${today}`;
        const checkinRef = db.collection('dailyCheckins').doc(docId);

        // Check if already checked in today
        const existing = await checkinRef.get();
        if (existing.exists) {
            return res.status(409).json({
                success: false,
                error: 'Already checked in today',
                code: 'CHECKIN_001',
            });
        }

        // Calculate streak
        const userRef = db.collection('users').doc(uid);
        const userSnap = await userRef.get();
        const userData = userSnap.data() || {};

        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const isConsecutive = userData.lastCheckIn === yesterday;
        const newStreak = isConsecutive ? (userData.streak || 0) + 1 : 1;

        // Milestone bonuses
        const basePoints = 10;
        const milestones = { 7: 25, 14: 50, 30: 100 };
        const bonusPoints = milestones[newStreak] || 0;
        const totalPoints = basePoints + bonusPoints;

        // Atomic transaction: create check-in + update user
        await db.runTransaction(async (tx) => {
            tx.set(checkinRef, {
                uid,
                date: today,
                pointsEarned: totalPoints,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            tx.update(userRef, {
                points: admin.firestore.FieldValue.increment(totalPoints),
                streak: newStreak,
                lastCheckIn: today,
                lastActive: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        res.json({
            success: true,
            pointsEarned: totalPoints,
            bonusPoints,
            streak: newStreak,
            badge: bonusPoints > 0 ? `streak_${newStreak}` : null,
            nextCheckIn: `${today}T23:59:59Z`,
        });
    } catch (err) {
        console.error('Check-in error:', err);
        res.status(500).json({ success: false, error: 'Check-in failed' });
    }
});

module.exports = router;
