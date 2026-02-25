// src/config/wasteRules.js — Waste classification rules derived from Rules.md
// Used by ScannerPage results modal and GuidelinesPage

export const WASTE_RULES = {
  plastic: {
    displayName: 'Plastic',
    icon: '♻️',
    category: 'Recyclable',
    disposalMethod: 'recycle',
    color: '#3b82f6', // blue
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
      { step: 'Place in Blue Bin ♻️', completed: false },
    ],
    correctBin: { id: 'blue_bin', name: 'Blue Recycling Bin', symbol: '♻️', color: '#3b82f6' },
    examples: 'Water bottles, milk jugs, detergent bottles, yogurt containers',
  },
  glass: {
    displayName: 'Glass',
    icon: '🥛',
    category: 'Recyclable',
    disposalMethod: 'recycle',
    color: '#10b981', // green
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
      { step: 'Place in Blue Bin ♻️', completed: false },
    ],
    correctBin: { id: 'blue_bin', name: 'Blue Recycling Bin', symbol: '♻️', color: '#3b82f6' },
    examples: 'Bottles, jars (clear, green, brown), windows',
  },
  metal: {
    displayName: 'Metal / Aluminum',
    icon: '🥫',
    category: 'Recyclable',
    disposalMethod: 'recycle',
    color: '#6366f1', // indigo
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
      { step: 'Place in Blue Bin ♻️', completed: false },
    ],
    correctBin: { id: 'blue_bin', name: 'Blue Recycling Bin', symbol: '♻️', color: '#3b82f6' },
    examples: 'Aluminum cans, steel food cans, copper wire, foil',
  },
  paper: {
    displayName: 'Paper / Cardboard',
    icon: '📄',
    category: 'Recyclable',
    disposalMethod: 'recycle',
    color: '#f59e0b', // amber
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
      { step: 'Place in Blue Bin ♻️', completed: false },
    ],
    correctBin: { id: 'blue_bin', name: 'Blue Recycling Bin', symbol: '♻️', color: '#3b82f6' },
    examples: 'Newspapers, office paper, magazines, corrugated boxes, cereal cartons',
  },
  food_waste: {
    displayName: 'Food / Organic Waste',
    icon: '🥬',
    category: 'Compostable',
    disposalMethod: 'compost',
    color: '#92400e', // brown
    shortRules: [
      'Compost when possible',
      'No meat/dairy in home compost',
      'Yard waste → green bin or facility',
      'Reduces landfill methane',
    ],
    checklist: [
      { step: 'Separate food scraps from packaging', completed: false },
      { step: 'No plastic bags (even biodegradable)', completed: false },
      { step: 'Drain excess liquid', completed: false },
      { step: 'Yard waste: bag separately', completed: false },
      { step: 'Place in Brown Bin 🍂', completed: false },
    ],
    correctBin: { id: 'brown_bin', name: 'Brown Organic Bin', symbol: '🍂', color: '#92400e' },
    examples: 'Food scraps, fruit peels, yard waste, garden cuttings',
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
    color: '#ef4444', // red
    shortRules: [
      'Special disposal ONLY',
      'Never in regular bins',
      'Contains toxic chemicals',
      'Find local e-waste events',
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
    color: '#6b7280', // gray
    shortRules: [
      'Last resort — try recycle/compost first',
      'Diapers, hygiene products here',
      'Contaminated items only',
      'Reduce what ends up here',
    ],
    checklist: [
      { step: 'Confirm item cannot be recycled', completed: false },
      { step: 'Confirm item cannot be composted', completed: false },
      { step: 'Bag securely to prevent leaks', completed: false },
      { step: 'Place in Black Bin 🗑️', completed: false },
    ],
    correctBin: { id: 'black_bin', name: 'Black General Waste Bin', symbol: '🗑️', color: '#1f2937' },
    examples: 'Diapers, hygiene waste, contaminated items, ceramics',
  },
};

// Malaysia (Johor Bahru) bin info — matches Rules.md
export const MALAYSIA_BINS = {
  blue_bin: { name: 'Blue Recycling Bin', color: '#3b82f6', symbol: '♻️', accepts: 'Paper, plastics #1-2-5, clean cartons' },
  brown_bin: { name: 'Brown Organic Bin', color: '#92400e', symbol: '🍂', accepts: 'Food waste, garden waste' },
  orange_bin: { name: 'Orange Special Bin', color: '#ea580c', symbol: '⚠️', accepts: 'Glass, metals, aluminum cans, e-waste' },
  black_bin: { name: 'Black General Bin', color: '#1f2937', symbol: '🗑️', accepts: 'Non-recyclables, diapers, hygiene waste' },
};

export default WASTE_RULES;
