// src/config/api.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const endpoints = {
  health: `${API_URL}/api/health`,
  scan: `${API_URL}/api/scan`,
  validate: `${API_URL}/api/scan/validate`,
  verify: `${API_URL}/api/v1/verify`,
  userStats: `${API_URL}/api/v1/user/stats`,
  scansWeekly: `${API_URL}/api/v1/scans/weekly`,
  scans: `${API_URL}/api/v1/scans`,
  checkin: `${API_URL}/api/v1/checkin`,
  nearby: `${API_URL}/api/v1/nearby`,
  userProfile: `${API_URL}/api/v1/user/profile`,
  deleteUser: `${API_URL}/api/v1/user`,
  guidelines: `${API_URL}/api/v1/guidelines`,
};

export default API_URL;
