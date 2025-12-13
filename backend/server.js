require('dotenv').config()
const express = require('express')
const app = express()
const kiroRoutes = require('./routes/kiro')
const tradesRoutes = require('./routes/trades')
const learningRoutes = require('./routes/learning')
// Auth routes removed

// CORS middleware - Enhanced for development
app.use((req, res, next) => {
  // Allow requests from frontend development server
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'https://trading-tracker2.vercel.app'
  ]
  
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  } else {
    res.header('Access-Control-Allow-Origin', '*')
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
  res.header('Access-Control-Allow-Credentials', 'true')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  next()
})

app.use(express.json())

// Serve uploaded files statically
const path = require('path')
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Root endpoint for ngrok verification
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Trading Dashboard API',
    endpoints: {
      trades: '/api/trades',
      metrics: '/api/trades/stats/metrics',
      account: '/api/trades/stats/account'
    }
  })
})

app.use('/api/kiro', kiroRoutes)
app.use('/api/trades', tradesRoutes)
app.use('/api/learning', learningRoutes)
// Auth routes removed

const port = process.env.PORT || 4000
app.listen(port, ()=> console.log('Server listening on', port))
