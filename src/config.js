// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://kkh7ikcgje7w.manus.space';

export const config = {
  API_BASE_URL,
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

