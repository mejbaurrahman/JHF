
import React, { useEffect, useState } from 'react';
import { FinanceSummary, Donation, Event } from '../../types';
import api from '../../api/axiosInstance';
import { DollarSign, Wallet, TrendingDown, AlertTriangle, Users, Calendar, Clock, FileText, Briefcase, Image as ImageIcon, ArrowRight, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import LoadingScreen from '../../components/common/LoadingScreen';
import { Link } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';

const AdminDashboard: React.FC = () => {
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Parallel fetching
        const [financeRes, donationsRes, eventsRes] = await Promise.allSettled([
          api.get('/finance/summary'),
          api.get('/donations?limit=5'),
          api.get('/events?limit=5')
        ]);

        if (financeRes.status === 'fulfilled') {
          setFinance(financeRes.value.data);
        } else {
          throw new Error('Finance fetch failed');
        }

        if (donationsRes.status === 'fulfilled') {
          setRecentDonations(donationsRes.value.data.slice(0, 5));
        }

        if (eventsRes.status === 'fulfilled') {
          setRecentEvents(eventsRes.value.data.slice(0, 5));
        }

        setUsingMock(false);
      } catch (err: any) {
        console.warn("Failed to fetch dashboard data, using mock.", err.message);
        // Fallback mock data
        setFinance({
          totalDonations: 250000,
          totalConfirmedDonations: 180000,
          totalFees: 45000,
          totalExpenses: 120000,
          netBalance: 105000,
          userCount: 150,
          eventCount: 3,
          pendingDonationCount: 5
        });
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleDownloadReport = async () => {
    if (!finance) return;
    
    const data = [
      { Metric: 'Total Donations Received', Value: finance.totalConfirmedDonations, Currency: 'BDT' },
      { Metric: 'Total Membership Fees', Value: finance.totalFees, Currency: 'BDT' },
      { Metric: 'Total Expenses', Value: finance.totalExpenses, Currency: 'BDT' },
      { Metric: 'Net Balance', Value: finance.netBalance, Currency: 'BDT' },
      { Metric: '---', Value: '---', Currency: '---' },
      { Metric: 'Total Members', Value: finance.userCount, Currency: 'Count' },
      { Metric: 'Active Events', Value: finance.eventCount, Currency: 'Count' },
      { Metric: 'Pending Donations', Value: finance.pendingDonationCount, Currency: 'Count' },
      { Metric: 'Generated At', Value: new Date().toLocaleString(), Currency: '' },
    ];

    await exportToExcel(data, `Financial_Summary_${new Date().toISOString().split('T')[0]}`);
  };

  if (loading) return <LoadingScreen />;
  if (!finance) return <div className="p-8">Failed to load data.</div>;

  const pieData = [
    { name: 'Donations', value: finance.totalConfirmedDonations },
    { name: 'Fees', value: finance.totalFees },
  ];
  
  const COLORS = ['#10b981', '#8b5cf6']; // Emerald, Purple

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of organization performance</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {usingMock && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-sm border border-amber-200">
              <AlertTriangle size={16} />
              <span>Demo Data</span>
            </div>
          )}
          <button 
            onClick={handleDownloadReport}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
          >
            <Download size={16} /> Download Report
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {finance.pendingDonationCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <div className="bg-amber-100 p-2 rounded-full text-amber-600">
               <Clock size={20} />
             </div>
             <div>
               <h3 className="font-bold text-amber-800">Pending Donations</h3>
               <p className="text-amber-700 text-sm">You have {finance.pendingDonationCount} donations waiting for approval.</p>
             </div>
          </div>
          <Link to="/admin/donations" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition">
            Review Now
          </Link>
        </div>
      )}

      {/* Financial Overview Cards */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-100 text-teal-600 rounded-lg">
                <DollarSign size={24} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Total Donations</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">৳ {finance.totalConfirmedDonations.toLocaleString()}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <Wallet size={24} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Fees Collected</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">৳ {finance.totalFees.toLocaleString()}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                <TrendingDown size={24} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Total Expenses</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">৳ {finance.totalExpenses.toLocaleString()}</h3>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition transform hover:-translate-y-1">
            <p className="text-emerald-100 text-sm font-medium mb-1">Net Balance</p>
            <h3 className="text-3xl font-bold">৳ {finance.netBalance.toLocaleString()}</h3>
            <p className="text-emerald-200 text-xs mt-2">Available for projects</p>
          </div>
        </div>
      </section>

      {/* Operational Stats */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-4">Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
             <div>
               <p className="text-gray-500 text-sm font-medium">Total Members</p>
               <h3 className="text-2xl font-bold text-gray-900 mt-1">{finance.userCount}</h3>
             </div>
             <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
               <Users size={24} />
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
             <div>
               <p className="text-gray-500 text-sm font-medium">Active Events</p>
               <h3 className="text-2xl font-bold text-gray-900 mt-1">{finance.eventCount}</h3>
             </div>
             <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
               <Calendar size={24} />
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
             <div>
               <p className="text-gray-500 text-sm font-medium">Pending Donations</p>
               <h3 className="text-2xl font-bold text-gray-900 mt-1">{finance.pendingDonationCount}</h3>
             </div>
             <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
               <Clock size={24} />
             </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Donations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Recent Donations</h3>
            <Link to="/admin/donations" className="text-emerald-600 text-sm hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Donor</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Amount</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentDonations.length > 0 ? recentDonations.map(d => (
                  <tr key={d._id || d.id}>
                    <td className="px-4 py-3">{d.donorName}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">৳ {d.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${d.status === 'confirmed' ? 'bg-green-100 text-green-700' : d.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Events Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Upcoming Events</h3>
            <Link to="/admin/events" className="text-emerald-600 text-sm hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Title</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentEvents.length > 0 ? recentEvents.map(e => (
                  <tr key={e._id || e.id}>
                    <td className="px-4 py-3 truncate max-w-[150px]">{e.title}</td>
                    <td className="px-4 py-3">{new Date(e.startDate || e.date || '').toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs uppercase">{e.status || 'Upcoming'}</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions / CMS */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-4">Content Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/admin/cms" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Edit Site Content</h3>
            <p className="text-sm text-gray-500">Update Home text, Mission, Vision</p>
          </Link>
          <Link to="/admin/committee" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Executive Committee</h3>
            <p className="text-sm text-gray-500">Manage leadership team members</p>
          </Link>
          <Link to="/admin/gallery" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ImageIcon size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Photo Gallery</h3>
            <p className="text-sm text-gray-500">Upload and manage event photos</p>
          </Link>
        </div>
      </section>

      {/* Income Distribution Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         <h3 className="text-lg font-bold mb-6">Income Distribution</h3>
         <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `৳ ${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
           </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
