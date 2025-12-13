import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import AdminPage from './pages/AdminPage'
import { LearningProvider } from './contexts/LearningContext'

export default function App() {
  console.log('App component loaded - Direct access to dashboard')
  
  return (
    <LearningProvider>
      <Router>
        <Routes>
          {/* Direct Routes - No authentication */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPage />} />
          
          {/* Redirect everything to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </LearningProvider>
  )
}
