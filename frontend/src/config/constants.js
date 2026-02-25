// src/config/constants.js

export const SCAN_INTERVAL = 2000; // 2 seconds

export const CAMERA_CONSTRAINTS = {
  video: {
    facingMode: 'environment', // Rear camera
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
};
