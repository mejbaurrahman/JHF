
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../../types';
import api from '../../api/axiosInstance';
import { Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import { MOCK_EVENTS } from '../../services/mockData';
import LoadingScreen from '../../components/common/LoadingScreen';

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events?status='); // get all statuses
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events", err);
      setEvents(MOCK_EVENTS); // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => (e._id || e.id) !== id));
    } catch (err) {
      alert("Failed to delete event. It might be linked to donations.");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
        <Link 
          to="/admin/events/new" 
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition"
        >
          <Plus size={18} /> Create Event
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event._id || event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{event.title}</div>
                  <div className="text-xs text-gray-500 flex items-center mt-1">
                    <MapPin size={12} className="mr-1" /> {event.location || 'No Location'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100 uppercase">
                    {event.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {new Date(event.startDate || event.date || '').toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    event.status === 'upcoming' ? 'bg-amber-100 text-amber-800' :
                    event.status === 'ongoing' ? 'bg-emerald-100 text-emerald-800' :
                    event.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status || 'upcoming'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      to={`/admin/events/${event._id || event.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(event._id || event.id || '')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No events found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminEvents;
