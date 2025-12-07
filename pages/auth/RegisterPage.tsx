
import React, { useState } from 'react';
import { User, Lock, Mail, Phone, FileText, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  // Show rules by default
  const [showRules, setShowRules] = useState(true);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // API Submission logic
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      login(data.token, data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Called when user clicks "I Accept" in the modal
  const handleAcceptRules = () => {
    setShowRules(false);
  };

  const handleDecline = () => {
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50 dark:bg-slate-900 py-12 relative">
      {!showRules && (
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Join the Association</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Become a member and support your community</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-700 dark:text-white"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-700 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-700 dark:text-white"
                  placeholder="017..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-700 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-700 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition shadow-md disabled:bg-emerald-400"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      )}

      {/* Rules & Regulations Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="bg-emerald-600 p-5 flex items-center gap-3">
              <FileText className="text-white" size={24} />
              <h2 className="text-xl font-bold text-white">Rules & Regulations</h2>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto text-sm text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed custom-scrollbar">
              <p className="font-medium text-gray-900 dark:text-white text-base">
                Welcome to Jesobantapur Hilful Fuzul Youth Association.
                Before joining, please read and accept our core principles:
              </p>
              
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  <strong>Commitment to Values:</strong> Members must adhere to the moral and ethical principles of the association, inspired by the spirit of Hilful Fuzul (serving the oppressed and needy).
                </li>
                <li>
                  <strong>Respect & Brotherhood:</strong> Every member must treat others with respect, maintaining a peaceful and brotherly environment. Bullying or harassment is strictly prohibited.
                </li>
                <li>
                  <strong>Non-Political Stance:</strong> This is a strictly non-political and non-profit organization. Promoting any political agenda or party within the association is forbidden.
                </li>
                <li>
                  <strong>Active Participation:</strong> Members are encouraged to actively participate in social work events, meetings, and emergency relief efforts organized by the committee.
                </li>
                <li>
                  <strong>Confidentiality:</strong> Internal matters and decisions of the executive committee must be kept confidential and not shared with unauthorized external parties.
                </li>
                <li>
                  <strong>Disciplinary Action:</strong> The Executive Committee reserves the right to revoke membership if any member is found violating these rules and regulations.
                </li>
              </ol>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex flex-col gap-4">
              <label className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                <input 
                  type="checkbox" 
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                  I have read and agree to the rules and regulations.
                </span>
              </label>

              <div className="flex gap-4">
                <button 
                  onClick={handleDecline}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
                >
                  <X size={18} /> Decline
                </button>
                <button 
                  onClick={handleAcceptRules}
                  disabled={!agreedToRules}
                  className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={18} /> I Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
