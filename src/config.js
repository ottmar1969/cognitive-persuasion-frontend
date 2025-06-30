// API Configuration
const API_CONFIG = {
  // Use environment variable or fallback to localhost for development
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5003/api',
  
  // For production deployment, we'll use a mock API
  MOCK_MODE: import.meta.env.VITE_MOCK_MODE === 'true' || false
};

export default API_CONFIG;

