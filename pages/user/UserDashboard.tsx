
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  CreditCard, 
  Calendar, 
  Bell, 
  ArrowRight, 
  TrendingUp, 
  Clock 
} from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Donation, Fee, Event, Notification } from '../../types';
import LoadingScreen from '../../components/common/LoadingScreen';
import { MOCK_DONATIONS, MOCK_FEES, MOCK_EVENTS } from '../../services/mockData';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalFees: 0,
    pendingFees: 0,
    upcomingEvents: 0
  });
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Donations
        let donationsData: Donation[] = [];
        try {
          const res = await api.get('/donations/my');
          donationsData = res.data;
        } catch {
          // Fallback mock
          donationsData = MOCK_DONATIONS.filter(d => d.donorName === user?.name);
        }

        // Fetch Fees
        let feesData: Fee[] = [];
        try {
           const res = await api.get('/fees/my');
           feesData = res.data;
        } catch {
           feesData = MOCK_FEES.filter(f => f.userId === user?._id || f.userId === user?.id || f.userId === '2');
        }

        // Fetch Notifications
        try {
          const res = await api.get('/notifications');
          setNotifications(res.data.slice(0, 3));
        } catch {
          // Mock notifications if backend not ready
          setNotifications([
             { _id: '1', message: 'Welcome to your new dashboard!', type: 'info', isRead: false, createdAt: new Date().toISOString() }
          ]);
        }

        // Calculate Stats
        const totalDonations = donationsData
          .filter(d => d.status === 'confirmed')
          .reduce((sum, d) => sum + d.amount, 0);

        const totalFees = feesData
          .filter(f => f.status === 'paid')
          .reduce((sum, f) => sum + f.amount, 0);
        
        const pendingFees = feesData.filter(f => f.status === 'pending').length;

        // Fetch Events for count
        // Assuming we have an endpoint or logic for user joined events, 
        // for now just showing general upcoming count from public API or mock
        setStats({
          totalDonations,
          totalFees,
          pendingFees,
          upcomingEvents: 0 // To be implemented with user participation logic
        });

        setRecentDonations(donationsData.slice(0, 5));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assalamu Alaikum, {user?.name}</h1>
          <p className="text-gray-500">Here's what's happening with your account.</p>
        </div>
        <Link to="/donate" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition shadow-sm">
           Donate Now
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
               <Heart size={24} />
             </div>
             <div>
               <p className="text-gray-500 text-sm font-medium">Total Donated</p>
               <h3 className="text-2xl font-bold text-gray-900">৳ {stats.totalDonations.toLocaleString()}</h3>
             </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
               <CreditCard size={24} />
             </div>
             <div>
               <p className="text-gray-500 text-sm font-medium">Fees Paid</p>
               <h3 className="text-2xl font-bold text-gray-900">৳ {stats.totalFees.toLocaleString()}</h3>
             </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
               <Clock size={24} />
             </div>
             <div>
               <p className="text-gray-500 text-sm font-medium">Pending Fees</p>
               <h3 className="text-2xl font-bold text-gray-900">{stats.pendingFees} Months</h3>
             </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
               <Calendar size={24} />
             </div>
             <div>
               <p className="text-gray-500 text-sm font-medium">Active Events</p>
               <h3 className="text-2xl font-bold text-gray-900">View All</h3>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Donations */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 className="font-bold text-gray-900">Recent Donations</h3>
             <Link to="/dashboard/donations" className="text-emerald-600 text-sm font-medium hover:underline flex items-center gap-1">
               View All <ArrowRight size={14} />
             </Link>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                   <th className="px-6 py-3 font-medium text-gray-500">Amount</th>
                   <th className="px-6 py-3 font-medium text-gray-500">Event/Fund</th>
                   <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {recentDonations.length > 0 ? recentDonations.map((d) => (
                   <tr key={d._id || d.id}>
                     <td className="px-6 py-4 text-gray-600">{new Date(d.donationDate || d.date || '').toLocaleDateString()}</td>
                     <td className="px-6 py-4 font-bold text-emerald-600">৳ {d.amount}</td>
                     <td className="px-6 py-4 text-gray-600">{(d.eventId as any)?.title || 'General Fund'}</td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          d.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          d.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {d.status}
                        </span>
                     </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No recent donations found.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

        {/* Notifications Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 className="font-bold text-gray-900">Notifications</h3>
             <Link to="/dashboard/notifications" className="text-emerald-600 text-sm font-medium hover:underline">View All</Link>
           </div>
           <div className="divide-y divide-gray-100">
             {notifications.length > 0 ? notifications.map(notif => (
               <div key={notif._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      <Bell size={16} className={notif.isRead ? 'text-gray-400' : 'text-emerald-600'} />
                    </div>
                    <div>
                      <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{notif.message}</p>
                      <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
               </div>
             )) : (
               <div className="p-8 text-center text-gray-500 text-sm">
                 No new notifications.
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
