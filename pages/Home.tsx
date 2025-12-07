import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Calendar, ArrowRight, AlertTriangle } from 'lucide-react';
import { Event } from '../types';
import api from '../api/axiosInstance';
import { MOCK_EVENTS } from '../services/mockData';

const HomePage: React.FC = () => {
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events/upcoming');
        setRecentEvents(res.data);
      } catch (error) {
        console.warn("Failed to fetch events, using mock data");
        setRecentEvents(MOCK_EVENTS);
        setUsingMock(true);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="relative bg-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <img src="https://picsum.photos/1920/1080" alt="Mosque Background" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Jesobantapur Hilful Fuzul <br/><span className="text-emerald-400">Youth Association</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Uniting the youth for social welfare, charity, and Islamic values. Join us in making a difference in our village.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/donate" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-105 flex items-center justify-center gap-2">
              <Heart size={20} /> Donate Now
            </Link>
            <Link to="/events" className="bg-transparent border-2 border-white hover:bg-white hover:text-emerald-900 text-white font-bold py-3 px-8 rounded-full transition flex items-center justify-center gap-2">
              <Calendar size={20} /> View Events
            </Link>
          </div>
        </div>
      </div>

      {/* Mission Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Charity & Welfare</h3>
            <p className="text-gray-600">Helping the poor, orphan support, and emergency relief during crisis moments in our village.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Community Bonding</h3>
            <p className="text-gray-600">Strengthening brotherhood among villagers through regular meetings, counseling, and support.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Religious Events</h3>
            <p className="text-gray-600">Organizing Tafsirul Quran Mahfils, weekly Halaqas, and Islamic educational programs.</p>
          </div>
        </div>
      </div>

      {/* Recent Events Preview */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Latest Updates</h2>
              <p className="text-gray-600 mt-2">Check out what we have been up to recently.</p>
            </div>
            <Link to="/events" className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {usingMock && (
             <div className="mb-4 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm inline-block">
               Showing demo data
             </div>
          )}

          {recentEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recentEvents.slice(0, 2).map((event) => (
                <div key={event._id || event.id} className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col md:flex-row">
                  <div className="md:w-1/3 bg-gray-200">
                      <img src={`https://picsum.photos/400/400?random=${event._id || event.id}`} alt="Event" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 md:w-2/3 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">{event.type}</span>
                      <h3 className="text-xl font-bold mt-2 mb-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-2" /> {new Date(event.startDate || event.date || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No upcoming events at the moment.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;