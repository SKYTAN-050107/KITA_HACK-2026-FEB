// src/config/wasteRules.js — Waste classification rules derived from Rules.md
// Used by ScannerPage results modal and GuidelinesPage
// Malaysia (Johor Bahru) bin system:
//   � Blue   → Paper / Cardboard
//   🟠 Orange → Metal, Aluminum, Plastic, E-Waste
//   🟤 Brown  → Glass
//   🟢 Green  → Food / Organic Waste
//   ⚫ Black  → General Waste

export const WASTE_RULES = {
  plastic: {
    displayName: 'Plastic',
    icon: '♻️',
    category: 'Recyclable',
    disposalMethod: 'recycle',
    color: '#ea580c', // orange
    shortRules: [
      'Rinse clean, remove caps',
      'Check number (#1-#7) on bottom',
      '#1 PETE & #2 HDPE = highly recyclable',
      'No food residue or grease',
    ],
    checklist: [
      { step: 'Empty and rinse the container', completed: false },
      { step: 'Remove cap and label if possible', completed: false },
      { step: 'Check plastic number (#1-#7)', completed: false },
      { step: 'Flatten to save space', completed: false },
      { step: 'Place in Orange Bin ⚠️', completed: false },
    ],
    correctBin: { id: 'orange_bin', name: 'Orange Recycling Bin', symbol: '⚠️', color: '#ea580c' },
    examples: 'Water bottles, milk jugs, detergent bottles, yogurt containers',
  },

  glass: {
    displayName: 'Glass',
    icon: '🥛',
    category: 'Recyclable',
    disposalMethod: 'recycle',
    color: '#92400e', // brown
    shortRules: [
      'Infinitely recyclable',
      'Sort by color if required',
      'Remove metal lids/caps',
      'Never break before disposal',
    ],
    checklist: [
      { step: 'Rinse out contents', completed: false },
      { step: 'Remove metal lids (recycle separately)', completed: false },
      { step: 'Sort by color: clear/green/brown', completed: false },
      { step: 'Handle carefully — do not break', completed: false },
      { step: 'Place in Brown Bin 🟤', completed: false },
    ],
    correctBin: { id: 'brown_bin', name: 'Brown Recycling Bin', symbol: '🟤', color: '#92400e' },
    examples: 'Bottles, jars (clear, green, brown)',
  },

  metal: {
    displayName: 'Metal / Aluminum',
    icon: '🥫',
    category: 'Recyclable',
    disposalMethod: 'recycle',
    color: '#ea580c', // orange
    shortRules: [
      'Valuable & energy-efficient to recycle',
      'Rinse food cans clean',
      'Crush aluminum cans to save space',
      'Remove paper labels',
    ],
    checklist: [
      { step: 'Rinse out food residue', completed: false },
      { step: 'Remove paper labels if possible', completed: false },
      { step: 'Crush aluminum cans flat', completed: false },
      { step: 'Keep aerosol cans empty (no puncture)', completed: false },
      { step: 'Place in Orange Bin ⚠️', completed: false },
    ],
    correctBin: { id: 'orange_bin', name: 'Orange Recycling Bin', symbol: '⚠️', color: '#ea580c' },
    examples: 'Aluminum cans, steel food cans, copper wire, foil',
  },

  paper: {
    displayName: 'Paper / Cardboard',
    icon: '📄',
    category: 'Recyclable',
    disposalMethod: 'recycle',
    color: '#3b82f6', // blue
    shortRules: [
      'Keep clean and dry',
      'Flatten cardboard boxes',
      'Remove plastic windows from envelopes',
      'No greasy pizza box sections',
    ],
    checklist: [
      { step: 'Ensure paper is clean (no food stains)', completed: false },
      { step: 'Remove plastic windows & staples', completed: false },
      { step: 'Flatten all cardboard boxes', completed: false },
      { step: 'Shred sensitive documents', completed: false },
      { step: 'Place in Blue Bin 📄', completed: false },
    ],
    correctBin: { id: 'blue_bin', name: 'Blue Recycling Bin', symbol: '📄', color: '#3b82f6' },
    examples: 'Newspapers, office paper, magazines, corrugated boxes, cereal cartons',
  },

  food_waste: {
    displayName: 'Food / Organic Waste',
    icon: '🥬',
    category: 'Organic Waste',
    disposalMethod: 'dispose',
    color: '#16a34a', // green
    shortRules: [
      'Goes into green organic waste bin',
      'Bag securely to prevent leaks',
      'Drain excess liquid first',
      'Separate from recyclables',
    ],
    checklist: [
      { step: 'Separate food scraps from packaging', completed: false },
      { step: 'Drain excess liquid', completed: false },
      { step: 'Bag securely', completed: false },
      { step: 'Confirm no recyclables mixed in', completed: false },
      { step: 'Place in Green Bin 🟢', completed: false },
    ],
    correctBin: { id: 'green_bin', name: 'Green Organic Waste Bin', symbol: '🟢', color: '#16a34a' },
    examples: 'Food scraps, fruit peels, cooked food, food-soiled packaging',
  },

  clothes: {
    displayName: 'Textiles / Clothing',
    icon: '👕',
    category: 'Donate',
    disposalMethod: 'donate',
    color: '#ec4899', // pink
    shortRules: [
      'Donate, reuse, or textile bin',
      'Wash clean before donation',
      'Check for wearable condition',
      'Never put in general waste',
    ],
    checklist: [
      { step: 'Wash and dry items', completed: false },
      { step: 'Check condition (wearable/repairable)', completed: false },
      { step: 'Pair shoes together', completed: false },
      { step: 'Bag separately from other waste', completed: false },
      { step: 'Take to donation center or textile bin', completed: false },
    ],
    correctBin: { id: 'donation', name: 'Donation Center', symbol: '❤️', color: '#ec4899' },
    examples: 'Old clothes, shoes, fabrics, curtains, bedsheets',
  },

  electronics: {
    displayName: 'Electronics / E-Waste',
    icon: '🔋',
    category: 'Hazardous',
    disposalMethod: 'special',
    color: '#ea580c', // orange
    shortRules: [
      'Special disposal ONLY',
      'Never in regular bins',
      'Contains toxic chemicals',
      'Find local e-waste collection events',
    ],
    checklist: [
      { step: 'Remove batteries (recycle separately)', completed: false },
      { step: 'Wipe personal data from devices', completed: false },
      { step: 'Do NOT put in regular bins', completed: false },
      { step: 'Check for local e-waste collection events', completed: false },
      { step: 'Take to Orange Bin ⚠️ or e-waste center', completed: false },
    ],
    correctBin: { id: 'orange_bin', name: 'Orange Special Waste Bin', symbol: '⚠️', color: '#ea580c' },
    examples: 'Batteries, old phones, bulbs, paint cans, chargers',
  },

  general_waste: {
    displayName: 'General Waste',
    icon: '🗑️',
    category: 'Non-Recyclable',
    disposalMethod: 'dispose',
    color: '#374151', // dark grey
    shortRules: [
      'Last resort — try recycle first',
      'Diapers & hygiene products go here',
      'Contaminated items only',
      'Bag securely to prevent leaks',
    ],
    checklist: [
      { step: 'Confirm item cannot be recycled', completed: false },
      { step: 'Confirm item cannot be donated', completed: false },
      { step: 'Bag securely to prevent leaks', completed: false },
      { step: 'Place in Black Bin 🗑️', completed: false },
    ],
    correctBin: { id: 'black_bin', name: 'Black General Waste Bin', symbol: '🗑️', color: '#1f2937' },
    examples: 'Diapers, hygiene waste, contaminated items, ceramics, broken crockery',
  },
};

// Malaysia (Johor Bahru) bin system
export const MALAYSIA_BINS = {
  blue_bin:   { name: 'Blue Recycling Bin',        color: '#3b82f6', symbol: '📄', accepts: 'Paper, cardboard, clean cartons' },
  orange_bin: { name: 'Orange Recycling Bin',      color: '#ea580c', symbol: '⚠️', accepts: 'Metals, aluminum cans, plastics, e-waste' },
  brown_bin:  { name: 'Brown Recycling Bin',       color: '#92400e', symbol: '🟤', accepts: 'Glass bottles, glass jars' },
  green_bin:  { name: 'Green Organic Waste Bin',   color: '#16a34a', symbol: '🟢', accepts: 'Food waste, organic waste' },
  black_bin:  { name: 'Black General Waste Bin',   color: '#1f2937', symbol: '🗑️', accepts: 'General waste, diapers, hygiene products, non-recyclables' },
};

export default WASTE_RULES;
