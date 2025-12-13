import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { login, register, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        // Login
        console.log('🔐 Attempting login with:', formData.email);
        const result = await login(formData.email, formData.password);
        console.log('🔐 Login result:', result);
        
        if (result.success) {
          setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
          setTimeout(() => navigate(from, { replace: true }), 1000);
        } else {
          setMessage({ type: 'error', text: result.message || 'Login failed. Please try again.' });
        }
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match' });
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
          setIsLoading(false);
          return;
        }

        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          setMessage({ type: 'success', text: 'Registration successful! Redirecting...' });
          setTimeout(() => navigate(from, { replace: true }), 1000);
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl font-bold text-white mb-2">Trading Dashboard</h1>
          <p className="text-gray-400">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field (only for registration) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Confirm Password field (only for registration) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Error/Success Message */}
            {(message.text || error) && (
              <div className={`p-4 rounded-lg ${
                message.type === 'error' || error
                  ? 'bg-red-900 border border-red-700 text-red-300'
                  : 'bg-green-900 border border-green-700 text-green-300'
              }`}>
                {message.text || error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            {/* Forgot Password Link (only for login) */}
            {isLogin && (
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleMode}
                className="text-blue-400 hover:text-blue-300 ml-1 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-yellow-900 border border-yellow-700 rounded-lg p-4">
          <h3 className="text-yellow-300 font-bold mb-2">🔑 Demo Credentials</h3>
          <div className="text-yellow-200 text-sm space-y-1">
            <p><strong>User Account:</strong></p>
            <p>Email: dagitariku095@gmail.com</p>
            <p>Password: password</p>
            <p className="mt-2"><strong>Admin Account:</strong></p>
            <p>Email: admin@tradingdashboard.com</p>
            <p>Password: password</p>
          </div>
          <div className="mt-3 space-y-2">
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  email: 'dagitariku095@gmail.com',
                  password: 'password'
                });
              }}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded text-sm"
            >
              🚀 Auto-fill Demo Credentials
            </button>
            <button
              onClick={async () => {
                setIsLoading(true);
                console.log('🔥 Direct login bypass test');
                const result = await login('dagitariku095@gmail.com', 'password');
                console.log('🔥 Direct login result:', result);
                if (result.success) {
                  setMessage({ type: 'success', text: 'Direct login successful! Redirecting...' });
                  setTimeout(() => navigate(from, { replace: true }), 1000);
                } else {
                  setMessage({ type: 'error', text: 'Direct login failed: ' + result.message });
                }
                setIsLoading(false);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm"
            >
              🔥 Direct Login Test (Bypass Form)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;