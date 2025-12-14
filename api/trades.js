// Vercel Serverless Function for Trading Data
let trades = []
let tradeIdCounter = 1

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { method, body, query } = req
  const path = query.path || []

  try {
    // Handle different trade endpoints
    if (method === 'GET' && !path[0]) {
      return handleGetTrades(req, res)
    }
    
    if (method === 'POST' && !path[0]) {
      return handleCreateTrade(req, res)
    }
    
    if (method === 'PUT' && path[0]) {
      return handleUpdateTrade(req, res, path[0])
    }
    
    if (method === 'DELETE' && path[0]) {
      return handleDeleteTrade(req, res, path[0])
    }
    
    if (method === 'GET' && path[0] === 'stats') {
      return handleGetStats(req, res, path[1])
    }

    return res.status(404).json({ success: false, message: 'Endpoint not found' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

function handleGetTrades(req, res) {
  return res.json(trades)
}

function handleCreateTrade(req, res) {
  const trade = {
    id: tradeIdCounter++,
    ...req.body,
    created_at: new Date().toISOString()
  }
  
  trades.push(trade)
  return res.status(201).json(trade)
}

function handleUpdateTrade(req, res, id) {
  const tradeIndex = trades.findIndex(t => t.id === parseInt(id))
  if (tradeIndex === -1) {
    return res.status(404).json({ success: false, message: 'Trade not found' })
  }
  
  trades[tradeIndex] = { ...trades[tradeIndex], ...req.body }
  return res.json(trades[tradeIndex])
}

function handleDeleteTrade(req, res, id) {
  const tradeIndex = trades.findIndex(t => t.id === parseInt(id))
  if (tradeIndex === -1) {
    return res.status(404).json({ success: false, message: 'Trade not found' })
  }
  
  trades.splice(tradeIndex, 1)
  return res.json({ success: true, message: 'Trade deleted' })
}

function handleGetStats(req, res, statsType) {
  if (statsType === 'metrics') {
    const totalTrades = trades.length
    const winningTrades = trades.filter(t => (t.pnl || 0) > 0).length
    const losingTrades = trades.filter(t => (t.pnl || 0) < 0).length
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    
    return res.json({
      totalTrades,
      winningTrades,
      losingTrades,
      totalPnl: parseFloat(totalPnl.toFixed(2)),
      winRate: parseFloat(winRate.toFixed(2))
    })
  }
  
  if (statsType === 'account') {
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    return res.json({
      totalPnl: parseFloat(totalPnl.toFixed(2)),
      totalTrades: trades.length
    })
  }
  
  if (statsType === 'daily') {
    // Group trades by date
    const dailyData = {}
    trades.forEach(trade => {
      const date = trade.entry_date ? trade.entry_date.split('T')[0] : new Date().toISOString().split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = 0
      }
      dailyData[date] += trade.pnl || 0
    })
    
    const result = Object.entries(dailyData).map(([date, pnl]) => ({
      date,
      pnl: parseFloat(pnl.toFixed(2))
    }))
    
    return res.json(result)
  }
  
  return res.status(404).json({ success: false, message: 'Stats type not found' })
}