import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutInfo, setLockoutInfo] = useState(null);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLockoutInfo(null);
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/');
      }
    } catch (error) {
      // Handle account lockout
      if (error.response?.status === 429) {
        const data = error.response.data;
        setLockoutInfo(data);
        
        if (data.message?.includes('locked')) {
          toast.error(data.message);
        } else {
          toast.error('Too many login attempts. Please try again later.');
        }
      } else if (error.response?.status === 401) {
        toast.error('Invalid username or password');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isAccountLocked = lockoutInfo?.message?.includes('locked');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div>
          <h1 className="text-3xl font-extrabold text-center text-blue-600">CallFlow</h1>
          <p className="mt-2 text-center text-sm text-gray-600">Call Management System</p>
        </div>
        
        {/* Account Lockout Warning */}
        {isAccountLocked && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Account Temporarily Locked</h3>
                <p className="mt-1 text-sm text-red-700">
                  {lockoutInfo.message}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-bold text-gray-700 tracking-wide">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              required
              disabled={isAccountLocked || isLoading}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              required
              disabled={isAccountLocked || isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || isAccountLocked}
            className="w-full py-3 px-4 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : isAccountLocked ? 'Account Locked' : 'Sign in'}
          </button>
        </form>
        
        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔒 Your account will be temporarily locked after 5 failed login attempts
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;