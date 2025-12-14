import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import LoginPage from './components/LoginPage'
import { LearningProvider } from './contexts/LearningContext'
import api from './api/client'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('userToken')
      const userData = localStorage.getItem('userData')
      
      if (token && userData) {
        try {
          // Verify token is still valid
          const response = await api.get('/api/auth/me')
          setUser(response.data.user)
          console.log('User authenticated:', response.data.user.name)
        } catch (error) {
          console.log('Token invalid, clearing auth data')
          localStorage.removeItem('userToken')
          localStorage.removeItem('userData')
        }
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    console.log('User logged in:', userData.name)
  }

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')
    setUser(null)
    console.log('User logged out')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <LearningProvider>
      <Router>
        <Routes>
          {user ? (
            // Authenticated routes
            <>
              <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            // Unauthenticated routes
            <>
              <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </Router>
    </LearningProvider>
  )
}
