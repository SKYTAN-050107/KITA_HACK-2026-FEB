// backend/src/routes/scanSaveRoutes.js — Save scans + update disposal status

const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebaseAdmin');
const { WASTE_RULES, ESTIMATED_WEIGHTS, CO2_FACTOR } = require('../config/wasteRulesBackend');
const { RECYCLING_CENTRES } = require('../config/recyclingCentres');

/**
 * POST /api/v1/scans
 * Save a scan to Firestore. Awards 5 points per scan.
 * Auto-calculates impactKg from per-type weights.
 * Auto-assigns nearest targetCentre.
 */
router.post('/scans', async (req, res) => {
    try {
        const { uid } = req.user;
        const {
            wasteType,
            confidence,
            disposalMethod,
            rules,
            checklist,
            imageHash,
            location, // optional { lat, lng }
        } = req.body;

        if (!wasteType) {
            return res.status(400).json({
                success: false,
                error: 'wasteType is required',
                code: 'SCAN_001',
            });
        }

        // Calculate impact from estimated weights
        const estKg = ESTIMATED_WEIGHTS[wasteType] || 0.20;
        const co2Saved = parseFloat((estKg * CO2_FACTOR).toFixed(2));
        const pointsEarned = 5;

        // Auto-assign nearest centre
        const rule = WASTE_RULES[wasteType];
        const binId = rule?.correctBin?.id || 'black_bin';
        let targetCentre = null;

        const matchingCentres = RECYCLING_CENTRES.filter(c =>
            c.acceptsBins.includes(binId) || c.acceptsWasteTypes.includes(wasteType)
        );

        if (matchingCentres.length > 0) {
            // If user provided location, sort by distance
            if (location?.lat && location?.lng) {
                matchingCentres.sort((a, b) => {
                    const distA = haversine(location, a.coordinates);
                    const distB = haversine(location, b.coordinates);
                    return distA - distB;
                });
            }
            const nearest = matchingCentres[0];
            targetCentre = {
                id: nearest.id,
                name: nearest.name,
                address: nearest.address,
                type: nearest.type,
                coordinates: nearest.coordinates,
                hours: nearest.hours,
            };
        }

        // Create scan document
        const scanDoc = {
            userId: uid,
            wasteType,
            confidence: confidence || null,
            disposalMethod: disposalMethod || rule?.disposalMethod || 'dispose',
            rules: rules || rule?.shortRules || [],
            checklist: checklist || rule?.checklist || [],
            checklistCompleted: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            location: location || null,
            imageHash: imageHash || null,
            pointsEarned,
            impactKg: parseFloat(estKg.toFixed(2)),
            // Disposal tracking
            disposalStatus: 'pending',
            statusUpdatedAt: null,
            targetCentre,
            userConfirmedDisposal: false,
        };

        // Atomic: create scan + increment user stats
        const scanRef = db.collection('scans').doc();
        const userRef = db.collection('users').doc(uid);

        await db.runTransaction(async (tx) => {
            tx.set(scanRef, scanDoc);
            tx.update(userRef, {
                totalScans: admin.firestore.FieldValue.increment(1),
                impactKg: admin.firestore.FieldValue.increment(parseFloat(estKg.toFixed(2))),
                co2Saved: admin.firestore.FieldValue.increment(co2Saved),
                points: admin.firestore.FieldValue.increment(pointsEarned),
                lastActive: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        res.json({
            success: true,
            scanId: scanRef.id,
            pointsEarned,
            impactKg: parseFloat(estKg.toFixed(2)),
            targetCentre,
        });
    } catch (err) {
        console.error('Save scan error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to save scan',
            code: 'SCAN_001',
        });
    }
});

/**
 * PATCH /api/v1/scans/:scanId/status
 * Update disposal status (pending → recycled/donated/disposed)
 */
router.patch('/scans/:scanId/status', async (req, res) => {
    try {
        const { uid } = req.user;
        const { scanId } = req.params;
        const { disposalStatus } = req.body;

        const validStatuses = ['pending', 'recycled', 'donated', 'disposed'];
        if (!validStatuses.includes(disposalStatus)) {
            return res.status(400).json({
                success: false,
                error: `disposalStatus must be one of: ${validStatuses.join(', ')}`,
            });
        }

        const scanRef = db.collection('scans').doc(scanId);
        const scanSnap = await scanRef.get();

        if (!scanSnap.exists) {
            return res.status(404).json({ success: false, error: 'Scan not found' });
        }

        if (scanSnap.data().userId !== uid) {
            return res.status(403).json({ success: false, error: 'Not your scan' });
        }

        await scanRef.update({
            disposalStatus,
            statusUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            userConfirmedDisposal: disposalStatus !== 'pending',
        });

        res.json({ success: true, scanId, disposalStatus });
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ success: false, error: 'Failed to update status' });
    }
});

// ── Haversine distance (km) ──
function haversine(a, b) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const sin2 =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
}

module.exports = router;
