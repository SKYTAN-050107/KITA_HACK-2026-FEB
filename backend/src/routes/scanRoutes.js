// backend/src/routes/scanRoutes.js

const express = require('express');
const router = express.Router();
const { classifyWaste } = require('../services/visionAI');
const { findCorrectBins } = require('../config/binRules');

/**
 * POST /api/scan
 * Waste scanning endpoint — classifies waste via AutoML model
 */
router.post('/', async (req, res) => {
  try {
    const { image } = req.body;

    // Validate input
    if (!image) {
      return res.status(400).json({
        error: 'Image is required'
      });
    }

    // Classify waste using AutoML endpoint
    const { wasteType, confidence, rawLabel } = await classifyWaste(image);
    const correctBins = findCorrectBins(wasteType);

    return res.json({
      success: true,
      scanMode: 'waste',
      result: {
        wasteType,
        confidence,
        rawLabel,
        displayName: formatWasteName(wasteType),
        correctBins,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      error: 'Scan failed',
      message: error.message
    });
  }
});

/**
 * Helper: Format waste type for display
 */
function formatWasteName(wasteType) {
  const names = {
    plastic: 'Plastic',
    glass: 'Glass',
    metal: 'Metal/Aluminum',
    paper: 'Paper/Cardboard',
    food_waste: 'Food Waste',
    clothes: 'Textiles/Clothes',
    electronics: 'Electronics',
    general_waste: 'General Waste'
  };
  return names[wasteType] || wasteType;
}

module.exports = router;
