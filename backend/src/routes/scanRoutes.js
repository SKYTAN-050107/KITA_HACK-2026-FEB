// backend/src/routes/scanRoutes.js

const express = require('express');
const router = express.Router();
const { classifyWaste, classifyBin } = require('../services/visionAI');
const { validateWasteInBin, getBinInfo, findCorrectBins } = require('../config/binRules');

/**
 * POST /api/scan
 * Main scanning endpoint - handles both waste and bin scanning
 */
router.post('/', async (req, res) => {
  try {
    const { image, scanMode } = req.body;
    
    // Validate input
    if (!image) {
      return res.status(400).json({ 
        error: 'Image is required' 
      });
    }
    
    if (!scanMode || !['waste', 'bin'].includes(scanMode)) {
      return res.status(400).json({ 
        error: 'scanMode must be "waste" or "bin"' 
      });
    }
    
    // Process based on scan mode
    if (scanMode === 'waste') {
      const wasteType = await classifyWaste(image);
      const correctBins = findCorrectBins(wasteType);
      
      return res.json({
        success: true,
        scanMode: 'waste',
        result: {
          wasteType,
          displayName: formatWasteName(wasteType),
          correctBins,
          timestamp: new Date().toISOString()
        }
      });
    } 
    
    else if (scanMode === 'bin') {
      const binType = await classifyBin(image);
      const binInfo = getBinInfo(binType);
      
      return res.json({
        success: true,
        scanMode: 'bin',
        result: {
          binType,
          binInfo,
          timestamp: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ 
      error: 'Scan failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/validate
 * Validate if waste belongs in scanned bin
 */
router.post('/validate', async (req, res) => {
  try {
    const { binType, wasteType } = req.body;
    
    if (!binType || !wasteType) {
      return res.status(400).json({ 
        error: 'binType and wasteType are required' 
      });
    }
    
    const validation = validateWasteInBin(binType, wasteType);
    
    return res.json({
      success: true,
      validation
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ 
      error: 'Validation failed',
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
