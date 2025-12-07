
import React, { useEffect, useState } from 'react';
import { Fee } from '../../types';
import api from '../../api/axiosInstance';
import LoadingScreen from '../../components/common/LoadingScreen';
import { MOCK_FEES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const MyFees: React.FC = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await api.get('/fees/my');
        setFees(res.data);
      } catch (err) {
        console.warn("Using mock fees");
        setFees(MOCK_FEES.filter(f => f.userId === user?.id || f.userId === '2'));
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [user]);

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Membership Fees</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Current Status</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-1">Active Member</h3>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Monthly Fee</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">৳ 100</h3>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Last Payment</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">
              {fees.length > 0 ? `${fees[0].month}/${fees[0].year}` : 'N/A'}
            </h3>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Month/Year</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Payment Method</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Paid Date</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fees.map((fee) => (
              <tr key={fee._id || fee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {new Date(0, fee.month - 1).toLocaleString('default', { month: 'long' })} {fee.year}
                </td>
                <td className="px-6 py-4 text-gray-600">৳ {fee.amount}</td>
                <td className="px-6 py-4 text-gray-600 capitalize">{fee.paymentMethod}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {fee.paidAt ? new Date(fee.paidAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4">
                  {fee.status === 'paid' && (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
                      <CheckCircle size={16} /> Paid
                    </span>
                  )}
                  {fee.status === 'pending' && (
                    <span className="flex items-center gap-1 text-amber-600 text-sm font-bold">
                      <Clock size={16} /> Pending
                    </span>
                  )}
                  {fee.status === 'failed' && (
                    <span className="flex items-center gap-1 text-red-600 text-sm font-bold">
                      <XCircle size={16} /> Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {fees.length === 0 && (
              <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No fee history available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyFees;
