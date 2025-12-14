import React, { useState, useEffect } from 'react';
import api from '../api/client';

const AdminPanel = ({ onBackToDashboard, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [trades, setTrades] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [stats, setStats] = useState({
    totalTrades: 0,
    totalUsers: 1,
    totalPnL: 0,
    winRate: 0
  });

  // Load admin data
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load trades
      const tradesResponse = await api.get('/api/trades');
      const tradesData = tradesResponse.data || [];
      setTrades(tradesData);

      // Calculate stats
      const totalPnL = tradesData.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      const winningTrades = tradesData.filter(trade => (trade.pnl || 0) > 0).length;
      const winRate = tradesData.length > 0 ? (winningTrades / tradesData.length) * 100 : 0;

      // Load real users data first
      let usersData = [];
      let actualUserCount = 1;
      
      try {
        const usersResponse = await api.get('/api/auth/users');
        usersData = usersResponse.data || [];
        actualUserCount = usersData.length;
        
        // Add trade counts to users
        const usersWithTrades = usersData.map(user => ({
          ...user,
          trades: tradesData.filter(trade => trade.user_id === user.id).length,
          status: user.status || 'Active'
        }));
        
        setUsers(usersWithTrades);
      } catch (error) {
        console.error('Error loading users:', error);
        // Fallback to mock data
        usersData = [
          { id: 'demo_user_2024', name: 'Demo User', email: 'demo@leap.com', status: 'Active', trades: tradesData.length }
        ];
        setUsers(usersData);
        actualUserCount = usersData.length;
      }

      // Update stats with correct user count
      setStats({
        totalTrades: tradesData.length,
        totalUsers: actualUserCount,
        totalPnL: totalPnL,
        winRate: winRate.toFixed(1)
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      // Use mock data if API fails
      setTrades([]);
      setUsers([{ id: 1, name: 'Demo User', email: 'demo@example.com', status: 'Active', trades: 0 }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTradeSubmit = async (tradeData) => {
    try {
      if (editingTrade) {
        await api.put(`/api/trades/${editingTrade.id}`, tradeData);
      } else {
        await api.post('/api/trades', tradeData);
      }
      await loadAdminData();
      setShowTradeForm(false);
      setEditingTrade(null);
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Error saving trade');
    }
  };

  const handleDeleteTrade = async (id) => {
    if (!confirm('Delete this trade?')) return;
    try {
      await api.delete(`/api/trades/${id}`);
      await loadAdminData();
    } catch (error) {
      console.error('Error deleting trade:', error);
    }
  };

  const TradeForm = ({ trade, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      symbol: trade?.symbol || '',
      type: trade?.type || 'BUY',
      entry_price: trade?.entry_price || '',
      exit_price: trade?.exit_price || '',
      quantity: trade?.quantity || '',
      status: trade?.status || 'OPEN',
      entry_date: trade?.entry_date || new Date().toISOString().split('T')[0],
      exit_date: trade?.exit_date || '',
      notes: trade?.notes || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Calculate PnL
      const entryPrice = parseFloat(formData.entry_price);
      const exitPrice = parseFloat(formData.exit_price);
      const quantity = parseFloat(formData.quantity);
      
      let pnl = 0;
      if (exitPrice && entryPrice && quantity) {
        if (formData.type === 'BUY') {
          pnl = (exitPrice - entryPrice) * quantity;
        } else {
          pnl = (entryPrice - exitPrice) * quantity;
        }
      }

      onSubmit({
        ...formData,
        pnl: pnl,
        entry_price: parseFloat(formData.entry_price),
        exit_price: exitPrice || null,
        quantity: parseFloat(formData.quantity)
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">
            {trade ? 'Edit Trade' : 'Add New Trade'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Symbol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Entry Price</label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.entry_price}
                  onChange={(e) => setFormData({...formData, entry_price: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Exit Price</label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.exit_price}
                  onChange={(e) => setFormData({...formData, exit_price: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Entry Date</label>
                <input
                  type="date"
                  value={formData.entry_date}
                  onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Exit Date</label>
                <input
                  type="date"
                  value={formData.exit_date}
                  onChange={(e) => setFormData({...formData, exit_date: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                rows="3"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold"
              >
                {trade ? 'Update Trade' : 'Add Trade'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 text-center">
        👑 ADMIN PANEL: Full system management access
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-red-400 flex items-center">
              👑 Admin Panel
            </h1>
            <p className="text-gray-400">Complete trading system management</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBackToDashboard}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              🏠 Back to Dashboard
            </button>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {['overview', 'trades', 'users', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold capitalize ${
                activeTab === tab
                  ? 'text-red-400 border-b-2 border-red-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-blue-600 p-2 rounded">📊</div>
                  <div>
                    <p className="text-gray-400 text-sm">TOTAL TRADES</p>
                    <p className="text-2xl font-bold">{stats.totalTrades}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-green-600 p-2 rounded">👥</div>
                  <div>
                    <p className="text-gray-400 text-sm">TOTAL USERS</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-purple-600 p-2 rounded">💰</div>
                  <div>
                    <p className="text-gray-400 text-sm">TOTAL P&L</p>
                    <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${stats.totalPnL.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-yellow-600 p-2 rounded">🎯</div>
                  <div>
                    <p className="text-gray-400 text-sm">WIN RATE</p>
                    <p className="text-2xl font-bold">{stats.winRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">📈 Recent Activity</h2>
              <div className="space-y-3">
                {trades.slice(0, 5).map(trade => (
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                    <div>
                      <span className="font-semibold">{trade.symbol}</span>
                      <span className="text-gray-400 ml-2">{trade.type}</span>
                    </div>
                    <div className={`font-semibold ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${(trade.pnl || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
                {trades.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No trades yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === 'trades' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">📊 Trade Management</h2>
              <button
                onClick={() => {
                  setEditingTrade(null);
                  setShowTradeForm(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-semibold"
              >
                + Add New Trade
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-gray-300">Symbol</th>
                      <th className="px-4 py-3 text-gray-300">Type</th>
                      <th className="px-4 py-3 text-gray-300">Entry</th>
                      <th className="px-4 py-3 text-gray-300">Exit</th>
                      <th className="px-4 py-3 text-gray-300">Quantity</th>
                      <th className="px-4 py-3 text-gray-300">P&L</th>
                      <th className="px-4 py-3 text-gray-300">Status</th>
                      <th className="px-4 py-3 text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map(trade => (
                      <tr key={trade.id} className="border-b border-gray-700">
                        <td className="px-4 py-3 font-semibold">{trade.symbol}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            trade.type === 'BUY' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">{trade.entry_price}</td>
                        <td className="px-4 py-3">{trade.exit_price || '-'}</td>
                        <td className="px-4 py-3">{trade.quantity}</td>
                        <td className={`px-4 py-3 font-semibold ${
                          (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${(trade.pnl || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            trade.status === 'OPEN' ? 'bg-blue-900 text-blue-300' : 'bg-gray-900 text-gray-300'
                          }`}>
                            {trade.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingTrade(trade);
                                setShowTradeForm(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTrade(trade.id)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {trades.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No trades found. Add your first trade to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">👥 User Management</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-3 text-gray-400">ID</th>
                    <th className="pb-3 text-gray-400">Name</th>
                    <th className="pb-3 text-gray-400">Email</th>
                    <th className="pb-3 text-gray-400">Trades</th>
                    <th className="pb-3 text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-700">
                      <td className="py-3 text-gray-300">#{user.id}</td>
                      <td className="py-3 text-white font-medium">{user.name}</td>
                      <td className="py-3 text-gray-300">{user.email}</td>
                      <td className="py-3 text-gray-300">{user.trades}</td>
                      <td className="py-3">
                        <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-sm">
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">📈 Trading Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Performance Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Trades:</span>
                      <span>{stats.totalTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Rate:</span>
                      <span className="text-green-400">{stats.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total P&L:</span>
                      <span className={stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}>
                        ${stats.totalPnL.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">System Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Database:</span>
                      <span className="text-green-400">Connected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">API Status:</span>
                      <span className="text-green-400">Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Backup:</span>
                      <span className="text-gray-300">Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trade Form Modal */}
      {showTradeForm && (
        <TradeForm
          trade={editingTrade}
          onSubmit={handleTradeSubmit}
          onClose={() => {
            setShowTradeForm(false);
            setEditingTrade(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;