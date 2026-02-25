// backend/src/config/wasteRulesBackend.js — Waste rules, label mapping, and estimated weights
// Backend mirror of frontend wasteRules.js + additional backend-only fields

/**
 * Maps Gemini model labels → canonical waste types used in WASTE_RULES
 * Gemini may return verbose labels; this normalizes them.
 */
const MODEL_TO_WASTE_TYPE = {
    plastic_bottle: 'plastic',
    plastic_bag: 'plastic',
    plastic_container: 'plastic',
    pet_bottle: 'plastic',
    hdpe_container: 'plastic',
    soda_can: 'metal',
    aluminum_can: 'metal',
    tin_can: 'metal',
    metal_scrap: 'metal',
    foil: 'metal',
    cardboard_box: 'paper',
    newspaper: 'paper',
    magazine: 'paper',
    office_paper: 'paper',
    carton: 'paper',
    glass_bottle: 'glass',
    glass_jar: 'glass',
    glass_container: 'glass',
    apple_core: 'food_waste',
    banana_peel: 'food_waste',
    food_scraps: 'food_waste',
    cooked_food: 'food_waste',
    old_phone: 'electronics',
    battery: 'electronics',
    charger: 'electronics',
    light_bulb: 'electronics',
    cable: 'electronics',
    circuit_board: 'electronics',
    shirt: 'clothes',
    pants: 'clothes',
    shoes: 'clothes',
    fabric: 'clothes',
    textiles: 'clothes',
    diaper: 'general_waste',
    ceramics: 'general_waste',
    styrofoam: 'general_waste',
};

/**
 * Estimated weight per waste type (kg) — used for impactKg calculation
 * Replaces the random 0.15–0.50 previously used on frontend
 */
const ESTIMATED_WEIGHTS = {
    plastic: 0.15,
    glass: 0.35,
    metal: 0.02,
    paper: 0.40,
    food_waste: 0.25,
    clothes: 0.50,
    electronics: 0.30,
    general_waste: 0.20,
};

/**
 * CO2 savings factor per kg diverted from landfill (approximate)
 */
const CO2_FACTOR = 0.9; // kg CO2 saved per kg recycled

/**
 * Backend waste rules — disposal info, short rules, and checklists
 * Mirrors frontend wasteRules.js structure
 */
const WASTE_RULES = {
    plastic: {
        displayName: 'Plastic',
        icon: '♻️',
        category: 'Recyclable',
        disposalMethod: 'recycle',
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
            { step: 'Place in Green Bin ♻️', completed: false },
        ],
        correctBin: { id: 'green_bin', name: 'Green Recycling Bin', symbol: '♻️', color: '#16a34a' },
    },
    glass: {
        displayName: 'Glass',
        icon: '🥛',
        category: 'Recyclable',
        disposalMethod: 'recycle',
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
            { step: 'Place in Orange Bin ⚠️', completed: false },
        ],
        correctBin: { id: 'orange_bin', name: 'Orange Recycling Bin', symbol: '⚠️', color: '#ea580c' },
    },
    metal: {
        displayName: 'Metal / Aluminum',
        icon: '🥫',
        category: 'Recyclable',
        disposalMethod: 'recycle',
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
    },
    paper: {
        displayName: 'Paper / Cardboard',
        icon: '📄',
        category: 'Recyclable',
        disposalMethod: 'recycle',
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
    },
    food_waste: {
        displayName: 'Food / Organic Waste',
        icon: '🥬',
        category: 'General Waste',
        disposalMethod: 'dispose',
        shortRules: [
            'Goes into black/grey general bin',
            'Bag securely to prevent leaks',
            'Drain excess liquid first',
            'Separate from recyclables',
        ],
        checklist: [
            { step: 'Separate food scraps from packaging', completed: false },
            { step: 'Drain excess liquid', completed: false },
            { step: 'Bag securely', completed: false },
            { step: 'Confirm no recyclables mixed in', completed: false },
            { step: 'Place in Black Bin 🗑️', completed: false },
        ],
        correctBin: { id: 'black_bin', name: 'Black General Waste Bin', symbol: '🗑️', color: '#1f2937' },
    },
    clothes: {
        displayName: 'Textiles / Clothing',
        icon: '👕',
        category: 'Donate',
        disposalMethod: 'donate',
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
    },
    electronics: {
        displayName: 'Electronics / E-Waste',
        icon: '🔋',
        category: 'Hazardous',
        disposalMethod: 'special',
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
    },
    general_waste: {
        displayName: 'General Waste',
        icon: '🗑️',
        category: 'Non-Recyclable',
        disposalMethod: 'dispose',
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
    },
};

module.exports = {
    MODEL_TO_WASTE_TYPE,
    ESTIMATED_WEIGHTS,
    CO2_FACTOR,
    WASTE_RULES,
};
