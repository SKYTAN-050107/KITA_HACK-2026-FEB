// backend/src/routes/marketplaceRoutes.js — Marketplace API routes
//
// Exports TWO routers:
//   publicRouter   → mount at /api/marketplace       (no auth)
//   protectedRouter → mount at /api/v1/marketplace   (behind authMiddleware)

const express = require('express');
const marketplace = require('../services/marketplaceService');

// ════════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTER — no authentication required
// ════════════════════════════════════════════════════════════════════════════════

const publicRouter = express.Router();

/**
 * GET /api/marketplace/listings
 * Browse all active listings with optional filters.
 * Query params: wasteType, minPrice, maxPrice, sortBy
 */
publicRouter.get('/listings', async (req, res) => {
  try {
    const { wasteType, minPrice, maxPrice, sortBy } = req.query;
    const listings = await marketplace.getListings({
      wasteType,
      minPrice,
      maxPrice,
      sortBy,
    });
    res.json({ success: true, listings });
  } catch (err) {
    console.error('GET /marketplace/listings error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/marketplace/listings/:listingId
 * Get a single listing by ID (public view).
 */
publicRouter.get('/listings/:listingId', async (req, res) => {
  try {
    const listing = await marketplace.getListingById(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }
    res.json({ success: true, listing });
  } catch (err) {
    console.error('GET /marketplace/listings/:id error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/marketplace/requests
 * Browse active buyer requests with optional filters.
 * Query params: wasteType, minPrice, maxPrice
 */
publicRouter.get('/requests', async (req, res) => {
  try {
    const { wasteType, minPrice, maxPrice } = req.query;
    const requests = await marketplace.getBuyerRequests({
      wasteType,
      minPrice,
      maxPrice,
    });
    res.json({ success: true, requests });
  } catch (err) {
    console.error('GET /marketplace/requests error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════════
// PROTECTED ROUTER — requires authMiddleware (req.user.uid available)
// ════════════════════════════════════════════════════════════════════════════════

const protectedRouter = express.Router();

// ── Listings CRUD ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/marketplace/listings
 * Create a new listing.
 */
protectedRouter.post('/listings', async (req, res) => {
  try {
    const listingId = await marketplace.createListing(req.user.uid, req.body);
    res.status(201).json({ success: true, listingId });
  } catch (err) {
    console.error('POST /marketplace/listings error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/v1/marketplace/listings/:listingId
 * Update an existing listing (owner only).
 */
protectedRouter.patch('/listings/:listingId', async (req, res) => {
  try {
    const listingId = await marketplace.updateListing(
      req.params.listingId,
      req.user.uid,
      req.body
    );
    res.json({ success: true, listingId });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return res.status(403).json({ success: false, error: 'You can only edit your own listings' });
    }
    if (err.message === 'Listing not found') {
      return res.status(404).json({ success: false, error: err.message });
    }
    console.error('PATCH /marketplace/listings/:id error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/marketplace/listings/:listingId
 * Delete a listing (owner only).
 */
protectedRouter.delete('/listings/:listingId', async (req, res) => {
  try {
    await marketplace.deleteListing(req.params.listingId, req.user.uid);
    res.json({ success: true });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return res.status(403).json({ success: false, error: 'You can only delete your own listings' });
    }
    if (err.message === 'Listing not found') {
      return res.status(404).json({ success: false, error: err.message });
    }
    console.error('DELETE /marketplace/listings/:id error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/marketplace/my-listings
 * Get current user's listings, optional ?status= filter.
 */
protectedRouter.get('/my-listings', async (req, res) => {
  try {
    const listings = await marketplace.getMyListings(req.user.uid, req.query.status);
    res.json({ success: true, listings });
  } catch (err) {
    console.error('GET /marketplace/my-listings error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Offers ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/marketplace/my-offers
 * Get all offers for the current user (as buyer + as seller).
 */
protectedRouter.get('/my-offers', async (req, res) => {
  try {
    const { offersAsBuyer, offersAsSeller, allOffers } = await marketplace.getMyOffers(
      req.user.uid
    );
    res.json({ success: true, offersAsBuyer, offersAsSeller, allOffers });
  } catch (err) {
    console.error('GET /marketplace/my-offers error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/marketplace/offers
 * Create a new offer on a listing or buyer request.
 */
protectedRouter.post('/offers', async (req, res) => {
  try {
    const offerId = await marketplace.createOffer(req.user.uid, req.body);
    res.status(201).json({ success: true, offerId });
  } catch (err) {
    console.error('POST /marketplace/offers error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/marketplace/offers/:offerId
 * Get a single offer detail (buyer or seller only).
 */
protectedRouter.get('/offers/:offerId', async (req, res) => {
  try {
    const offer = await marketplace.getOfferById(req.params.offerId, req.user.uid);
    res.json({ success: true, offer });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    if (err.message === 'Offer not found') {
      return res.status(404).json({ success: false, error: err.message });
    }
    console.error('GET /marketplace/offers/:id error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/marketplace/offers/:offerId/message
 * Send a message in the offer thread.
 */
protectedRouter.post('/offers/:offerId/message', async (req, res) => {
  try {
    await marketplace.sendMessage(req.params.offerId, req.user.uid, req.body.text);
    res.json({ success: true });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    console.error('POST /offers/:id/message error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/marketplace/offers/:offerId/counter
 * Submit a counter offer.
 */
protectedRouter.post('/offers/:offerId/counter', async (req, res) => {
  try {
    await marketplace.counterOffer(
      req.params.offerId,
      req.user.uid,
      req.body.counterPrice
    );
    res.json({ success: true });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    console.error('POST /offers/:id/counter error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/marketplace/offers/:offerId/accept
 * Accept an offer.
 */
protectedRouter.post('/offers/:offerId/accept', async (req, res) => {
  try {
    await marketplace.acceptOffer(req.params.offerId, req.user.uid);
    res.json({ success: true });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    console.error('POST /offers/:id/accept error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/marketplace/offers/:offerId/reject
 * Reject / cancel an offer.
 */
protectedRouter.post('/offers/:offerId/reject', async (req, res) => {
  try {
    await marketplace.rejectOffer(req.params.offerId, req.user.uid);
    res.json({ success: true });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    console.error('POST /offers/:id/reject error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/marketplace/offers/:offerId/complete
 * Mark an accepted offer as completed.
 */
protectedRouter.post('/offers/:offerId/complete', async (req, res) => {
  try {
    await marketplace.completeOffer(req.params.offerId, req.user.uid);
    res.json({ success: true });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    console.error('POST /offers/:id/complete error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Export both routers ────────────────────────────────────────────────────────

module.exports = { publicRouter, protectedRouter };
