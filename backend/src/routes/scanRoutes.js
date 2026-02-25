// backend/src/routes/scanRoutes.js — Public scan endpoint (no auth required)

const express = require('express');
const router = express.Router();
const { classifyWaste } = require('../services/visionAI');
const { findCorrectBins } = require('../config/binRules');
const { WASTE_RULES, MODEL_TO_WASTE_TYPE } = require('../config/wasteRulesBackend');
const crypto = require('crypto');

/**
 * POST /api/scan
 * Waste scanning endpoint — classifies waste via Vertex AI
 * Returns: wasteType, confidence, rules, checklist, correctBin, imageHash
 */
router.post('/', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Classify waste
    const { wasteType: rawType, confidence, rawLabel } = await classifyWaste(image);

    // Apply label mapping (normalize Gemini labels → canonical types)
    const wasteType = MODEL_TO_WASTE_TYPE[rawType] || rawType || 'general_waste';

    // Low confidence → fallback to general_waste
    const finalWasteType = (confidence !== null && confidence < 0.6) ? 'general_waste' : wasteType;
    const isLowConfidence = confidence !== null && confidence < 0.6;

    // Get rule data
    const ruleData = WASTE_RULES[finalWasteType] || WASTE_RULES.general_waste;
    const correctBins = findCorrectBins(finalWasteType);

    // Image hash for deduplication
    const imageHash = crypto.createHash('md5')
      .update(image.slice(0, 1000)) // hash first 1KB for speed
      .digest('hex');

    return res.json({
      success: true,
      scanMode: 'waste',
      result: {
        wasteType: finalWasteType,
        confidence: confidence !== null ? parseFloat(confidence.toFixed(3)) : null,
        rawLabel: rawLabel || rawType,
        displayName: ruleData.displayName,
        icon: ruleData.icon,
        category: ruleData.category,
        disposalMethod: ruleData.disposalMethod,
        correctBin: ruleData.correctBin,
        correctBins,
        shortRules: ruleData.shortRules,
        checklist: ruleData.checklist,
        imageHash,
        isLowConfidence,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      error: 'Scan failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/scan/validate
 * Validate if a waste type belongs in a given bin.
 */
router.post('/validate', async (req, res) => {
  try {
    const { wasteType, binType } = req.body;

    if (!wasteType || !binType) {
      return res.status(400).json({ error: 'wasteType and binType are required' });
    }

    const correctBins = findCorrectBins(wasteType);
    const isCorrect = correctBins.some(b => b.type === binType);

    res.json({
      success: true,
      wasteType,
      binType,
      isCorrect,
      correctBins,
    });
  } catch (error) {
    console.error('Validate error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

module.exports = router;
