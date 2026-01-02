import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // Check login status on component mount and when credentials change
  useEffect(() => {
    checkStatus();
  }, []);

  // Countdown timer
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            checkStatus();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const checkStatus = async () => {
    try {
      // Check localStorage first for immediate feedback
      const stored = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
      const now = Date.now();
      
      if (stored.blocked && stored.remainingTime) {
        const elapsed = Math.floor((now - stored.blockedAt) / 1000);
        const remaining = Math.max(0, stored.remainingTime - elapsed);
        
        if (remaining > 0) {
          setLoginStatus({ blocked: true, remainingAttempts: 0 });
          setCountdown(remaining);
          return;
        } else {
          localStorage.removeItem('loginAttempts');
        }
      }
      
      // Get actual status from server
      const status = await authService.checkLoginStatus();
      setLoginStatus(status);
      
      if (status.blocked && status.remainingTime) {
        setCountdown(status.remainingTime);
        localStorage.setItem('loginAttempts', JSON.stringify({
          blocked: true,
          remainingTime: status.remainingTime,
          blockedAt: now
        }));
      }
    } catch (error) {
      console.error('Failed to check login status:', error);
      // Fallback to localStorage data
      const stored = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
      if (stored.blocked) {
        setLoginStatus({ blocked: true, remainingAttempts: 0 });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginStatus?.blocked) return;
    
    setIsLoading(true);
    const success = await login(username, password);
    setIsLoading(false);
    
    if (success) {
      navigate('/');
    } else {
      // Refresh status after failed login
      setTimeout(checkStatus, 500);
    }
  };

  const formatTime = (seconds) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isBlocked = loginStatus?.blocked;
  const remainingAttempts = loginStatus?.remainingAttempts;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div>
          <h1 className="text-3xl font-extrabold text-center text-blue-600">CallFlow</h1>
          <p className="mt-2 text-center text-sm text-gray-600">Call Management System</p>
        </div>
        
        {isBlocked && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-center">
              <p className="text-red-800 font-medium">🔒 Account Locked</p>
              <p className="text-red-600 text-sm mt-1">Too many failed attempts</p>
              <div className="mt-3">
                <span className="text-2xl font-mono text-red-700">{formatTime(countdown)}</span>
                <p className="text-xs text-red-500 mt-1">Time remaining</p>
              </div>
            </div>
          </div>
        )}
        
        {!isBlocked && remainingAttempts !== undefined && remainingAttempts < 5 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm text-center">
              ⚠️ {remainingAttempts} attempt(s) remaining
            </p>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-bold text-gray-700 tracking-wide">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              required
              disabled={isBlocked}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              required
              disabled={isBlocked}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || isBlocked}
            className={`w-full py-3 px-4 text-lg font-semibold text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              isBlocked 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
            }`}
          >
            {isBlocked ? '🔒 Account Locked' : isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        {!isBlocked && remainingAttempts !== undefined && remainingAttempts < 5 && (
          <div className="text-center text-xs text-gray-500">
            Wrong credentials will decrease remaining attempts
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;