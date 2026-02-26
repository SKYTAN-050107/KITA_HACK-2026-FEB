// backend/src/config/firebaseAdmin.js — Firebase Admin SDK initialization

const admin = require('firebase-admin');
const path = require('path');

// Path to the service account key (already exists in project root)
const serviceAccountPath = path.resolve(__dirname, '../../service-account-key.json');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath)),
        storageBucket: 'kitahack-487005.firebasestorage.app',
    });
}

// Firestore instance
const db = admin.firestore();

// Cloud Storage bucket
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
