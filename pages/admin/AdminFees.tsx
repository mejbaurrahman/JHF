
import React, { useEffect, useState } from 'react';
import { Fee, User } from '../../types';
import api from '../../api/axiosInstance';
import { Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import LoadingScreen from '../../components/common/LoadingScreen';

const AdminFees: React.FC = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        const usersRes = await api.get('/auth/users');
        setUsers(usersRes.data);
        fetchFees();
      } catch (err) {
        console.error("Error initializing fees page", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const fetchFees = async () => {
    try {
      let query = `?year=${selectedYear}`;
      if (selectedMonth) query += `&month=${selectedMonth}`;
      if (selectedUser) query += `&userId=${selectedUser}`;
      if (statusFilter) query += `&status=${statusFilter}`;

      const res = await api.get(`/fees${query}`);
      setFees(res.data);
    } catch (err) {
      console.error("Failed to fetch fees", err);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    fetchFees();
  }, [selectedUser, selectedMonth, selectedYear, statusFilter]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Membership Fees</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Filter size={18} />
          <span className="font-medium text-sm">Filters:</span>
        </div>
        
        <select 
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">All Members</option>
          {users.map(u => <option key={u._id || u.id} value={u._id || u.id}>{u.name}</option>)}
        </select>

        <select 
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select 
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">All Months</option>
          {Array.from({length: 12}, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{new Date(0, m-1).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>

        <select 
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Member</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fees.map((fee) => (
              <tr key={fee._id || fee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {(fee.userId as any)?.name || 'Unknown User'}
                  </div>
                  <div className="text-xs text-gray-500">{(fee.userId as any)?.email}</div>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {new Date(0, fee.month - 1).toLocaleString('default', { month: 'long' })} {fee.year}
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">৳ {fee.amount}</td>
                <td className="px-6 py-4 text-gray-600 text-sm capitalize">{fee.paymentMethod}</td>
                <td className="px-6 py-4">
                  {fee.status === 'paid' && (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full w-fit">
                      <CheckCircle size={12} /> Paid
                    </span>
                  )}
                  {fee.status === 'pending' && (
                    <span className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded-full w-fit">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                  {fee.status === 'failed' && (
                    <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full w-fit">
                      <XCircle size={12} /> Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {fees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No fee records found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFees;