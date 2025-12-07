
import React, { useEffect, useState } from 'react';
import { Donation, Event } from '../../types';
import api from '../../api/axiosInstance';
import { Check, X, Search, Download } from 'lucide-react';
import { MOCK_DONATIONS } from '../../services/mockData';
import LoadingScreen from '../../components/common/LoadingScreen';
import { exportToExcel } from '../../utils/excelExport';

const AdminDonations: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('');

  useEffect(() => {
    const init = async () => {
        await Promise.all([fetchDonations(), fetchEvents()]);
        setLoading(false);
    };
    init();
  }, []);

  const fetchEvents = async () => {
      try {
          const res = await api.get('/events');
          setEvents(res.data);
      } catch (err) {}
  };

  const fetchDonations = async () => {
    try {
      const res = await api.get('/donations');
      setDonations(res.data);
    } catch (err) {
      console.error("Failed to fetch donations", err);
      setDonations(MOCK_DONATIONS);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/donations/${id}/status`, { status: newStatus });
      setDonations(prev => prev.map(d => 
        (d._id === id || d.id === id) ? { ...d, status: newStatus as any } : d
      ));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredDonations = donations.filter(d => {
    const matchesStatus = statusFilter === 'all' ? true : d.status === statusFilter;
    const matchesEvent = eventFilter === '' ? true : (d.eventId?._id === eventFilter || d.eventId?.id === eventFilter);
    return matchesStatus && matchesEvent;
  });

  const handleDownload = async () => {
    const dataToExport = filteredDonations.map(d => ({
      'Date': new Date(d.donationDate || d.date || '').toLocaleDateString(),
      'Donor Name': d.donorName,
      'Phone': d.donorPhone || 'N/A',
      'Amount': d.amount,
      'Method': d.paymentMethod,
      'Transaction ID': d.transactionId,
      'Event': (d.eventId as any)?.title || 'General Fund',
      'Status': d.status
    }));

    await exportToExcel(dataToExport, `Donations_Report_${statusFilter}_${new Date().toISOString().split('T')[0]}`);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Manage Donations</h1>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
           {/* Event Filter */}
           <select 
             className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
             value={eventFilter}
             onChange={(e) => setEventFilter(e.target.value)}
           >
             <option value="">All Events</option>
             {events.map(ev => (
                 <option key={ev._id || ev.id} value={ev._id || ev.id}>{ev.title}</option>
             ))}
           </select>

           {/* Status Filter */}
           <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
             <button 
               onClick={() => setStatusFilter('all')}
               className={`px-3 py-1 text-sm rounded-md transition ${statusFilter === 'all' ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-500'}`}
             >
               All
             </button>
             <button 
               onClick={() => setStatusFilter('pending')}
               className={`px-3 py-1 text-sm rounded-md transition ${statusFilter === 'pending' ? 'bg-amber-100 font-bold text-amber-800' : 'text-gray-500'}`}
             >
               Pending
             </button>
             <button 
               onClick={() => setStatusFilter('confirmed')}
               className={`px-3 py-1 text-sm rounded-md transition ${statusFilter === 'confirmed' ? 'bg-green-100 font-bold text-green-800' : 'text-gray-500'}`}
             >
               Confirmed
             </button>
           </div>
           
           <button 
             onClick={handleDownload}
             className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm ml-auto md:ml-0"
           >
             <Download size={16} /> Excel
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Donor Name</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Event</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDonations.map((d) => (
              <tr key={d._id || d.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{d.donorName}</div>
                  <div className="text-xs text-gray-500">{d.donorPhone}</div>
                </td>
                <td className="px-6 py-4 text-emerald-600 font-bold">
                  ৳ {d.amount}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 capitalize">{d.paymentMethod}</div>
                  <div className="text-xs font-mono text-gray-500 uppercase">{d.transactionId}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {(d.eventId as any)?.title || 'General Fund'}
                </td>
                <td className="px-6 py-4">
                  {d.status === 'confirmed' && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Confirmed</span>}
                  {d.status === 'pending' && <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">Pending</span>}
                  {d.status === 'failed' && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">Failed</span>}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(d.donationDate || d.date || '').toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {d.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => updateStatus(d._id || d.id || '', 'confirmed')}
                         className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100" 
                         title="Confirm"
                       >
                         <Check size={16} />
                       </button>
                       <button 
                         onClick={() => updateStatus(d._id || d.id || '', 'failed')}
                         className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                         title="Reject"
                       >
                         <X size={16} />
                       </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredDonations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No donations found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDonations;
