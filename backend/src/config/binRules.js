// backend/src/config/binRules.js

const BIN_RULES = {
  blue_bin: {
    id: 'blue_bin',
    name: 'Blue Recycling Bin',
    color: 'Blue',
    symbol: '♻️',
    description: 'Clean recyclable materials',
    accepts: [
      'plastic',
      'glass',
      'metal',
      'aluminum',
      'tin',
      'carton',
      'tetra_pak'
    ],
    rejects: [
      'food_waste',
      'paper',
      'clothes',
      'electronics',
      'batteries',
      'general_waste'
    ],
    tips: 'Rinse containers before recycling'
  },
  
  brown_bin: {
    id: 'brown_bin',
    name: 'Brown Organic Bin',
    color: 'Brown',
    symbol: '🍂',
    description: 'Organic and compostable waste',
    accepts: [
      'food_waste',
      'fruit_peels',
      'vegetable_scraps',
      'garden_waste',
      'leaves',
      'paper'
    ],
    rejects: [
      'plastic',
      'glass',
      'metal',
      'clothes',
      'electronics'
    ],
    tips: 'No plastic bags, even biodegradable ones'
  },
  
  orange_bin: {
    id: 'orange_bin',
    name: 'Orange Special Waste Bin',
    color: 'Orange',
    symbol: '⚠️',
    description: 'Hazardous and electronic waste',
    accepts: [
      'electronics',
      'batteries',
      'light_bulbs',
      'chemicals',
      'paint',
      'oil'
    ],
    rejects: [
      'food_waste',
      'plastic',
      'paper',
      'glass',
      'general_waste'
    ],
    tips: 'Handle with care, check local guidelines'
  },
  
  black_bin: {
    id: 'black_bin',
    name: 'Black General Waste Bin',
    color: 'Black',
    symbol: '🗑️',
    description: 'Non-recyclable general waste',
    accepts: [
      'general_waste',
      'contaminated_items',
      'diapers',
      'ceramics',
      'broken_glass'
    ],
    rejects: [
      'recyclables',
      'food_waste',
      'electronics',
      'batteries'
    ],
    tips: 'Last resort - try to recycle or compost first'
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
