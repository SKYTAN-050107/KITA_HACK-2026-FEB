// src/config/constants.js

export const SCAN_MODES = {
  WASTE: 'waste',
  BIN: 'bin'
};

export const SCAN_INTERVAL = 2000; // 2 seconds

export const CAMERA_CONSTRAINTS = {
  video: {
    facingMode: 'environment', // Rear camera
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
};

export const BIN_COLORS = {
  blue_bin: '#3b82f6',
  brown_bin: '#92400e',
  orange_bin: '#ea580c',
  black_bin: '#1f2937'
};

export const BIN_SYMBOLS = {
  blue_bin: '♻️',
  brown_bin: '🍂',
  orange_bin: '⚠️',
  black_bin: '🗑️'
};
