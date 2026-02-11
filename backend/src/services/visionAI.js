// backend/src/services/visionAI.js

const vision = require('@google-cloud/vision');
require('dotenv').config();

// Initialize Vision API client
const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

/**
 * Classify waste type from image
 * @param {string} imageBase64 - Base64 encoded image (with or without data URI prefix)
 * @returns {Promise<string>} - Detected waste type
 */
async function classifyWaste(imageBase64) {
  try {
    // Remove data URI prefix if present
    const base64Image = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;
    
    // Prepare image for Vision API
    const image = {
      content: base64Image
    };
    
    // Call Vision API for label detection
    const [result] = await client.labelDetection(image);
    const labels = result.labelAnnotations;
    
    if (!labels || labels.length === 0) {
      return 'general_waste'; // Fallback
    }
    
    // Extract label descriptions (lowercase for matching)
    const detectedLabels = labels.map(label => ({
      description: label.description.toLowerCase(),
      score: label.score
    }));
    
    console.log('Detected labels:', detectedLabels);
    
    // Map Vision API labels to waste categories
    const wasteType = mapLabelsToWasteType(detectedLabels);
    
    return wasteType;
    
  } catch (error) {
    console.error('Vision API Error:', error);
    throw new Error('Failed to classify waste');
  }
}

/**
 * Classify bin type from image
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<string>} - Detected bin type
 */
async function classifyBin(imageBase64) {
  try {
    const base64Image = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;
    
    const image = { content: base64Image };
    
    // Detect colors, labels, and text
    const [labelResult] = await client.labelDetection(image);
    const [colorResult] = await client.imageProperties(image);
    const [textResult] = await client.textDetection(image);
    
    // Extract information
    const labels = labelResult.labelAnnotations?.map(l => l.description.toLowerCase()) || [];
    const text = textResult.textAnnotations?.[0]?.description.toLowerCase() || '';
    const dominantColors = colorResult.imagePropertiesAnnotation?.dominantColors?.colors || [];
    
    console.log('Bin detection - Labels:', labels);
    console.log('Bin detection - Text:', text);
    console.log('Bin detection - Top color:', dominantColors[0]?.color);
    
    // Identify bin by color and context
    const binType = identifyBinType(dominantColors, labels, text);
    
    return binType;
    
  } catch (error) {
    console.error('Bin classification error:', error);
    throw new Error('Failed to classify bin');
  }
}

/**
 * Map Vision API labels to waste types
 */
function mapLabelsToWasteType(labels) {
  const labelDescriptions = labels.map(l => l.description);
  
  // Plastic detection
  if (labelDescriptions.some(l => 
    l.includes('plastic') || 
    l.includes('bottle') || 
    l.includes('container') ||
    l.includes('packaging') ||
    l.includes('pet bottle')
  )) {
    return 'plastic';
  }
  
  // Glass detection
  if (labelDescriptions.some(l => 
    l.includes('glass') || 
    l.includes('jar') || 
    l.includes('wine bottle') ||
    l.includes('beer bottle')
  )) {
    return 'glass';
  }
  
  // Metal/Aluminum detection
  if (labelDescriptions.some(l => 
    l.includes('metal') || 
    l.includes('aluminum') || 
    l.includes('tin') ||
    l.includes('can') ||
    l.includes('beverage can')
  )) {
    return 'metal';
  }
  
  // Paper detection
  if (labelDescriptions.some(l => 
    l.includes('paper') || 
    l.includes('cardboard') || 
    l.includes('newspaper') ||
    l.includes('magazine') ||
    l.includes('box')
  )) {
    return 'paper';
  }
  
  // Food waste detection
  if (labelDescriptions.some(l => 
    l.includes('food') || 
    l.includes('fruit') || 
    l.includes('vegetable') ||
    l.includes('organic') ||
    l.includes('peel')
  )) {
    return 'food_waste';
  }
  
  // Clothes/Textile detection
  if (labelDescriptions.some(l => 
    l.includes('clothing') || 
    l.includes('textile') || 
    l.includes('fabric') ||
    l.includes('shirt') ||
    l.includes('pants')
  )) {
    return 'clothes';
  }
  
  // Electronics detection
  if (labelDescriptions.some(l => 
    l.includes('electronic') || 
    l.includes('gadget') || 
    l.includes('phone') ||
    l.includes('battery') ||
    l.includes('device')
  )) {
    return 'electronics';
  }
  
  // Default fallback
  return 'general_waste';
}

/**
 * Identify bin type from colors and context
 */
function identifyBinType(colors, labels, text) {
  if (!colors || colors.length === 0) {
    return 'black_bin'; // Default
  }
  
  const dominantColor = colors[0].color;
  const { red = 0, green = 0, blue = 0 } = dominantColor;
  
  // Text-based detection (most reliable)
  if (text.includes('recycle') || text.includes('recycling')) {
    return 'blue_bin';
  }
  if (text.includes('compost') || text.includes('organic')) {
    return 'brown_bin';
  }
  if (text.includes('hazard') || text.includes('electronic')) {
    return 'orange_bin';
  }
  if (text.includes('general') || text.includes('waste')) {
    return 'black_bin';
  }
  
  // Label-based detection
  if (labels.some(l => l.includes('recycling') || l.includes('recycle'))) {
    return 'blue_bin';
  }
  
  // Color-based detection
  // Blue bin (high blue, low red/green)
  if (blue > 150 && blue > red + 30 && blue > green + 30) {
    return 'blue_bin';
  }
  
  // Brown bin (balanced warm tones)
  if (red > 100 && green > 80 && blue < 100 && Math.abs(red - green) < 40) {
    return 'brown_bin';
  }
  
  // Orange bin (high red, medium green, low blue)
  if (red > 150 && green > 80 && green < red - 20 && blue < 100) {
    return 'orange_bin';
  }
  
  // Black/dark bin (all values low)
  if (red < 80 && green < 80 && blue < 80) {
    return 'black_bin';
  }
  
  // Default fallback
  return 'black_bin';
}

module.exports = {
  classifyWaste,
  classifyBin
};
