import React, { useState } from 'react';

const AdminLogin = ({ onLogin, onCancel }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    adminKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Admin credentials
    const ADMIN_CREDENTIALS = {
      username: 'admin',
      password: 'TradingAdmin2024!',
      adminKey: 'LEAP-ADMIN-2024'
    };

    // Debug logging
    console.log('Login attempt:', {
      entered: credentials,
      expected: ADMIN_CREDENTIALS,
      usernameMatch: credentials.username === ADMIN_CREDENTIALS.username,
      passwordMatch: credentials.password === ADMIN_CREDENTIALS.password,
      adminKeyMatch: credentials.adminKey === ADMIN_CREDENTIALS.adminKey
    });

    // Simulate authentication delay
    setTimeout(() => {
      if (
        credentials.username.trim() === ADMIN_CREDENTIALS.username &&
        credentials.password.trim() === ADMIN_CREDENTIALS.password &&
        credentials.adminKey.trim() === ADMIN_CREDENTIALS.adminKey
      ) {
        // Store admin session
        const authToken = btoa(`${Date.now()}-${Math.random()}-admin`);
        sessionStorage.setItem('adminAuthToken', authToken);
        sessionStorage.setItem('adminAuthTime', Date.now().toString());
        
        console.log('Admin login successful');
        onLogin();
      } else {
        console.log('Admin login failed - credential mismatch');
        setError(`Invalid admin credentials. Please check your username, password, and admin key.
        
Debug Info:
Username: "${credentials.username}" (expected: "${ADMIN_CREDENTIALS.username}")
Password: "${credentials.password}" (expected: "${ADMIN_CREDENTIALS.password}")
Admin Key: "${credentials.adminKey}" (expected: "${ADMIN_CREDENTIALS.adminKey}")`);
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👑</div>
          <h2 className="text-2xl font-bold text-red-400">Admin Access</h2>
          <p className="text-gray-400">Complete system management</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter admin username"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter admin password"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin Key
            </label>
            <input
              type="password"
              value={credentials.adminKey}
              onChange={(e) => setCredentials({...credentials, adminKey: e.target.value})}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter admin key"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-900 border border-blue-700 p-3 rounded-lg mb-4 text-blue-200 text-sm">
            <div className="flex justify-between items-center mb-2">
              <strong>Admin Credentials:</strong>
              <button
                type="button"
                onClick={() => setCredentials({
                  username: 'admin',
                  password: 'TradingAdmin2024!',
                  adminKey: 'LEAP-ADMIN-2024'
                })}
                className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
              >
                Auto-Fill
              </button>
            </div>
            Username: admin<br/>
            Password: TradingAdmin2024!<br/>
            Admin Key: LEAP-ADMIN-2024
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Authenticating...' : 'Access Admin Panel'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Admin panel provides full access to:</p>
          <p>• Trade management & journal entries</p>
          <p>• User management & analytics</p>
          <p>• System monitoring & controls</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;