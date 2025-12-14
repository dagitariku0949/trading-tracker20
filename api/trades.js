// Serverless function for trades management with global user data storage

// In-memory storage for demonstration (in production, use a real database)
let globalTradesData = {};
let globalUsersData = {};

// Helper functions
const getUserId = (req) => {
  // Get user ID from token or create anonymous user
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = JSON.parse(atob(token.split('.')[1] || token));
      return decoded.userId || decoded.sub || 'demo-user';
    } catch (e) {
      return 'demo-user';
    }
  }
  return 'demo-user';
};

const getUserTrades = (userId) => {
  if (!globalTradesData[userId]) {
    globalTradesData[userId] = [];
  }
  return globalTradesData[userId];
};

const saveUserTrades = (userId, trades) => {
  globalTradesData[userId] = trades;
  
  // Also update user stats
  if (!globalUsersData[userId]) {
    globalUsersData[userId] = {
      id: userId,
      name: userId === 'demo-user' ? 'Demo User' : `User ${userId}`,
      email: `${userId}@example.com`,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
  }
  globalUsersData[userId].last_login = new Date().toISOString();
  globalUsersData[userId].total_trades = trades.length;
};

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
  
  const closedTrades = trades.filter(t => t.status === 'CLOSED' && t.pnl !== null && t.pnl !== undefined);
  const winningTrades = closedTrades.filter(t => t.pnl > 0);
  const losingTrades = closedTrades.filter(t => t.pnl < 0);
  
  const totalPnl = closedTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0) / losingTrades.length) : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
  
  return {
    totalTrades: trades.length,
    winRate: parseFloat(winRate.toFixed(2)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    avgWin: parseFloat(avgWin.toFixed(2)),
    avgLoss: parseFloat(avgLoss.toFixed(2)),
    maxDrawdown: 0, // Simplified for now
    sharpeRatio: 0, // Simplified for now
    totalPnl: parseFloat(totalPnl.toFixed(2))
  };
};

const generateDailyPnL = (trades) => {
  const dailyData = {};
  trades.forEach(trade => {
    if (trade.exit_date && trade.pnl !== null && trade.pnl !== undefined) {
      const date = trade.exit_date.split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + parseFloat(trade.pnl);
    }
  });
  
  return Object.entries(dailyData).map(([date, pnl]) => ({
    date,
    pnl: parseFloat(pnl.toFixed(2)),
    value: parseFloat(pnl.toFixed(2))
  }));
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const userId = getUserId(req);
  const { method, url } = req;
  
  try {
    if (method === 'GET') {
      const trades = getUserTrades(userId);
      
      if (url.includes('/stats/metrics')) {
        const metrics = calculateMetrics(trades);
        return res.json(metrics);
      } else if (url.includes('/stats/account')) {
        const metrics = calculateMetrics(trades);
        const startingBalance = 100000; // Default starting balance
        return res.json({
          ...metrics,
          winningTrades: trades.filter(t => t.pnl > 0).length,
          losingTrades: trades.filter(t => t.pnl < 0).length,
          currentBalance: startingBalance + metrics.totalPnl,
          startingBalance: startingBalance
        });
      } else if (url.includes('/stats/daily')) {
        const dailyPnL = generateDailyPnL(trades);
        return res.json(dailyPnL);
      } else {
        // Return all trades for this user
        return res.json(trades);
      }
    }

    if (method === 'POST') {
      const trades = getUserTrades(userId);
      const newTrade = {
        ...req.body,
        id: Date.now() + Math.random(), // Ensure unique ID
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Calculate PnL if exit price is provided
      if (newTrade.exit_price && newTrade.entry_price && newTrade.quantity) {
        const entryPrice = parseFloat(newTrade.entry_price);
        const exitPrice = parseFloat(newTrade.exit_price);
        const quantity = parseFloat(newTrade.quantity);
        
        if (newTrade.type === 'BUY') {
          newTrade.pnl = (exitPrice - entryPrice) * quantity;
        } else {
          newTrade.pnl = (entryPrice - exitPrice) * quantity;
        }
        newTrade.pnl = parseFloat(newTrade.pnl.toFixed(2));
      }
      
      trades.push(newTrade);
      saveUserTrades(userId, trades);
      
      return res.status(201).json(newTrade);
    }

    if (method === 'PUT') {
      const trades = getUserTrades(userId);
      const tradeId = parseFloat(req.url.split('/').pop());
      const updateData = req.body;
      
      const tradeIndex = trades.findIndex(t => t.id === tradeId);
      if (tradeIndex === -1) {
        return res.status(404).json({ error: 'Trade not found' });
      }
      
      // Update trade
      const updatedTrade = {
        ...trades[tradeIndex],
        ...updateData,
        updated_at: new Date().toISOString()
      };
      
      // Recalculate PnL if needed
      if (updatedTrade.exit_price && updatedTrade.entry_price && updatedTrade.quantity) {
        const entryPrice = parseFloat(updatedTrade.entry_price);
        const exitPrice = parseFloat(updatedTrade.exit_price);
        const quantity = parseFloat(updatedTrade.quantity);
        
        if (updatedTrade.type === 'BUY') {
          updatedTrade.pnl = (exitPrice - entryPrice) * quantity;
        } else {
          updatedTrade.pnl = (entryPrice - exitPrice) * quantity;
        }
        updatedTrade.pnl = parseFloat(updatedTrade.pnl.toFixed(2));
      }
      
      trades[tradeIndex] = updatedTrade;
      saveUserTrades(userId, trades);
      
      return res.json(updatedTrade);
    }

    if (method === 'DELETE') {
      const trades = getUserTrades(userId);
      const tradeId = parseFloat(req.url.split('/').pop());
      
      const filteredTrades = trades.filter(t => t.id !== tradeId);
      if (filteredTrades.length === trades.length) {
        return res.status(404).json({ error: 'Trade not found' });
      }
      
      saveUserTrades(userId, filteredTrades);
      
      return res.json({ success: true, message: 'Trade deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}