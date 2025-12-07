
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../types';
import { Calendar, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../api/axiosInstance';
import { MOCK_EVENTS } from '../services/mockData';
import LoadingScreen from '../components/common/LoadingScreen';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [viewType, setViewType] = useState<'upcoming' | 'all'>('upcoming');

  const fetchEvents = async (type: 'upcoming' | 'all') => {
    setLoading(true);
    try {
      // If type is upcoming, hit the upcoming endpoint, else hit the main list
      const endpoint = type === 'upcoming' ? '/events/upcoming' : '/events';
      const res = await api.get(endpoint);
      setEvents(res.data);
      setUsingMockData(false);
    } catch (error: any) {
      console.warn("Failed to load events from API, falling back to mock data.", error.message);
      setEvents(MOCK_EVENTS);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(viewType);
  }, [viewType]);

  // Simple check icon component for local use
  const CheckIcon = ({ size = 14 }: { size?: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Join our gatherings to strengthen your faith and serve the community.
        </p>
        
        {/* Toggle View */}
        <div className="mt-6 flex justify-center gap-4">
           <button 
             onClick={() => setViewType('upcoming')}
             className={`px-4 py-2 rounded-full text-sm font-bold transition ${viewType === 'upcoming' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
           >
             Upcoming
           </button>
           <button 
             onClick={() => setViewType('all')}
             className={`px-4 py-2 rounded-full text-sm font-bold transition ${viewType === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
           >
             All Events
           </button>
        </div>

        {usingMockData && (
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm border border-amber-200">
            <AlertCircle size={16} />
            <span>Backend unavailable. Showing demo data.</span>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.length === 0 ? (
              <div className="col-span-full text-center bg-gray-50 dark:bg-slate-800 rounded-xl p-12">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 dark:text-gray-400">No events found.</p>
                <Link to="/" className="text-emerald-600 font-medium mt-2 inline-block hover:underline">Return Home</Link>
              </div>
          ) : (
            events.map((event) => {
              const isInactive = event.status === 'completed' || event.status === 'cancelled';
              const isOngoing = event.status === 'ongoing';

              return (
                <div key={event._id || event.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col h-full">
                  <div className="h-48 bg-gray-200 dark:bg-slate-700 relative group">
                    <img src={event.bannerUrl || `https://picsum.photos/600/400?random=${event._id || event.id}`} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-sm uppercase tracking-wide">
                      {event.type}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    {/* Status Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                         isOngoing ? 'bg-emerald-100 text-emerald-700 animate-pulse' :
                         event.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                         event.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                         'bg-amber-100 text-amber-700'
                      }`}>
                        {event.status === 'completed' && <CheckIcon size={12} />}
                        {event.status || 'Upcoming'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">{event.title}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Calendar size={16} className="mr-2 text-emerald-500 flex-shrink-0" />
                        <span>{new Date(event.startDate || event.date || '').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <MapPin size={16} className="mr-2 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6 flex-grow">
                      {event.description}
                    </p>

                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center gap-3 mt-auto">
                       {/* Participate Button */}
                       <Link 
                         to={`/donate?eventId=${event._id || event.id}`}
                         onClick={(e) => { if(isInactive) e.preventDefault(); }}
                         className={`flex-1 text-center py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                            isInactive 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-700 dark:text-gray-500' 
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40'
                         }`}
                       >
                         Participate ❤️
                       </Link>

                       {/* Details Button */}
                       <Link 
                         to={`/events/${event.slug || event.id}`} 
                         className="flex-1 text-center py-2.5 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition flex items-center justify-center gap-1.5"
                       >
                         Details <ArrowRight size={14} />
                       </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Events;
