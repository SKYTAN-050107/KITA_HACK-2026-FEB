// backend/src/services/storageService.js — GCS image upload/delete for scan images

const { bucket } = require('../config/firebaseAdmin');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload a scan image to GCS.
 * @param {string} base64Data - Base64 string (with or without data URI prefix)
 * @param {string} uid - User ID (used as folder path)
 * @param {string} scanId - Scan document ID (used as filename)
 * @returns {Promise<string>} Public URL of the uploaded image
 */
async function uploadScanImage(base64Data, uid, scanId) {
    // Strip data URI prefix if present
    const raw = base64Data.includes(',')
        ? base64Data.split(',')[1]
        : base64Data;

    const buffer = Buffer.from(raw, 'base64');

    // Validate size
    if (buffer.length > MAX_FILE_SIZE) {
        throw new Error(`Image exceeds 5MB limit (${(buffer.length / 1024 / 1024).toFixed(2)}MB)`);
    }

    const filePath = `scans/${uid}/${scanId}.jpg`;
    const file = bucket.file(filePath);

    await file.save(buffer, {
        metadata: {
            contentType: 'image/jpeg',
            cacheControl: 'public, max-age=31536000', // 1 year cache
        },
        public: true,
    });

    // Public URL
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    return imageUrl;
}

/**
 * Delete a scan image from GCS.
 * @param {string} uid - User ID
 * @param {string} scanId - Scan document ID
 */
async function deleteScanImage(uid, scanId) {
    const filePath = `scans/${uid}/${scanId}.jpg`;
    const file = bucket.file(filePath);
    try {
        await file.delete();
    } catch (err) {
        // Ignore 404 — file may not exist
        if (err.code !== 404) throw err;
    }
}

module.exports = { uploadScanImage, deleteScanImage };
