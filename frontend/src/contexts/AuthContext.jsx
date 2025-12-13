import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD 
    ? 'https://trading-tracker2.vercel.app' 
    : 'http://localhost:4000'
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (!token || !userData) {
        console.log('No auth data found, user not logged in');
        setLoading(false);
        return;
      }

      // For mock tokens, just use stored user data
      if (token.startsWith('mock-token-')) {
        const user = JSON.parse(userData);
        console.log('✅ Mock auth check successful:', user);
        setUser(user);
        setLoading(false);
        return;
      }

      // Try real API verification
      try {
        console.log('Checking auth status with API...');
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('API auth check successful:', result.data);
          setUser(result.data);
        } else {
          // Fallback to stored user data
          const user = JSON.parse(userData);
          console.log('API failed, using stored user data:', user);
          setUser(user);
        }
      } catch (error) {
        console.log('API unavailable, using stored user data');
        const user = JSON.parse(userData);
        setUser(user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      // Mock authentication - works without backend
      const mockUsers = {
        'dagitariku095@gmail.com': {
          id: 1,
          name: 'Demo User',
          email: 'dagitariku095@gmail.com',
          role: 'user'
        },
        'admin@tradingdashboard.com': {
          id: 2,
          name: 'Admin User',
          email: 'admin@tradingdashboard.com',
          role: 'admin'
        }
      };

      // Check credentials
      if (password === 'password' && mockUsers[email.toLowerCase()]) {
        const user = mockUsers[email.toLowerCase()];
        const mockToken = `mock-token-${user.id}-${Date.now()}`;
        
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('loginTime', new Date().toISOString());
        setUser(user);
        
        console.log('✅ Mock login successful:', user);
        return { success: true, user };
      }

      // Try real API as fallback
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success) {
          localStorage.setItem('authToken', result.data.token);
          localStorage.setItem('userData', JSON.stringify(result.data.user));
          localStorage.setItem('loginTime', new Date().toISOString());
          setUser(result.data.user);
          return { success: true, user: result.data.user };
        }
      } catch (apiError) {
        console.log('API login failed, using mock auth');
      }

      // If neither mock nor API works
      setError('Invalid email or password');
      return { success: false, message: 'Invalid email or password' };
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('authToken', result.data.token);
        setUser(result.data.user);
        return { success: true, user: result.data.user };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Registration failed. Please check your connection.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('loginTime');

    setUser(null);
    setError(null);
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { 
        success: false, 
        message: 'Password reset request failed. Please check your connection.' 
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { 
        success: false, 
        message: 'Password reset failed. Please check your connection.' 
      };
    }
  };

  const updateProfile = async (updates) => {
    try {
      setError(null);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.data);
        return { success: true, user: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Profile update failed. Please check your connection.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };



  // Mock admin functions for the admin panel
  const getUsers = async () => {
    const mockUsers = [
      {
        id: 1,
        name: 'Demo User',
        email: 'dagitariku095@gmail.com',
        role: 'user',
        isVerified: true,
        createdAt: '2024-12-01T10:00:00Z',
        lastLogin: '2024-12-13T10:30:00Z'
      },
      {
        id: 2,
        name: 'Admin User',
        email: 'admin@tradingdashboard.com',
        role: 'admin',
        isVerified: true,
        createdAt: '2024-11-15T09:00:00Z',
        lastLogin: '2024-12-13T10:45:00Z'
      }
    ];
    return { success: true, data: mockUsers };
  };

  const updateUser = async (userId, updates) => {
    console.log('Mock update user:', userId, updates);
    return { success: true, message: 'User updated successfully' };
  };

  const deleteUser = async (userId) => {
    console.log('Mock delete user:', userId);
    return { success: true, message: 'User deleted successfully' };
  };

  const resetUserPassword = async (userId, newPassword) => {
    console.log('Mock reset password for user:', userId);
    return { success: true, message: 'Password reset successfully' };
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    checkAuthStatus,
    getUsers,
    updateUser,
    deleteUser,
    resetUserPassword,
    // Helper functions
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};