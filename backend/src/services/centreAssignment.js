// backend/src/services/centreAssignment.js — Nearest recycling centre assignment
// Uses Haversine formula to find the closest centre that accepts a given waste type

const { RECYCLING_CENTRES } = require('../config/recyclingCentres');

/**
 * Haversine distance between two lat/lng points
 * @param {number} lat1 - Latitude of point A (degrees)
 * @param {number} lng1 - Longitude of point A (degrees)
 * @param {number} lat2 - Latitude of point B (degrees)
 * @param {number} lng2 - Longitude of point B (degrees)
 * @returns {number} Distance in kilometres
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Find the nearest recycling/donation centre that accepts the given waste type
 * @param {string} wasteType - Canonical waste type (e.g. 'plastic', 'glass', 'clothes')
 * @param {{ lat: number, lng: number }} userLocation - User's current coordinates
 * @returns {{ centre: object, distanceKm: number } | null} Nearest matching centre with distance, or null
 */
function assignNearestCentre(wasteType, userLocation) {
  if (!wasteType || !userLocation || !userLocation.lat || !userLocation.lng) {
    return null;
  }

  // Filter centres that accept this waste type
  const matchingCentres = RECYCLING_CENTRES.filter((centre) =>
    centre.acceptsWasteTypes.includes(wasteType)
  );

  if (matchingCentres.length === 0) {
    return null;
  }

  // Calculate distance for each matching centre and find the nearest
  let nearest = null;
  let minDistance = Infinity;

  for (const centre of matchingCentres) {
    const dist = haversineDistance(
      userLocation.lat,
      userLocation.lng,
      centre.coordinates.lat,
      centre.coordinates.lng
    );

    if (dist < minDistance) {
      minDistance = dist;
      nearest = centre;
    }
  }

  return {
    centre: {
      id: nearest.id,
      name: nearest.name,
      type: nearest.type,
      address: nearest.address,
      coordinates: nearest.coordinates,
      hours: nearest.hours,
      contact: nearest.contact,
    },
    distanceKm: parseFloat(minDistance.toFixed(2)),
  };
}

/**
 * Find all centres accepting a waste type, sorted by distance from user
 * @param {string} wasteType - Canonical waste type
 * @param {{ lat: number, lng: number }} userLocation - User's current coordinates
 * @param {number} [maxResults=5] - Maximum number of centres to return
 * @returns {Array<{ centre: object, distanceKm: number }>} Sorted list of centres
 */
function findNearbyCentres(wasteType, userLocation, maxResults = 5) {
  if (!wasteType || !userLocation || !userLocation.lat || !userLocation.lng) {
    return [];
  }

  const matchingCentres = RECYCLING_CENTRES.filter((centre) =>
    centre.acceptsWasteTypes.includes(wasteType)
  );

  const withDistance = matchingCentres.map((centre) => ({
    centre: {
      id: centre.id,
      name: centre.name,
      type: centre.type,
      address: centre.address,
      coordinates: centre.coordinates,
      hours: centre.hours,
      contact: centre.contact,
    },
    distanceKm: parseFloat(
      haversineDistance(
        userLocation.lat,
        userLocation.lng,
        centre.coordinates.lat,
        centre.coordinates.lng
      ).toFixed(2)
    ),
  }));

  // Sort by distance ascending
  withDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  return withDistance.slice(0, maxResults);
}

module.exports = { assignNearestCentre, findNearbyCentres, haversineDistance };
