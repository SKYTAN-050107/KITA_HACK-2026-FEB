const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');
require('dotenv').config();

// ── Vertex AI configuration ───────────────────────────────────────────
const PROJECT_ID  = process.env.GCP_PROJECT_ID  || 'kitahack-487005';
const LOCATION    = process.env.GCP_LOCATION    || 'asia-southeast1';
const MODEL_ID    = process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash';

// Set up credential path so the SDK can authenticate
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
  __dirname, '../../service-account-key.json'
);

// Initialize Vertex AI client
const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const model = vertexAI.getGenerativeModel({ model: MODEL_ID });

// ── Valid categories ──────────────────────────────────────────────────
const VALID_WASTE_TYPES = [
  'plastic', 'glass', 'metal', 'paper',
  'food_waste', 'clothes', 'electronics', 'general_waste'
];

const VALID_BIN_TYPES = [
  'green_bin', 'blue_bin', 'orange_bin', 'black_bin'
];

// ── Prompts ───────────────────────────────────────────────────────────
const WASTE_PROMPT = `You are an expert waste classification AI for a recycling app in Johor Bahru, Malaysia.

Analyse the image and classify the dominant item into EXACTLY ONE of these waste types:
  plastic, glass, metal, paper, food_waste, clothes, electronics, general_waste

Rules:
- "plastic"       → PET bottles, HDPE containers, packaging film, plastic bags, tupperware
- "glass"         → glass bottles, jars, glass containers (NOT drinking glasses / ceramics)
- "metal"         → aluminum cans, tin cans, foil, copper wire, metal lids
- "paper"         → newspapers, cardboard, magazines, office paper, cartons
- "food_waste"    → fruit peels, cooked food, vegetable scraps, coffee grounds, food-soiled items
- "clothes"       → shirts, pants, shoes, fabric, curtains, bedsheets
- "electronics"   → phones, batteries, chargers, light bulbs, cables, circuit boards
- "general_waste" → diapers, ceramics, contaminated items, anything that doesn't fit above

Respond with ONLY the waste type keyword, nothing else. Example: plastic`;

const BIN_PROMPT = `You are an expert bin identification AI for a recycling app in Johor Bahru, Malaysia.

The Malaysia (JB) bin colour system:
- green_bin  → Bright green bin for plastics
- blue_bin   → Blue bin for paper/cardboard
- orange_bin → Orange bin for glass, metals, e-waste  
- black_bin  → Black/grey bin for general & food waste

Analyse the image. Identify the recycling/waste bin shown and classify it as EXACTLY ONE of:
  green_bin, blue_bin, orange_bin, black_bin

Consider the bin's colour, labels, markings, and any text.

Respond with ONLY the bin type keyword, nothing else. Example: green_bin`;

// ── Helper: strip data-URI prefix ─────────────────────────────────────
function stripDataUri(imageBase64) {
  return imageBase64.includes(',')
    ? imageBase64.split(',')[1]
    : imageBase64;
}

// ── Helper: detect MIME type from data URI or default ─────────────────
function getMimeType(imageBase64) {
  if (imageBase64.startsWith('data:')) {
    const match = imageBase64.match(/^data:(image\/\w+);/);
    if (match) return match[1];
  }
  return 'image/jpeg';
}

// ── Classify waste ────────────────────────────────────────────────────
/**
 * Classify waste type from image using Gemini vision model
 * @param {string} imageBase64 - Base64 encoded image (with or without data URI prefix)
 * @returns {Promise<string>} - Detected waste type
 */
async function classifyWaste(imageBase64) {
  try {
    const mimeType  = getMimeType(imageBase64);
    const imageData = stripDataUri(imageBase64);

    const request = {
      contents: [{
        role: 'user',
        parts: [
          { text: WASTE_PROMPT },
          { inlineData: { mimeType, data: imageData } }
        ]
      }]
    };

    const result   = await model.generateContent(request);
    const response = result.response;
    const raw      = response.candidates[0].content.parts[0].text.trim().toLowerCase();

    console.log('Gemini waste classification raw:', raw);

    // Validate against known types
    const wasteType = VALID_WASTE_TYPES.find(t => raw.includes(t));
    return wasteType || 'general_waste';

  } catch (error) {
    console.error('Vertex AI (waste) error:', error);
    throw new Error('Failed to classify waste: ' + error.message);
  }
}

// ── Classify bin ──────────────────────────────────────────────────────
/**
 * Classify bin type from image using Gemini vision model
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<string>} - Detected bin type
 */
async function classifyBin(imageBase64) {
  try {
    const mimeType  = getMimeType(imageBase64);
    const imageData = stripDataUri(imageBase64);

    const request = {
      contents: [{
        role: 'user',
        parts: [
          { text: BIN_PROMPT },
          { inlineData: { mimeType, data: imageData } }
        ]
      }]
    };

    const result   = await model.generateContent(request);
    const response = result.response;
    const raw      = response.candidates[0].content.parts[0].text.trim().toLowerCase();

    console.log('Gemini bin classification raw:', raw);

    // Validate against known bin types
    const binType = VALID_BIN_TYPES.find(t => raw.includes(t));
    return binType || 'black_bin';

  } catch (error) {
    console.error('Vertex AI (bin) error:', error);
    throw new Error('Failed to classify bin: ' + error.message);
  }
}

module.exports = {
  classifyWaste,
  classifyBin
};
