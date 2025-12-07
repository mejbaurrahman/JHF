import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock auth
    const foundUser = users.find(u => u.email === email);
    
    // In a real app, we check password hash. Here we mock:
    if (foundUser) {
        // Password check mock: admin123 or user123
        if((foundUser.role === 'admin' && password === 'admin123') || (foundUser.role === 'user' && password === 'user123')) {
            onLogin(foundUser);
            return;
        }
    }
    
    setError('Invalid email or password');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Member Login</h1>
          <p className="text-gray-500 text-sm mt-2">Welcome back to Hilful Fuzul</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition shadow-md"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-bold mb-1">Demo Credentials:</p>
          <div className="flex justify-between">
            <span>Admin: admin@gmail.com / admin123</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>User: user@gmail.com / user123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;