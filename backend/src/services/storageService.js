// backend/src/services/storageService.js — GCS image upload/delete for scan images

const { bucket } = require('../config/firebaseAdmin');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Signed URL valid for ~10 years (effectively permanent for an app)
const SIGNED_URL_EXPIRY_MS = 10 * 365 * 24 * 60 * 60 * 1000;

/**
 * Upload a scan image to GCS and return a signed download URL.
 * Uses V2 getSignedUrl() — works regardless of bucket access control mode
 * and does not require makePublic() or Firebase Storage security rules.
 * @param {string} base64Data - Base64 string (with or without data URI prefix)
 * @param {string} uid - User ID (used as folder path)
 * @param {string} scanId - Scan document ID (used as filename)
 * @returns {Promise<string>} Signed download URL of the uploaded image
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
        contentType: 'image/jpeg',
        metadata: {
            cacheControl: 'public, max-age=31536000',
        },
    });

    // V2 signed URL — signed locally using the service-account key,
    // no IAM API call needed, no bucket-level public access required.
    const [imageUrl] = await file.getSignedUrl({
        version: 'v2',
        action: 'read',
        expires: Date.now() + SIGNED_URL_EXPIRY_MS,
    });

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
