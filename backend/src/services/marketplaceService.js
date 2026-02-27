// backend/src/services/marketplaceService.js — Firestore CRUD for Marketplace

const { admin, db, bucket } = require('../config/firebaseAdmin');

// ── Constants ──────────────────────────────────────────────────────────────────

const LISTINGS_COL = 'marketplace_listings';
const REQUESTS_COL = 'marketplace_requests';
const OFFERS_COL = 'marketplace_offers';
const USERS_COL = 'users'; // existing user profiles

const SIGNED_URL_EXPIRY_MS = 10 * 365 * 24 * 60 * 60 * 1000; // ~10 years

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Upload a base64 image to GCS and return a signed download URL.
 * @param {string} base64Data – data URI or raw base64
 * @param {string} folder – GCS folder path segment
 * @param {string} filename – filename (without extension)
 * @returns {Promise<string>} signed URL
 */
async function uploadPhoto(base64Data, folder, filename) {
  const raw = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const buffer = Buffer.from(raw, 'base64');

  const filePath = `marketplace/${folder}/${filename}.jpg`;
  const file = bucket.file(filePath);

  await file.save(buffer, {
    contentType: 'image/jpeg',
    metadata: { cacheControl: 'public, max-age=31536000' },
  });

  const [url] = await file.getSignedUrl({
    version: 'v2',
    action: 'read',
    expires: Date.now() + SIGNED_URL_EXPIRY_MS,
  });

  return url;
}

/**
 * Fetch a lightweight seller/buyer profile from the users collection.
 * Falls back to a placeholder if the document doesn't exist.
 */
async function getUserProfile(uid) {
  try {
    const snap = await db.collection(USERS_COL).doc(uid).get();
    if (snap.exists) {
      const d = snap.data();
      return {
        name: d.displayName || d.name || d.email || 'Anonymous',
        rating: d.rating || 0,
        reviewCount: d.reviewCount || 0,
        companyName: d.companyName || null,
        verificationStatus: d.verificationStatus || 'unverified',
      };
    }
  } catch (_) {
    /* ignore */
  }
  return {
    name: 'User',
    rating: 0,
    reviewCount: 0,
    companyName: null,
    verificationStatus: 'unverified',
  };
}

// ── Listings ───────────────────────────────────────────────────────────────────

/**
 * List all active listings with optional filters.
 * @param {{ wasteType, minPrice, maxPrice, sortBy }} filters
 */
async function getListings(filters = {}) {
  let query = db.collection(LISTINGS_COL).where('status', '==', 'listed');

  if (filters.wasteType) {
    query = query.where('wasteType', '==', filters.wasteType);
  }

  // Firestore doesn't support range filters on different fields without
  // composite indexes, so we do price filtering in memory.
  const snap = await query.get();
  let listings = [];

  for (const doc of snap.docs) {
    const data = { listingId: doc.id, ...doc.data() };
    data.totalPrice = parseFloat(
      ((data.pricePerUnit || 0) * (data.quantity || 0)).toFixed(2)
    );
    data.sellerProfile = await getUserProfile(data.sellerId);

    // Convert Firestore timestamps
    if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate().toISOString();
    if (data.updatedAt?.toDate) data.updatedAt = data.updatedAt.toDate().toISOString();

    listings.push(data);
  }

  // In-memory price filter
  if (filters.minPrice) {
    const min = parseFloat(filters.minPrice);
    listings = listings.filter((l) => l.pricePerUnit >= min);
  }
  if (filters.maxPrice) {
    const max = parseFloat(filters.maxPrice);
    listings = listings.filter((l) => l.pricePerUnit <= max);
  }

  // Sort
  switch (filters.sortBy) {
    case 'price-asc':
      listings.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
      break;
    case 'price-desc':
      listings.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
      break;
    case 'rating':
      listings.sort((a, b) => (b.sellerProfile?.rating || 0) - (a.sellerProfile?.rating || 0));
      break;
    case 'newest':
    default:
      listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }

  return listings;
}

/**
 * Get a single listing by ID.
 */
