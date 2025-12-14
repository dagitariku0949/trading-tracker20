const express = require('express')
const router = express.Router()
const db = require('../db')
// No authentication required - direct access to trades

// Get all trades
router.get('/', async (req, res) => {
  try {
    const trades = await db.getAllTrades()
    res.json(trades)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get single trade
router.get('/:id', async (req, res) => {
  try {
    const trade = await db.getTradeById(req.params.id)
    if (!trade) return res.status(404).json({ error: 'Trade not found' })
    res.json(trade)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create new trade
router.post('/', async (req, res) => {
  try {
    const trade = await db.createTrade(req.body)
    res.status(201).json(trade)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update trade (close position, update confluence, etc)
router.put('/:id', async (req, res) => {
  try {
    const trade = await db.updateTrade(req.params.id, req.body)
    if (!trade) return res.status(404).json({ error: 'Trade not found' })
    res.json(trade)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete trade
router.delete('/:id', async (req, res) => {
  try {
    const success = await db.deleteTrade(req.params.id)
    if (!success) return res.status(404).json({ error: 'Trade not found' })
    res.json({ message: 'Trade deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get account stats
router.get('/stats/account', async (req, res) => {
  try {
    const stats = await db.getAccountStats()
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get metrics (profit factor, win rate, etc)
router.get('/stats/metrics', async (req, res) => {
  try {
    const metrics = await db.getMetrics()
    res.json(metrics)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get daily PnL
router.get('/stats/daily', async (req, res) => {
  try {
    const daily = await db.getDailyPnL()
    res.json(daily)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
