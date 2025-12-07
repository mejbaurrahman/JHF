import React, { useEffect, useState } from 'react';
import { Event } from '../../types';
import api from '../../api/axiosInstance';
import LoadingScreen from '../../components/common/LoadingScreen';
import { MOCK_EVENTS } from '../../services/mockData';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch only events user has joined.
    // Since we don't have that specific endpoint in the provided context,
    // we will fetch all upcoming events for demonstration.
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events/upcoming');
        setEvents(res.data);
      } catch (err) {
        setEvents(MOCK_EVENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Events</h1>
      <p className="text-gray-500 mb-8">Events you have participated in or donated to.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id || event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className="h-40 bg-gray-200 relative">
               <img src={event.bannerUrl || `https://picsum.photos/400/200?random=${event._id || event.id}`} className="w-full h-full object-cover" alt={event.title} />
               <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-emerald-600 uppercase">{event.type}</span>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                 <Calendar size={14} className="mr-2" />
                 {new Date(event.startDate || event.date || '').toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                 <MapPin size={14} className="mr-2" />
                 {event.location}
              </div>
              
              <Link 
                to={`/events/${event.slug || event.id}`}
                className="w-full border border-emerald-600 text-emerald-600 py-2 rounded-lg text-sm font-bold hover:bg-emerald-50 transition flex items-center justify-center gap-2"
              >
                View Details <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyEvents;