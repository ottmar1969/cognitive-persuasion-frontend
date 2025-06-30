// API Configuration
const API_BASE_URL = 'https://y0h0i3cyjgvq.manus.space';

export const config = {
  API_BASE_URL,
  MOCK_MODE: true, // Enable mock mode to bypass authentication
  endpoints: {
    auth: {
      register: `${API_BASE_URL}/api/auth/register`,
      login: `${API_BASE_URL}/api/auth/login`,
      logout: `${API_BASE_URL}/api/auth/logout`,
    },
    businesses: {
      list: `${API_BASE_URL}/api/businesses`,
      create: `${API_BASE_URL}/api/businesses`,
      update: (id) => `${API_BASE_URL}/api/businesses/${id}`,
      delete: (id) => `${API_BASE_URL}/api/businesses/${id}`,
    },
    audiences: {
      list: `${API_BASE_URL}/api/audiences`,
      create: `${API_BASE_URL}/api/audiences`,
      update: (id) => `${API_BASE_URL}/api/audiences/${id}`,
      delete: (id) => `${API_BASE_URL}/api/audiences/${id}`,
    },
    payments: {
      create: `${API_BASE_URL}/api/payments/create`,
      execute: `${API_BASE_URL}/api/payments/execute`,
    },
    health: `${API_BASE_URL}/api/health`,
  }
};

export default config;