async function getListingById(listingId) {
  const snap = await db.collection(LISTINGS_COL).doc(listingId).get();
  if (!snap.exists) return null;

  const data = { listingId: snap.id, ...snap.data() };
  data.totalPrice = parseFloat(
    ((data.pricePerUnit || 0) * (data.quantity || 0)).toFixed(2)
  );
  data.sellerProfile = await getUserProfile(data.sellerId);

  if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate().toISOString();
  if (data.updatedAt?.toDate) data.updatedAt = data.updatedAt.toDate().toISOString();

  return data;
}

/**
 * Create a new listing. Uploads any base64 photos to GCS.
 */
async function createListing(uid, body) {
  const ref = db.collection(LISTINGS_COL).doc();

  // Upload photos (base64 → GCS)
  const photoUrls = [];
  if (body.photos && body.photos.length > 0) {
    for (let i = 0; i < body.photos.length; i++) {
      const photo = body.photos[i];
      // Skip if already a URL (not base64)
      if (photo.startsWith('http')) {
        photoUrls.push(photo);
        continue;
      }
      try {
        const url = await uploadPhoto(photo, `listings/${ref.id}`, `photo_${i}`);
        photoUrls.push(url);
      } catch (err) {
        console.warn(`Photo ${i} upload failed:`, err.message);
      }
    }
  }

  const doc = {
    sellerId: uid,
    wasteType: body.wasteType || '',
    quantity: parseFloat(body.quantity) || 0,
    unit: body.unit || 'kg',
    condition: body.condition || 'used',
    description: body.description || '',
    photos: photoUrls,
    pricePerUnit: parseFloat(body.pricePerUnit) || 0,
    currency: body.currency || 'USD',
    location: body.location || { latitude: null, longitude: null, address: '', city: '' },
    tags: body.tags || [],
    status: 'listed',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await ref.set(doc);
  return ref.id;
}

/**
 * Update an existing listing (only the owner may update).
 */
async function updateListing(listingId, uid, body) {
  const ref = db.collection(LISTINGS_COL).doc(listingId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Listing not found');
  if (snap.data().sellerId !== uid) throw new Error('Unauthorized');

  // Process photos — upload new base64 ones, keep existing URLs
  const photoUrls = [];
  if (body.photos && body.photos.length > 0) {
    for (let i = 0; i < body.photos.length; i++) {
      const photo = body.photos[i];
      if (photo.startsWith('http')) {
        photoUrls.push(photo);
        continue;
      }
      try {
        const url = await uploadPhoto(photo, `listings/${listingId}`, `photo_${i}_${Date.now()}`);
        photoUrls.push(url);
      } catch (err) {
        console.warn(`Photo ${i} upload failed:`, err.message);
      }
    }
  }

  const updates = {
    wasteType: body.wasteType,
    quantity: parseFloat(body.quantity) || 0,
    unit: body.unit || 'kg',
    condition: body.condition || 'used',
    description: body.description || '',
    photos: photoUrls,
    pricePerUnit: parseFloat(body.pricePerUnit) || 0,
    currency: body.currency || 'USD',
    location: body.location || {},
    tags: body.tags || [],
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await ref.update(updates);
  return listingId;
}

/**
 * Delete a listing (only the owner may delete).
 */
async function deleteListing(listingId, uid) {
  const ref = db.collection(LISTINGS_COL).doc(listingId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Listing not found');
  if (snap.data().sellerId !== uid) throw new Error('Unauthorized');

  await ref.delete();
}

/**
 * Get current user's listings, optionally filtered by status.
 */
async function getMyListings(uid, status) {
  let query = db.collection(LISTINGS_COL).where('sellerId', '==', uid);

  if (status && status !== 'all') {
    query = query.where('status', '==', status);
  }

  const snap = await query.get();
  const listings = [];

  for (const doc of snap.docs) {
    const data = { listingId: doc.id, ...doc.data() };
    data.totalPrice = parseFloat(
      ((data.pricePerUnit || 0) * (data.quantity || 0)).toFixed(2)
    );
    if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate().toISOString();
    if (data.updatedAt?.toDate) data.updatedAt = data.updatedAt.toDate().toISOString();
    listings.push(data);
  }

  listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return listings;
}

// ── Buyer Requests ─────────────────────────────────────────────────────────────

/**
 * List active buyer requests with optional filters.
 */
async function getBuyerRequests(filters = {}) {
  let query = db.collection(REQUESTS_COL).where('status', '==', 'active');

  if (filters.wasteType) {
    query = query.where('wasteType', '==', filters.wasteType);
  }

  const snap = await query.get();
  let requests = [];

  for (const doc of snap.docs) {
    const data = { requestId: doc.id, ...doc.data() };
    data.buyerProfile = await getUserProfile(data.buyerId);

    if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate().toISOString();
    if (data.updatedAt?.toDate) data.updatedAt = data.updatedAt.toDate().toISOString();
    if (data.deadline?.toDate) data.deadline = data.deadline.toDate().toISOString();

    requests.push(data);
  }

  // In-memory price filter (on priceOffered)
  if (filters.minPrice) {
    const min = parseFloat(filters.minPrice);
    requests = requests.filter((r) => (r.priceOffered || 0) >= min);
  }
  if (filters.maxPrice) {
    const max = parseFloat(filters.maxPrice);
    requests = requests.filter((r) => (r.priceOffered || 0) <= max);
  }

  requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return requests;
}

// ── Offers ─────────────────────────────────────────────────────────────────────

/**
 * Get all offers for the current user (both as buyer and as seller).
 */
async function getMyOffers(uid) {
  // Offers where user is the buyer
  const buyerSnap = await db
    .collection(OFFERS_COL)
    .where('buyerId', '==', uid)
    .get();

  // Offers where user is the seller
  const sellerSnap = await db
    .collection(OFFERS_COL)
    .where('sellerId', '==', uid)
    .get();

  const formatOffer = (doc) => {
    const data = { offerId: doc.id, ...doc.data() };
    // Convert timestamps in timeline
    if (data.timeline) {
      for (const key of Object.keys(data.timeline)) {
        if (data.timeline[key]?.toDate) {
          data.timeline[key] = data.timeline[key].toDate().toISOString();
        }
      }
    }
    // Convert message timestamps
    if (data.messages) {
      data.messages = data.messages.map((m) => ({
        ...m,
        timestamp: m.timestamp?.toDate ? m.timestamp.toDate().toISOString() : m.timestamp,
      }));
    }
    return data;
  };

  const offersAsBuyer = buyerSnap.docs.map(formatOffer);
  const offersAsSeller = sellerSnap.docs.map(formatOffer);

  // Combine & deduplicate
  const allMap = new Map();
  [...offersAsBuyer, ...offersAsSeller].forEach((o) => allMap.set(o.offerId, o));
  const allOffers = Array.from(allMap.values());

  return { offersAsBuyer, offersAsSeller, allOffers };
}

/**
 * Get a single offer by ID (caller must be buyer or seller).
 */
async function getOfferById(offerId, uid) {
  const snap = await db.collection(OFFERS_COL).doc(offerId).get();
  if (!snap.exists) throw new Error('Offer not found');

  const data = { offerId: snap.id, ...snap.data() };

  if (data.buyerId !== uid && data.sellerId !== uid) {
    throw new Error('Unauthorized');
  }

  // Convert timestamps
  if (data.timeline) {
    for (const key of Object.keys(data.timeline)) {
      if (data.timeline[key]?.toDate) {
        data.timeline[key] = data.timeline[key].toDate().toISOString();
      }
    }
  }
  if (data.messages) {
    data.messages = data.messages.map((m) => ({
      ...m,
      timestamp: m.timestamp?.toDate ? m.timestamp.toDate().toISOString() : m.timestamp,
    }));
  }

  return data;
}

/**
 * Create a new offer on a listing or buyer request.
 */
async function createOffer(uid, body) {
  const ref = db.collection(OFFERS_COL).doc();

  // Determine seller ID from listing if targeting a listing
  let sellerId = body.sellerId || null;
  if (body.listingId && !sellerId) {
    const listingSnap = await db.collection(LISTINGS_COL).doc(body.listingId).get();
    if (listingSnap.exists) {
      sellerId = listingSnap.data().sellerId;
    }
  }

  const doc = {
    listingId: body.listingId || null,
    requestId: body.requestId || null,
    buyerId: uid,
    sellerId: sellerId,
    offeredPrice: parseFloat(body.offeredPrice) || 0,
    quantity: parseFloat(body.quantity) || 0,
    unit: body.unit || 'kg',
    status: 'pending',
    messages: body.message
      ? [
          {
            sender: uid,
            text: body.message,
            type: 'text',
            timestamp: new Date().toISOString(),
          },
        ]
      : [],
    timeline: {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await ref.set(doc);
  return ref.id;
}

/**
 * Send a message in an offer thread.
 */
async function sendMessage(offerId, uid, text) {
  const ref = db.collection(OFFERS_COL).doc(offerId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Offer not found');

  const data = snap.data();
  if (data.buyerId !== uid && data.sellerId !== uid) {
    throw new Error('Unauthorized');
  }

  const message = {
    sender: uid,
    text,
    type: 'text',
    timestamp: new Date().toISOString(),
  };

  await ref.update({
    messages: admin.firestore.FieldValue.arrayUnion(message),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Submit a counter offer.
 */
async function counterOffer(offerId, uid, counterPrice) {
  const ref = db.collection(OFFERS_COL).doc(offerId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Offer not found');

  const data = snap.data();
  if (data.buyerId !== uid && data.sellerId !== uid) {
    throw new Error('Unauthorized');
  }

  const message = {
    sender: uid,
    text: `Counter offer: $${counterPrice}`,
    type: 'counter_offer',
    timestamp: new Date().toISOString(),
  };

  await ref.update({
    offeredPrice: parseFloat(counterPrice),
    status: 'negotiating',
    messages: admin.firestore.FieldValue.arrayUnion(message),
    'timeline.counteredAt': admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Accept an offer (seller accepts pending, or buyer accepts counter).
 */
async function acceptOffer(offerId, uid) {
  const ref = db.collection(OFFERS_COL).doc(offerId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Offer not found');

  const data = snap.data();
  if (data.buyerId !== uid && data.sellerId !== uid) {
    throw new Error('Unauthorized');
  }

  if (!['pending', 'negotiating'].includes(data.status)) {
    throw new Error(`Cannot accept offer with status "${data.status}"`);
  }

  const message = {
    sender: uid,
    text: 'Offer accepted!',
    type: 'system',
    timestamp: new Date().toISOString(),
  };

  await ref.update({
    status: 'accepted',
    messages: admin.firestore.FieldValue.arrayUnion(message),
    'timeline.acceptedAt': admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Reject / cancel an offer.
 */
async function rejectOffer(offerId, uid) {
  const ref = db.collection(OFFERS_COL).doc(offerId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Offer not found');

  const data = snap.data();
  if (data.buyerId !== uid && data.sellerId !== uid) {
    throw new Error('Unauthorized');
  }

  const message = {
    sender: uid,
    text: 'Offer declined.',
    type: 'system',
    timestamp: new Date().toISOString(),
  };

  await ref.update({
    status: 'cancelled',
    messages: admin.firestore.FieldValue.arrayUnion(message),
    'timeline.cancelledAt': admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Mark an accepted offer as completed.
 */
async function completeOffer(offerId, uid) {
  const ref = db.collection(OFFERS_COL).doc(offerId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Offer not found');

  const data = snap.data();
  if (data.buyerId !== uid && data.sellerId !== uid) {
    throw new Error('Unauthorized');
  }

  if (data.status !== 'accepted') {
    throw new Error('Only accepted offers can be completed');
  }

  const message = {
    sender: uid,
    text: 'Transaction completed!',
    type: 'system',
    timestamp: new Date().toISOString(),
  };

  await ref.update({
    status: 'completed',
    messages: admin.firestore.FieldValue.arrayUnion(message),
    'timeline.completedAt': admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Also mark the listing as sold (if linked)
  if (data.listingId) {
    try {
      await db.collection(LISTINGS_COL).doc(data.listingId).update({
        status: 'sold',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (_) {
      /* listing may already be deleted — ignore */
    }
  }
}

// ── Exports ────────────────────────────────────────────────────────────────────

module.exports = {
  // Listings
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  // Buyer requests
  getBuyerRequests,
  // Offers
  getMyOffers,
  getOfferById,
  createOffer,
  sendMessage,
  counterOffer,
  acceptOffer,
  rejectOffer,
  completeOffer,
  // Photo upload
  uploadPhoto,
};
