// backend/src/routes/nearbyRoutes.js — Find nearby recycling/donation centres

const express = require('express');
const router = express.Router();
const { RECYCLING_CENTRES } = require('../config/recyclingCentres');

/**
 * POST /api/v1/nearby
 * Find nearby centres by waste type and user location.
 * Supports filter: "recycle" | "donate" | "all"
 */
router.post('/nearby', async (req, res) => {
    try {
        const {
            wasteType,
            location,       // { lat, lng } — required
            radius = 5000,  // metres, default 5km
            filter = 'all', // "recycle" | "donate" | "all"
        } = req.body;

        if (!location?.lat || !location?.lng) {
            return res.status(400).json({
                success: false,
                error: 'location { lat, lng } is required',
            });
        }

        let centres = [...RECYCLING_CENTRES];

        // Filter by type
        if (filter === 'recycle') {
            centres = centres.filter(c => c.type === 'recycling');
        } else if (filter === 'donate') {
            centres = centres.filter(c => c.type === 'donation');
        }

        // Filter by waste type (if provided)
        if (wasteType) {
            centres = centres.filter(c =>
                c.acceptsWasteTypes.includes(wasteType)
            );
        }

        // Calculate distance and filter by radius
        const radiusKm = radius / 1000;
        const withDistance = centres.map(c => ({
            ...c,
            distanceKm: haversine(location, c.coordinates),
            distanceMetres: Math.round(haversine(location, c.coordinates) * 1000),
            navigateUrl: `https://maps.google.com/?daddr=${c.coordinates.lat},${c.coordinates.lng}`,
        }))
            .filter(c => c.distanceKm <= radiusKm)
            .sort((a, b) => a.distanceKm - b.distanceKm);

        res.json({
            success: true,
            locations: withDistance,
            total: withDistance.length,
            filter,
            wasteType: wasteType || 'all',
        });
    } catch (err) {
        console.error('Nearby error:', err);
        res.status(500).json({ success: false, error: 'Failed to find nearby centres' });
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
