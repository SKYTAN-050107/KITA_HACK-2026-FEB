// backend/src/config/binRules.js
// Malaysia (Johor Bahru) 4-bin system — aligned with frontend wasteRules.js
//   � Blue   → Paper / Cardboard
//   🟠 Orange → Metal, Aluminum, Plastic, E-Waste
//   🟤 Brown  → Glass
//   🟢 Green  → Food / Organic Waste
//   ⚫ Black  → General Waste

const BIN_RULES = {
  green_bin: {
    id: 'green_bin',
    name: 'Green Organic Waste Bin',
    color: '#16a34a',
    symbol: '🟢',
    description: 'Food and organic waste',
    accepts: [
      'food_waste'
    ],
    rejects: [
      'plastic',
      'glass',
      'metal',
      'paper',
      'clothes',
      'electronics',
      'general_waste'
    ],
    tips: 'Bag food waste securely. Drain excess liquid. Separate from recyclables.'
  },

  blue_bin: {
    id: 'blue_bin',
    name: 'Blue Recycling Bin',
    color: '#3b82f6',
    symbol: '📄',
    description: 'Paper and cardboard',
    accepts: [
      'paper'
    ],
    rejects: [
      'plastic',
      'glass',
      'metal',
      'food_waste',
      'clothes',
      'electronics',
      'general_waste'
    ],
    tips: 'Keep paper clean and dry. Flatten cardboard boxes. No greasy or food-stained paper.'
  },

  orange_bin: {
    id: 'orange_bin',
    name: 'Orange Recycling Bin',
    color: '#ea580c',
    symbol: '⚠️',
    description: 'Metals, aluminum cans, plastics, e-waste',
    accepts: [
      'metal',
      'plastic',
      'electronics'
    ],
    rejects: [
      'glass',
      'paper',
      'food_waste',
      'clothes',
      'general_waste'
    ],
    tips: 'Remove batteries from devices. Rinse metal cans. Rinse plastic containers and remove caps.'
  },

  brown_bin: {
    id: 'brown_bin',
    name: 'Brown Recycling Bin',
    color: '#92400e',
    symbol: '🟤',
    description: 'Glass bottles and jars',
    accepts: [
      'glass'
    ],
    rejects: [
      'plastic',
      'metal',
      'paper',
      'food_waste',
      'clothes',
      'electronics',
      'general_waste'
    ],
    tips: 'Handle glass carefully. Rinse out contents. Remove metal lids. Sort by color if required.'
  },

  black_bin: {
    id: 'black_bin',
    name: 'Black General Waste Bin',
    color: '#1f2937',
    symbol: '🗑️',
    description: 'General waste and non-recyclables',
    accepts: [
      'general_waste'
    ],
    rejects: [
      'plastic',
      'glass',
      'metal',
      'paper',
      'food_waste',
      'electronics'
    ],
    tips: 'Last resort — try to recycle or donate first. Bag waste securely.'
  }
};

// Get bin information
function getBinInfo(binType) {
  return BIN_RULES[binType] || null;
}

// Validate if waste belongs in bin
function validateWasteInBin(binType, wasteType) {
  const bin = BIN_RULES[binType];
  if (!bin) {
    return {
      isValid: false,
      error: 'Unknown bin type'
    };
  }
  
  const isCorrect = bin.accepts.includes(wasteType);
  const correctBins = findCorrectBins(wasteType);
  
  return {
    isValid: true,
    isCorrect,
    message: isCorrect 
      ? `✅ Correct! ${wasteType.toUpperCase()} goes in ${bin.name}`
      : `❌ Wrong bin! ${wasteType.toUpperCase()} should go in ${correctBins[0]?.name || 'another bin'}`,
    binInfo: bin,
    correctBins,
    acceptedItems: bin.accepts,
    tips: bin.tips
  };
}

// Find which bins accept this waste type
function findCorrectBins(wasteType) {
  return Object.values(BIN_RULES)
    .filter(bin => bin.accepts.includes(wasteType))
    .map(bin => ({
      id: bin.id,
      name: bin.name,
      symbol: bin.symbol
    }));
}

// Get all bins
function getAllBins() {
  return Object.values(BIN_RULES);
}

module.exports = {
  BIN_RULES,
  getBinInfo,
  validateWasteInBin,
  findCorrectBins,
  getAllBins
};
