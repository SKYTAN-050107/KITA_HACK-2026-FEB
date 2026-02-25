const { PredictionServiceClient } = require('@google-cloud/aiplatform').v1;
const { helpers } = require('@google-cloud/aiplatform');
const path = require('path');
require('dotenv').config();

// ── Vertex AI configuration ───────────────────────────────────────────
const PROJECT_ID  = process.env.GCP_PROJECT_ID  || 'kitahack-487005';
const LOCATION    = process.env.GCP_LOCATION    || 'europe-west4';
const ENDPOINT_ID = process.env.VERTEX_ENDPOINT_ID || '7802070739024084992';
const API_ENDPOINT = `${LOCATION}-aiplatform.googleapis.com`;

const ENDPOINT_PATH = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;

// Initialize Prediction client
const client = new PredictionServiceClient({
  apiEndpoint: API_ENDPOINT,
  keyFilename: path.resolve(__dirname, '../../service-account-key.json'),
});

// ── Label mapping: AutoML label → app waste type ──────────────────────
const LABEL_MAP = {
  plastic:    'plastic',
  glass:      'glass',
  metal:      'metal',
  paper:      'paper',
  cardboard:  'paper',      // cardboard maps to paper category
  clothing:   'clothes',
  others:     'general_waste',
};

/**
 * Classify waste type from image using AutoML Image Classification endpoint
 * @param {string} imageBase64 - Base64 encoded image (with or without data URI prefix)
 * @returns {Promise<{ wasteType: string, confidence: number, rawLabel: string }>}
 */
async function classifyWaste(imageBase64) {
  try {
    // Strip data URI prefix if present
    const base64Image = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    // Build prediction request
    const instance = helpers.toValue({ content: base64Image });

    const [response] = await client.predict({
      endpoint: ENDPOINT_PATH,
      instances: [instance],
    });

    if (!response.predictions || response.predictions.length === 0) {
      console.warn('AutoML returned no predictions, defaulting to general_waste');
      return { wasteType: 'general_waste', confidence: 0, rawLabel: 'none' };
    }

    // Parse prediction — AutoML Image Classification returns:
    // { displayNames: [...], confidences: [...], ids: [...] }
    const prediction = helpers.fromValue(response.predictions[0]);

    const displayNames = prediction.displayNames || [];
    const confidences  = prediction.confidences  || [];

    console.log('AutoML prediction:', displayNames.map((n, i) => `${n}: ${(confidences[i] * 100).toFixed(1)}%`).join(', '));

    // Find highest confidence label
    let bestIdx = 0;
    let bestConf = 0;
    for (let i = 0; i < confidences.length; i++) {
      if (confidences[i] > bestConf) {
        bestConf = confidences[i];
        bestIdx = i;
      }
    }

    const rawLabel = (displayNames[bestIdx] || 'others').toLowerCase();
    const wasteType = LABEL_MAP[rawLabel] || 'general_waste';

    return {
      wasteType,
      confidence: bestConf,
      rawLabel,
    };

  } catch (error) {
    console.error('AutoML prediction error:', error);
    throw new Error('Failed to classify waste: ' + error.message);
  }
}

module.exports = { classifyWaste };
