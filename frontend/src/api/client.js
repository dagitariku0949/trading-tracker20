import axios from 'axios';

// API client configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      // Don't redirect automatically in this version
    }
    
    // For development, return mock data for failed requests
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('API not available, using mock data');
      
      // Return mock data based on the request URL
      const url = error.config?.url || '';
      
      if (url.includes('/api/trades/stats/metrics')) {
        return {
          data: {
            totalTrades: 0,
            winRate: 0,
            profitFactor: 0,
            avgWin: 0,
            avgLoss: 0,
            maxDrawdown: 0,
            sharpeRatio: 0,
            totalPnl: 0
          }
        };
      }
      
      if (url.includes('/api/trades/stats/account')) {
        return {
          data: {
            totalPnl: 0,
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            winRate: 0,
            profitFactor: 0,
            avgWin: 0,
            avgLoss: 0,
            maxDrawdown: 0,
            currentBalance: 100000,
            startingBalance: 100000
          }
        };
      }
      
      if (url.includes('/api/trades/stats/daily')) {
        return { data: [] };
      }
      
      if (url.includes('/api/trades')) {
        return { data: [] };
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;