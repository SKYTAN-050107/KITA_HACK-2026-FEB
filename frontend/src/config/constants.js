// src/config/constants.js

export const SCAN_INTERVAL = 2000; // 2 seconds

export const CAMERA_CONSTRAINTS = {
  video: {
    facingMode: 'environment', // Rear camera
    width: { ideal: 1920 },    // Request max from hardware for highest-quality source
    height: { ideal: 1080 },
  }
};
