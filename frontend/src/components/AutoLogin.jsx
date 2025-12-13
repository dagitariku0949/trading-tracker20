import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AutoLogin = ({ children, redirectTo = '/dashboard' }) => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performAutoLogin = async () => {
      if (!user) {
        console.log('🚀 Auto-login: Logging in demo user...');
        
        // Force login with demo credentials
        const result = await login('dagitariku095@gmail.com', 'password');
        
        if (result.success) {
          console.log('✅ Auto-login successful:', result.user);
          // Don't redirect, just stay on current page
        } else {
          console.log('❌ Auto-login failed, creating manual session...');
          
          // Manual session creation as fallback
          const mockUser = {
            id: 1,
            name: 'Demo User',
            email: 'dagitariku095@gmail.com',
            role: 'user'
          };
          
          const mockToken = `auto-login-${Date.now()}`;
          localStorage.setItem('authToken', mockToken);
          localStorage.setItem('userData', JSON.stringify(mockUser));
          localStorage.setItem('loginTime', new Date().toISOString());
          
          // Force page reload to trigger auth context update
          window.location.reload();
        }
      }
    };

    performAutoLogin();
  }, [user, login]);

  // Show loading while auto-login is happening
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">🚀 Auto-login in progress...</p>
          <p className="text-gray-400 mt-2">Logging you in automatically</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AutoLogin;