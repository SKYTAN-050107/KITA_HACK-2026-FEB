// backend/src/routes/scanHistoryRoutes.js — GET scan history + detail

const express = require('express');
const router = express.Router();
const { db } = require('../config/firebaseAdmin');

/**
 * GET /api/v1/scans
 * Paginated scan history for authenticated user.
 */
router.get('/scans', async (req, res) => {
    try {
        const { uid } = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const offset = (page - 1) * limit;

        let snap;
        try {
            // Primary: ordered query (requires composite index on userId + timestamp)
            let query = db.collection('scans')
                .where('userId', '==', uid)
                .orderBy('timestamp', 'desc');

            if (offset > 0) {
                query = query.offset(offset);
            }

            snap = await query.limit(limit + 1).get();
        } catch (indexErr) {
            // Fallback: unordered query (no composite index needed), sort in memory
            console.warn('Composite index not ready, using fallback query:', indexErr.message?.substring(0, 80));
            const fallbackSnap = await db.collection('scans')
                .where('userId', '==', uid)
                .get();

            // Sort by timestamp descending in memory
            const allDocs = fallbackSnap.docs.sort((a, b) => {
                const tsA = a.data().timestamp?.toMillis?.() || 0;
                const tsB = b.data().timestamp?.toMillis?.() || 0;
                return tsB - tsA;
            });

            // Manual pagination
            const sliced = allDocs.slice(offset, offset + limit + 1);
            snap = { docs: sliced, size: sliced.length };
        }

        const scans = snap.docs.slice(0, limit).map(doc => ({
            scanId: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || null,
            statusUpdatedAt: doc.data().statusUpdatedAt?.toDate?.()?.toISOString() || null,
        }));

        res.json({
            success: true,
            scans,
            total: scans.length,
            hasMore: snap.docs.length > limit,
            page,
        });
    } catch (err) {
        console.error('History fetch error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch scan history' });
    }
});

/**
 * GET /api/v1/scans/:scanId
 * Single scan detail with full rules/checklist.
 */
router.get('/scans/:scanId', async (req, res) => {
    try {
        const { uid } = req.user;
        const { scanId } = req.params;

        const scanRef = db.collection('scans').doc(scanId);
        const scanSnap = await scanRef.get();

        if (!scanSnap.exists) {
            return res.status(404).json({ success: false, error: 'Scan not found' });
        }

        const data = scanSnap.data();

        // Only allow owner to read (or if userId is null = anonymous)
        if (data.userId && data.userId !== uid) {
            return res.status(403).json({ success: false, error: 'Not your scan' });
        }

        res.json({
            success: true,
            scan: {
                scanId: scanSnap.id,
                ...data,
                timestamp: data.timestamp?.toDate?.()?.toISOString() || null,
                statusUpdatedAt: data.statusUpdatedAt?.toDate?.()?.toISOString() || null,
            },
        });
    } catch (err) {
        console.error('Scan detail error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch scan detail' });
    }
});

module.exports = router;
