// backend/src/routes/weeklyRoutes.js — Weekly scan chart data

const express = require('express');
const router = express.Router();
const { db } = require('../config/firebaseAdmin');

/**
 * GET /api/v1/scans/weekly
 * Last 7 days scan counts bucketed by date for the analytics bar chart.
 */
router.get('/scans/weekly', async (req, res) => {
    try {
        const { uid } = req.user;
        const since = new Date(Date.now() - 7 * 86400000);

        const snap = await db.collection('scans')
            .where('userId', '==', uid)
            .where('timestamp', '>=', since)
            .orderBy('timestamp', 'desc')
            .get();

        // Bucket by day (last 7 days)
        const days = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
            days[d] = 0;
        }

        snap.forEach(doc => {
            const ts = doc.data().timestamp;
            if (ts && ts.toDate) {
                const d = ts.toDate().toISOString().slice(0, 10);
                if (days[d] !== undefined) days[d]++;
            }
        });

        res.json({
            success: true,
            days: Object.entries(days).map(([date, count]) => ({ date, count })),
        });
    } catch (err) {
        console.error('Weekly scans error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch weekly data' });
    }
});

module.exports = router;
