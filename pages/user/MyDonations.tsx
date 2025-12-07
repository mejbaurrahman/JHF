
import React, { useEffect, useState } from 'react';
import { Donation } from '../../types';
import api from '../../api/axiosInstance';
import LoadingScreen from '../../components/common/LoadingScreen';
import { MOCK_DONATIONS } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { Search, Download } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';

const MyDonations: React.FC = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await api.get('/donations/my');
        setDonations(res.data);
      } catch (err) {
        console.warn("Using mock data");
        setDonations(MOCK_DONATIONS.filter(d => d.donorName === user?.name || d.userId === user?.id));
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, [user]);

  const filteredDonations = donations.filter(d => 
    d.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((d.eventId as any)?.title || 'General Fund').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async () => {
    const data = filteredDonations.map(d => ({
       'Date': new Date(d.donationDate || d.date || '').toLocaleDateString(),
       'Amount': d.amount,
       'Method': d.paymentMethod,
       'Transaction ID': d.transactionId,
       'Event': (d.eventId as any)?.title || 'General Fund',
       'Status': d.status
    }));
    await exportToExcel(data, `My_Donations_${new Date().toISOString().split('T')[0]}`);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative flex-grow md:flex-grow-0">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Search TRX ID or Event..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
             />
           </div>
           <button 
             onClick={handleDownload}
             className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
           >
             <Download size={18} /> Export
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Event</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDonations.length > 0 ? filteredDonations.map((d) => (
              <tr key={d._id || d.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                  ৳ {d.amount}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(d.donationDate || d.date || '').toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                  {d.paymentMethod}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {(d.eventId as any)?.title || 'General Fund'}
                </td>
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
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No donations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyDonations;
