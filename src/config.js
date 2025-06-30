// API Configuration
const API_CONFIG = {
  // Use environment variable for backend URL, fallback to localhost for development
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  
  // Disable mock mode to use real API
  MOCK_MODE: false,
  
  // App configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Cognitive Persuasion Engine',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Feature flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  
  // PayPal configuration
  PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID || ''
};

export default API_CONFIG;

