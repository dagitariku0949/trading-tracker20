import React, { useState, useEffect } from 'react'
import api from '../api/client'
import ConfluenceCard from '../components/ConfluenceCard'
import CalendarHeatmap from '../components/CalendarHeatmap'
import MetricsGrid from '../components/MetricsGrid'
import TradesList from '../components/TradesList'
import TradeForm from '../components/TradeForm'
import AccountSummary from '../components/AccountSummary'
import MonthlyCalendar from '../components/MonthlyCalendar'
import ImportTrades from '../components/ImportTrades'
import EquityCurve from '../components/EquityCurve'
import AdvancedMetrics from '../components/AdvancedMetrics'
import SettingsModal from '../components/SettingsModal'
import TradeJournal from '../components/TradeJournal'
import AfterTradeForm from '../components/AfterTradeForm'
import PositionCalculator from '../components/PositionCalculator'
import LearningHub from '../components/LearningHubSimple'
import AdminPanel from '../components/AdminPanel'
import AdminLogin from '../components/AdminLogin'


export default function Dashboard(){
  // Mock user for dashboard
  const user = { name: 'Demo User', email: 'demo@example.com' };
  const logout = () => {};
  const [currentUser, setCurrentUser] = useState(null)
  const [showLearning, setShowLearning] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showImport, setShowImport] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [startingBalance, setStartingBalance] = useState(100000)
  const [trades, setTrades] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [accountStats, setAccountStats] = useState(null)
  const [dailyPnL, setDailyPnL] = useState([])
  const [showTradeForm, setShowTradeForm] = useState(false)
  const [showAfterTradeForm, setShowAfterTradeForm] = useState(false)
  const [editingTrade, setEditingTrade] = useState(null)
  const [closingTrade, setClosingTrade] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [tradesRes, metricsRes, statsRes, dailyRes] = await Promise.all([
        api.get('/api/trades'),
        api.get('/api/trades/stats/metrics'),
        api.get('/api/trades/stats/account'),
        api.get('/api/trades/stats/daily')
      ])
      
      setTrades(tradesRes.data)
      setMetrics(metricsRes.data)
      
      // Recalculate account stats with correct starting balance
      const savedBalance = localStorage.getItem('startingBalance')
      const correctStartingBalance = savedBalance ? parseFloat(savedBalance) : 100000
      const totalPnL = statsRes.data.totalPnl || 0
      
      setAccountStats({
        ...statsRes.data,
        startingBalance: correctStartingBalance,
        currentBalance: correctStartingBalance + totalPnL
      })
      
      setDailyPnL(dailyRes.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    // Set default user
    const defaultUser = { name: 'Trader', email: 'trader@example.com' }
    setCurrentUser(defaultUser)
    localStorage.setItem('userToken', 'direct-access')
    localStorage.setItem('userData', JSON.stringify(defaultUser))
    
    // Load starting balance from localStorage first
    const savedBalance = localStorage.getItem('startingBalance')
    if (savedBalance) {
      setStartingBalance(parseFloat(savedBalance))
    }
    
    // Request notification permission
    const initNotifications = async () => {
      try {
        const { requestNotificationPermission } = await import('../utils/notifications')
        await requestNotificationPermission()
      } catch (e) {
        console.log('Notifications not available')
      }
    }
    initNotifications()
    
    fetchData()
    setLoading(false)
  }, [])

  const handleUserLogout = () => {
    // Clear data and refresh the page
    localStorage.clear()
    window.location.reload()
  }

  useEffect(() => {
    // Restore reminders when trades are loaded
    if (trades.length > 0) {
      const restoreReminders = async () => {
        const { restoreReminders: restore } = await import('../utils/notifications')
        restore(trades)
      }
      restoreReminders()
    }
  }, [trades])

  // Check admin authentication on load
  useEffect(() => {
    const authToken = sessionStorage.getItem('adminAuthToken')
    const authTime = sessionStorage.getItem('adminAuthTime')
    
    if (authToken && authTime) {
      const timeDiff = Date.now() - parseInt(authTime)
      // Session expires after 2 hours
      if (timeDiff < 2 * 60 * 60 * 1000) {
        setIsAdminAuthenticated(true)
      } else {
        // Clear expired session
        sessionStorage.removeItem('adminAuthToken')
        sessionStorage.removeItem('adminAuthTime')
      }
    }
  }, [])

  // Hidden admin access - Hold Ctrl+Alt and type "dagi.." anywhere on the page
  useEffect(() => {
    let sequence = ''
    let sequenceTimer = null
    let ctrlAltPressed = false
    
    const handleKeyDown = (e) => {
      // Check if Ctrl+Alt is being held
      if (e.ctrlKey && e.altKey) {
        ctrlAltPressed = true
        
        // Capture typed characters while Ctrl+Alt is held
        if (e.key.length === 1 || e.key === '.') {
          // Clear previous timer
          if (sequenceTimer) clearTimeout(sequenceTimer)
          
          // Add key to sequence
          sequence += e.key.toLowerCase()
          
          // Keep only last 6 characters (length of "dagi..")
          if (sequence.length > 6) {
            sequence = sequence.slice(-6)
          }
          
          // Check if sequence ends with "dagi.."
          if (sequence.endsWith('dagi..')) {
            setShowAdminLogin(true)
            sequence = '' // Reset sequence
            ctrlAltPressed = false
          }
          
          // Reset sequence after 3 seconds of inactivity
          sequenceTimer = setTimeout(() => {
            sequence = ''
          }, 3000)
        }
      }
    }
    
    const handleKeyUp = (e) => {
      // Reset when Ctrl or Alt is released
      if (!e.ctrlKey || !e.altKey) {
        ctrlAltPressed = false
        sequence = ''
        if (sequenceTimer) clearTimeout(sequenceTimer)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (sequenceTimer) clearTimeout(sequenceTimer)
    }
  }, [])

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true)
    setShowAdminLogin(false)
    setShowAdmin(true)
  }

  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminAuthToken')
    sessionStorage.removeItem('adminAuthTime')
    setIsAdminAuthenticated(false)
    setShowAdmin(false)
    setShowAdminLogin(false)
  }



  const handleSaveSettings = (newBalance) => {
    setStartingBalance(newBalance)
    localStorage.setItem('startingBalance', newBalance.toString())
    // Recalculate account stats with new starting balance
    if (accountStats) {
      const totalPnL = accountStats.totalPnl || 0
      setAccountStats({
        ...accountStats,
        startingBalance: newBalance,
        currentBalance: newBalance + totalPnL
      })
    }
  }

  const handleTradeSubmit = async (tradeData) => {
    try {
      let savedTrade
      if (editingTrade) {
        await api.put(`/api/trades/${editingTrade.id}`, tradeData)
      } else {
        const response = await api.post('/api/trades', tradeData)
        savedTrade = response.data
        
        // Schedule reminder for new open trades
        if (savedTrade.status === 'OPEN') {
          const { scheduleTradeReminder } = await import('../utils/notifications')
          scheduleTradeReminder(savedTrade.id, savedTrade.symbol)
        }
      }
      await fetchData()
      setShowTradeForm(false)
      setEditingTrade(null)
    } catch (err) {
      console.error('Error saving trade:', err)
      alert('Error saving trade')
    }
  }

  const handleAfterTradeSubmit = async (tradeData, tradeId) => {
    try {
      if (tradeId) {
        // Update existing trade (closing it)
        await api.put(`/api/trades/${tradeId}`, tradeData)
        
        // Cancel reminder when trade is closed
        const { cancelTradeReminder } = await import('../utils/notifications')
        cancelTradeReminder(tradeId)
      } else {
        // Create new closed trade
        await api.post('/api/trades', tradeData)
      }
      await fetchData()
      setShowAfterTradeForm(false)
      setClosingTrade(null)
    } catch (err) {
      console.error('Error saving after trade:', err)
      alert('Error saving trade')
    }
  }

  const handleOpenAfterTrade = (trade) => {
    setClosingTrade(trade)
    setShowAfterTradeForm(true)
  }

  const handleDeleteTrade = async (id) => {
    if (!confirm('Delete this trade?')) return
    try {
      await api.delete(`/api/trades/${id}`)
      await fetchData()
    } catch (err) {
      console.error('Error deleting trade:', err)
    }
  }

  const handleEditTrade = (trade) => {
    setEditingTrade(trade)
    setShowTradeForm(true)
  }

  const handleCloseTrade = async (trade, exitPrice) => {
    try {
      await api.put(`/api/trades/${trade.id}`, { 
        exit_price: exitPrice,
        status: 'CLOSED'
      })
      await fetchData()
    } catch (err) {
      console.error('Error closing trade:', err)
    }
  }



  if (showAdminLogin) {
    return (
      <AdminLogin 
        onLogin={handleAdminLogin}
        onCancel={() => setShowAdminLogin(false)}
      />
    )
  }

  if (showAdmin && isAdminAuthenticated) {
    return (
      <AdminPanel 
        onBackToDashboard={() => setShowAdmin(false)}
        onLogout={handleAdminLogout}
      />
    )
  }

  if (showLearning) {
    console.log('RENDERING LEARNING HUB - showLearning is true');
    return (
      <LearningHub 
        onBack={() => {
          console.log('Back button clicked');
          setShowLearning(false)
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
      <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              LEAP
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <h1 className="text-2xl font-semibold text-slate-300">Trading Dashboard</h1>
            {currentUser && (
              <>
                <div className="h-6 w-px bg-slate-700"></div>
                <div className="text-sm text-slate-400">
                  Welcome, {currentUser.name}
                </div>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLearning(true)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition relative"
              title="Learn with Dagim Tariku"
            >
              👨‍🏫 Learn
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            </button>

            <button
              onClick={handleUserLogout}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-semibold transition"
              title="Logout"
            >
              🚪 Logout
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-semibold transition"
              title="Settings"
            >
              ⚙️
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition"
            >
              📥 Import CSV
            </button>
            <button
              onClick={() => {
                setClosingTrade(null)
                setShowAfterTradeForm(true)
              }}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-semibold transition"
            >
              📊 After Trade
            </button>
            <button
              onClick={() => {
                setEditingTrade(null)
                setShowTradeForm(true)
              }}
              className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-lg font-semibold transition"
            >
              + New Trade
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'journal'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📝 Journal
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'monthly'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Calendar
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'trades'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Trades
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🧮 Calculator
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {accountStats && <AccountSummary stats={{...accountStats, startingBalance}} />}
            
            {metrics && <ConfluenceCard metrics={metrics} trades={trades} />}
            
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {metrics && <MetricsGrid metrics={metrics} />}
              <div className="lg:col-span-2">
                {dailyPnL && <CalendarHeatmap data={dailyPnL} />}
              </div>
            </div>

            <div className="mt-6">
              <EquityCurve trades={trades} startingBalance={startingBalance} />
            </div>

            <div className="mt-6">
              <TradesList 
                trades={trades.slice(0, 10)} 
                onEdit={handleEditTrade}
                onDelete={handleDeleteTrade}
                onClose={handleCloseTrade}
                onAfterTrade={handleOpenAfterTrade}
              />
              {trades.length > 10 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setActiveTab('trades')}
                    className="text-emerald-400 hover:text-emerald-300 text-sm"
                  >
                    View all {trades.length} trades →
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            {accountStats && <AccountSummary stats={{...accountStats, startingBalance}} />}
            
            <div className="mt-6">
              <AdvancedMetrics trades={trades} startingBalance={startingBalance} />
            </div>

            <div className="mt-6">
              <EquityCurve trades={trades} startingBalance={startingBalance} />
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {metrics && <MetricsGrid metrics={metrics} />}
              <div className="lg:col-span-2">
                {dailyPnL && <CalendarHeatmap data={dailyPnL} />}
              </div>
            </div>
          </>
        )}

        {activeTab === 'journal' && (
          <>
            {accountStats && <AccountSummary stats={{...accountStats, startingBalance}} />}
            <TradeJournal trades={trades} onEdit={handleEditTrade} />
          </>
        )}

        {activeTab === 'monthly' && (
          <>
            {accountStats && <AccountSummary stats={{...accountStats, startingBalance}} />}
            <MonthlyCalendar trades={trades} />
          </>
        )}

        {activeTab === 'trades' && (
          <>
            {accountStats && <AccountSummary stats={{...accountStats, startingBalance}} />}
            <div className="mt-6">
              <TradesList 
                trades={trades} 
                onEdit={handleEditTrade}
                onDelete={handleDeleteTrade}
                onClose={handleCloseTrade}
                onAfterTrade={handleOpenAfterTrade}
              />
            </div>
          </>
        )}

        {activeTab === 'calculator' && (
          <>
            {accountStats && <AccountSummary stats={{...accountStats, startingBalance}} />}
            <div className="mt-6">
              <PositionCalculator accountBalance={accountStats?.currentBalance || startingBalance} />
            </div>
          </>
        )}

        {showTradeForm && (
          <TradeForm
            trade={editingTrade}
            onSubmit={handleTradeSubmit}
            onClose={() => {
              setShowTradeForm(false)
              setEditingTrade(null)
            }}
          />
        )}

        {showImport && (
          <ImportTrades
            onClose={() => setShowImport(false)}
            onImportComplete={fetchData}
          />
        )}

        {showAfterTradeForm && (
          <AfterTradeForm
            trade={closingTrade}
            onSubmit={handleAfterTradeSubmit}
            onClose={() => {
              setShowAfterTradeForm(false)
              setClosingTrade(null)
            }}
          />
        )}

        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            currentBalance={startingBalance}
            onSave={handleSaveSettings}
          />
        )}
      </div>
    </div>
  )
}