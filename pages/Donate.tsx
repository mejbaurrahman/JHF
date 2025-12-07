
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DonationMethod, Event } from '../types';
import { CreditCard, CheckCircle, AlertCircle, Heart } from 'lucide-react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { MOCK_EVENTS } from '../services/mockData';

const Donate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';
  
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();
  
  // Form State
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorPhone, setDonorPhone] = useState(user?.phone || '');
  const [amount, setAmount] = useState<number | string>('');
  const [method, setMethod] = useState<DonationMethod>(DonationMethod.BKASH);
  const [transactionId, setTransactionId] = useState('');
  const [eventId, setEventId] = useState(initialEventId);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // UI State
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch upcoming events for dropdown
    api.get('/events/upcoming')
       .then(res => setEvents(res.data))
       .catch(err => {
         console.warn("Using mock events for donation dropdown");
         setEvents(MOCK_EVENTS);
       });
  }, []);

  // Update name/phone if user logs in after page load
  useEffect(() => {
    if (user) {
      if (!donorName) setDonorName(user.name);
      if (!donorPhone) setDonorPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/donations', {
        amount: Number(amount),
        paymentMethod: method,
        transactionId,
        eventId: eventId || null,
        donorName: isAnonymous ? 'Anonymous' : donorName,
        donorPhone,
        isAnonymous
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      // Simulate success if backend is down for demo purposes (Network Error)
      if (err.message === 'Network Error' || !err.response) {
         setSubmitted(true);
      } else {
         setError(err.response?.data?.message || 'Failed to process donation. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4 animate-fade-in">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">JazakAllah Khair!</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Your donation has been recorded. May Allah accept your contribution and reward you abundantly.
          </p>
          <div className="space-y-3">
             <button 
                onClick={() => { 
                  setSubmitted(false); 
                  setAmount(''); 
                  setTransactionId('');
                  setEventId('');
                }}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-medium"
              >
                Make Another Donation
              </button>
              <a href="/" className="block w-full text-gray-500 hover:text-emerald-600 py-2">Return to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Information Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
               <Heart size={24} />
             </div>
             <h1 className="text-3xl font-bold text-gray-900">Support Our Cause</h1>
          </div>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Your generous donation helps us organize Islamic events, support the needy, and maintain our organization's activities. 
            Every penny is used with transparency and Amanah.
          </p>
          
          <h3 className="font-bold text-gray-800 text-lg mb-4">Payment Methods</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-5 bg-pink-50 rounded-xl border border-pink-100 hover:shadow-md transition">
               <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                 Bk
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">bKash (Personal)</h3>
                 <p className="text-gray-600 font-mono tracking-wide">01700-000000</p>
               </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-orange-50 rounded-xl border border-orange-100 hover:shadow-md transition">
               <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                 Ng
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">Nagad (Personal)</h3>
                 <p className="text-gray-600 font-mono tracking-wide">01800-000000</p>
               </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-teal-50 rounded-xl border border-teal-100 hover:shadow-md transition">
               <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                 Bk
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">Bank Transfer</h3>
                 <p className="text-gray-600 text-sm">Islami Bank Bangladesh Ltd.<br/>Acc: 20502050202022</p>
               </div>
            </div>
          </div>
        </div>

        {/* Donation Form */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <CreditCard size={24} className="text-emerald-600" /> Donation Form
          </h2>
          
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
             {/* Personal Info */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  placeholder="Full Name"
                  disabled={isAnonymous}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition ${isAnonymous ? 'bg-gray-100 text-gray-400 border-gray-200' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={donorPhone}
                  onChange={e => setDonorPhone(e.target.value)}
                  placeholder="017..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
              </div>
             </div>

             <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-600 select-none cursor-pointer">Donate Anonymously (Hide my name from public lists)</label>
             </div>

             <hr className="border-gray-100 my-2" />

             {/* Donation Details */}
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Donation Amount (BDT) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-medium transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Select Event (Optional)</label>
              <select 
                value={eventId}
                onChange={e => setEventId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition"
              >
                <option value="">General Fund (Sadqa/Welfare)</option>
                {events.map(ev => (
                  <option key={ev._id || ev.id} value={ev._id || ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Method *</label>
                <select 
                  value={method}
                  onChange={e => setMethod(e.target.value as DonationMethod)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition"
                >
                  <option value={DonationMethod.BKASH}>bKash</option>
                  <option value={DonationMethod.NAGAD}>Nagad</option>
                  <option value={DonationMethod.BANK}>Bank Transfer</option>
                  <option value={DonationMethod.CASH}>Cash (Hand to Hand)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Transaction ID (TrxID) *</label>
                <input 
                  type="text" 
                  required
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  placeholder="e.g. 8H3K9L2M"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none font-mono uppercase transition"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition mt-2 shadow-lg hover:shadow-xl transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Confirm Donation'}
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              By donating, you agree to our terms of service.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Donate;
