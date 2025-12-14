import axios from 'axios';

// API client configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE || (
  import.meta.env.PROD ? '' : 'http://localhost:4000'
);

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
    
    // For development or when API is not available, use localStorage-based mock API
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      console.warn('Serverless API not available, using localStorage-based fallback API');
      
      const url = error.config?.url || '';
      const method = error.config?.method?.toUpperCase() || 'GET';
      
      // Get trades from localStorage
      const getStoredTrades = () => {
        try {
          const stored = localStorage.getItem('trades');
          return stored ? JSON.parse(stored) : [];
        } catch (e) {
          return [];
        }
      };
      
      // Save trades to localStorage
      const saveStoredTrades = (trades) => {
        try {
          localStorage.setItem('trades', JSON.stringify(trades));
          // Trigger storage event for cross-component sync
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'trades',
            newValue: JSON.stringify(trades)
          }));
        } catch (e) {
          console.error('Failed to save trades:', e);
        }
      };
      
      // Calculate metrics from trades
      const calculateMetrics = (trades) => {
        if (trades.length === 0) {
          return {
            totalTrades: 0,
            winRate: 0,
            profitFactor: 0,
            avgWin: 0,
            avgLoss: 0,
            maxDrawdown: 0,
            sharpeRatio: 0,
            totalPnl: 0
          };
        }
        
        const closedTrades = trades.filter(t => t.status === 'CLOSED' && t.pnl !== null);
        const winningTrades = closedTrades.filter(t => t.pnl > 0);
        const losingTrades = closedTrades.filter(t => t.pnl < 0);
        
        const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
        const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0;
        const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
        
        return {
          totalTrades: trades.length,
          winRate: winRate,
          profitFactor: profitFactor,
          avgWin: avgWin,
          avgLoss: avgLoss,
          maxDrawdown: 0, // Simplified for now
          sharpeRatio: 0, // Simplified for now
          totalPnl: totalPnl
        };
      };
      
      // Handle different API endpoints
      if (url.includes('/api/auth')) {
        console.log(`Fallback API handling auth: ${method} ${url}`);
        
        // Get/Set users from localStorage
        const getStoredUsers = () => {
          try {
            const stored = localStorage.getItem('users');
            return stored ? JSON.parse(stored) : {};
          } catch (e) {
            return {};
          }
        };
        
        const saveStoredUsers = (users) => {
          try {
            localStorage.setItem('users', JSON.stringify(users));
          } catch (e) {
            console.error('Failed to save users:', e);
          }
        };
        
        const hashPassword = (password) => {
          return btoa(password + 'salt_key_2024');
        };
        
        // Handle auth endpoints with localStorage fallback
        if (method === 'POST' && url.includes('/login')) {
          const requestData = error.config?.data ? 
            (typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data) : 
            {};
          
          console.log('Login attempt:', requestData);
          
          const users = getStoredUsers();
          const user = Object.values(users).find(u => u.email === requestData.email.toLowerCase());
          
          if (user && user.password === hashPassword(requestData.password)) {
            // Update last login
            user.last_login = new Date().toISOString();
            users[user.id] = user;
            saveStoredUsers(users);
            
            const token = btoa(JSON.stringify({
              userId: user.id,
              timestamp: Date.now(),
              exp: Date.now() + (24 * 60 * 60 * 1000)
            }));
            
            const { password: _, ...userWithoutPassword } = user;
            
            return {
              data: {
                success: true,
                message: 'Login successful',
                user: userWithoutPassword,
                token: token
              }
            };
          } else {
            throw new Error('Invalid email or password');
          }
        } else if (method === 'POST' && url.includes('/register')) {
          const requestData = error.config?.data ? 
            (typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data) : 
            {};
          
          console.log('Registration attempt:', requestData);
          
          // Validation
          if (!requestData.name || !requestData.email || !requestData.password) {
            throw new Error('Name, email, and password are required');
          }
          
          if (requestData.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }
          
          const users = getStoredUsers();
          
          // Check if user already exists
          const existingUser = Object.values(users).find(u => u.email === requestData.email.toLowerCase());
          if (existingUser) {
            throw new Error('User with this email already exists');
          }
          
          // Create new user
          const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          const newUser = {
            id: userId,
            name: requestData.name.trim(),
            email: requestData.email.toLowerCase().trim(),
            password: hashPassword(requestData.password),
            status: 'active',
            role: 'user',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          };
          
          // Save user
          users[userId] = newUser;
          saveStoredUsers(users);
          
          const token = btoa(JSON.stringify({
            userId: newUser.id,
            timestamp: Date.now(),
            exp: Date.now() + (24 * 60 * 60 * 1000)
          }));
          
          const { password: _, ...userWithoutPassword } = newUser;
          
          return {
            data: {
              success: true,
              message: 'User registered successfully',
              user: userWithoutPassword,
              token: token
            }
          };
        } else if (method === 'GET' && url.includes('/me')) {
          // Return current user info
          const userData = localStorage.getItem('userData');
          if (userData) {
            return {
              data: {
                user: JSON.parse(userData)
              }
            };
          } else {
            throw new Error('No user data found');
          }
        } else if (method === 'GET' && url.includes('/users')) {
          // Return users list for admin
          const users = getStoredUsers();
          const usersList = Object.values(users).map(user => {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
          });
          return { data: usersList };
        }
        
        return { data: { success: false, error: 'Auth endpoint not found' } };
      } else if (url.includes('/api/trades')) {
        console.log(`Fallback API handling: ${method} ${url}`);
        const trades = getStoredTrades();
        
        if (method === 'GET') {
          // GET /api/trades or /api/trades/stats/*
          if (url.includes('/stats/metrics')) {
            return { data: calculateMetrics(trades) };
          } else if (url.includes('/stats/account')) {
            const metrics = calculateMetrics(trades);
            const startingBalance = parseFloat(localStorage.getItem('startingBalance') || '100000');
            return {
              data: {
                ...metrics,
                winningTrades: trades.filter(t => t.pnl > 0).length,
                losingTrades: trades.filter(t => t.pnl < 0).length,
                currentBalance: startingBalance + metrics.totalPnl,
                startingBalance: startingBalance
              }
            };
          } else if (url.includes('/stats/daily')) {
            // Generate daily P&L data
            const dailyData = {};
            trades.forEach(trade => {
              if (trade.exit_date && trade.pnl) {
                const date = trade.exit_date.split('T')[0];
                dailyData[date] = (dailyData[date] || 0) + trade.pnl;
              }
            });
            
            const dailyArray = Object.entries(dailyData).map(([date, pnl]) => ({
              date,
              pnl,
              value: pnl
            }));
            
            return { data: dailyArray };
          } else {
            // GET /api/trades - return all trades
            return { data: trades };
          }
        } else if (method === 'POST') {
          // POST /api/trades - create new trade
          let requestData = {};
          try {
            // Parse the request data from different possible sources
            requestData = error.config?.data ? 
              (typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data) : 
              {};
          } catch (e) {
            console.error('Error parsing request data:', e);
            requestData = {};
          }
          
          const newTrade = {
            ...requestData,
            id: Date.now() + Math.random(), // Ensure unique ID
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('Fallback API creating trade:', newTrade);
          
          const updatedTrades = [...trades, newTrade];
          saveStoredTrades(updatedTrades);
          
          return { data: newTrade };
        } else if (method === 'PUT') {
          // PUT /api/trades/:id - update trade
          const tradeId = parseInt(url.split('/').pop());
          const updateData = error.config.data;
          
          const updatedTrades = trades.map(trade => 
            trade.id === tradeId 
              ? { ...trade, ...updateData, updated_at: new Date().toISOString() }
              : trade
          );
          
          saveStoredTrades(updatedTrades);
          
          const updatedTrade = updatedTrades.find(t => t.id === tradeId);
          return { data: updatedTrade };
        } else if (method === 'DELETE') {
          // DELETE /api/trades/:id - delete trade
          const tradeId = parseFloat(url.split('/').pop()); // Use parseFloat to match API
          console.log('Fallback API: Deleting trade ID:', tradeId);
          console.log('Available trades:', trades.map(t => ({ id: t.id, symbol: t.symbol })));
          
          const updatedTrades = trades.filter(trade => trade.id !== tradeId);
          console.log('Fallback API: Trades after deletion:', updatedTrades.length);
          
          if (updatedTrades.length === trades.length) {
            console.warn('Fallback API: No trade was deleted - ID not found');
          }
          
          saveStoredTrades(updatedTrades);
          
          return { data: { success: true } };
        }
      }
      
      // Default fallback
      return { data: [] };
    }
    
    return Promise.reject(error);
  }
);

export default api;