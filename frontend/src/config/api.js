// src/config/api.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const endpoints = {
  health: `${API_URL}/api/health`,
  scan: `${API_URL}/api/scan`,
  validate: `${API_URL}/api/validate`
};

export default API_URL;
