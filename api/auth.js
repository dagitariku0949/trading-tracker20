// Vercel Serverless Function for Authentication
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// In-memory user database (for demo purposes)
let users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@tradingdashboard.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'admin',
    isVerified: true,
    createdAt: new Date().toISOString(),
    lastLogin: null
  },
  {
    id: 2,
    name: 'Demo User',
    email: 'dagitariku095@gmail.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'user',
    isVerified: true,
    createdAt: new Date().toISOString(),
    lastLogin: null
  }
]

let userIdCounter = 3

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { method, body, query, url } = req
  
  // Parse the path from URL
  const urlPath = url.split('/api/auth/')[1] || ''
  const pathParts = urlPath.split('/').filter(Boolean)
  const action = pathParts[0] || query.path

  try {
    // Route handling
    if (method === 'POST' && action === 'login') {
      return handleLogin(req, res)
    }
    
    if (method === 'POST' && action === 'register') {
      return handleRegister(req, res)
    }
    
    if (method === 'POST' && action === 'forgot-password') {
      return handleForgotPassword(req, res)
    }
    
    if (method === 'POST' && action === 'reset-password') {
      return handleResetPassword(req, res)
    }
    
    if (method === 'GET' && action === 'verify') {
      return handleVerifyToken(req, res)
    }
    
    if (method === 'GET' && action === 'profile') {
      return handleGetProfile(req, res)
    }
    
    if (method === 'PUT' && action === 'profile') {
      return handleUpdateProfile(req, res)
    }

    // Default response for debugging
    return res.json({ 
      success: false, 
      message: 'Auth API is working', 
      debug: { method, action, url: req.url, available: ['login', 'register', 'verify', 'profile'] }
    })
  } catch (error) {
    console.error('Auth API Error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

async function handleLogin(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    })
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    })
  }

  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    })
  }

  // Update last login
  user.lastLogin = new Date().toISOString()

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  const { password: _, ...userResponse } = user

  return res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      token
    }
  })
}

async function handleRegister(req, res) {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    })
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    })
  }

  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = {
    id: userIdCounter++,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'user',
    isVerified: true,
    createdAt: new Date().toISOString(),
    lastLogin: null
  }

  users.push(newUser)

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  const { password: _, ...userResponse } = newUser

  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userResponse,
      token
    }
  })
}

async function handleForgotPassword(req, res) {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    })
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    })
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

  user.resetToken = resetToken
  user.resetTokenExpiry = resetTokenExpiry.toISOString()

  return res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent',
    resetToken: resetToken, // For development only
    resetUrl: `${req.headers.origin}/reset-password?token=${resetToken}`
  })
}

async function handleResetPassword(req, res) {
  const { token, newPassword } = req.body

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Reset token and new password are required'
    })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    })
  }

  const user = users.find(u => u.resetToken === token)
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    })
  }

  if (new Date() > new Date(user.resetTokenExpiry)) {
    return res.status(400).json({
      success: false,
      message: 'Reset token has expired'
    })
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  user.password = hashedPassword
  user.resetToken = null
  user.resetTokenExpiry = null

  return res.json({
    success: true,
    message: 'Password reset successful'
  })
}

function authenticateToken(req) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return null
  }

  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

async function handleVerifyToken(req, res) {
  const user = authenticateToken(req)
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }

  return res.json({
    success: true,
    message: 'Token is valid',
    data: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  })
}

async function handleGetProfile(req, res) {
  const tokenUser = authenticateToken(req)
  
  if (!tokenUser) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  const user = users.find(u => u.id === tokenUser.id)
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  const { password, resetToken, ...userResponse } = user
  return res.json({
    success: true,
    data: userResponse
  })
}

async function handleUpdateProfile(req, res) {
  const tokenUser = authenticateToken(req)
  
  if (!tokenUser) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  const { name, email } = req.body
  const user = users.find(u => u.id === tokenUser.id)
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  if (name) user.name = name
  if (email) {
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== user.id)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken'
      })
    }
    user.email = email.toLowerCase()
  }

  const { password, resetToken, ...userResponse } = user
  return res.json({
    success: true,
    message: 'Profile updated successfully',
    data: userResponse
  })
}