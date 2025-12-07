
import React, { useState, useEffect } from 'react';
import { Lock, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { MOCK_USERS } from '../../services/mockData';
import { UserRole } from '../../types';

const LoginPage: React.FC = () => {
  const { login, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.role === UserRole.ADMIN ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Try real backend login
      const { data } = await api.post('/auth/login', { phone, password });
      login(data.token, data);
      const userRole = data.role || data.user?.role;
      navigate(userRole === UserRole.ADMIN || userRole === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err: any) {
      console.warn("Backend login failed:", err.message);

      // 2. Fallback: Check for Mock Credentials if backend fails (Network Error or 404/500)
      // This allows the demo to work without a running backend
      const mockUser = MOCK_USERS.find(u => u.phone === phone);
      
      // Allow mock login if the backend is down (Network Error) OR if using specific demo numbers
      if ((!err.response || err.code === "ERR_NETWORK") && mockUser) {
        // Simulate a delay
        await new Promise(r => setTimeout(r, 800));
        
        // Mock token and user data
        const mockToken = "mock_jwt_token_" + Date.now();
        const userData = { ...mockUser, token: mockToken };
        
        login(mockToken, userData);
        navigate(mockUser.role === UserRole.ADMIN ? '/admin' : '/dashboard', { replace: true });
        return;
      }

      setError(err.response?.data?.message || 'Invalid mobile number or password');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdmin = () => {
    setPhone('01700000000');
    setPassword('123456');
  };

  const fillUser = () => {
    setPhone('01800000000');
    setPassword('123456');
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is already logged in (redirect will happen)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50 dark:bg-slate-900 animate-fade-in">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Member Login</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Welcome back to Hilful Fuzul</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm text-center border border-red-200 dark:border-red-800 flex items-center justify-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-700 dark:text-white transition-colors"
                placeholder="017xxxxxxxx"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-700 dark:text-white transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition shadow-md disabled:bg-emerald-400 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account? <Link to="/register" className="text-emerald-600 font-semibold hover:underline">Register now</Link>
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 text-center">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={fillAdmin}
               className="p-2 bg-gray-50 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 rounded-lg text-xs text-left transition group"
             >
                <div className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600">Admin</div>
                <div className="text-gray-500 dark:text-gray-400">01700000000</div>
                <div className="text-gray-400 dark:text-gray-500 text-[10px]">Pass: 123456</div>
             </button>
             <button 
               onClick={fillUser}
               className="p-2 bg-gray-50 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 rounded-lg text-xs text-left transition group"
             >
                <div className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600">Member</div>
                <div className="text-gray-500 dark:text-gray-400">01800000000</div>
                <div className="text-gray-400 dark:text-gray-500 text-[10px]">Pass: 123456</div>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
