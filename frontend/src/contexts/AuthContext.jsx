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
      if (!token) {
        console.log('No auth token found, user not logged in');
        setLoading(false);
        return;
      }

      console.log('Checking auth status with token...');
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Auth check successful:', result.data);
        setUser(result.data);
      } else {
        console.log('Token is invalid, removing...');
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed (backend might be down):', error);
      // If backend is down, still allow access to login page
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

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
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Login failed. Please check your connection.';
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
    // Helper functions
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};