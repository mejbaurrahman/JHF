
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Calendar, ArrowRight, Quote, Info } from 'lucide-react';
import { Event } from '../../types';
import api from '../../api/axiosInstance';
import { MOCK_EVENTS } from '../../services/mockData';
import { useLanguage } from '../../context/LanguageContext';

const HomePage: React.FC = () => {
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [usingMock, setUsingMock] = useState(false);
  const [content, setContent] = useState<any>({});
  const { t } = useLanguage();

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
    
    const fetchContent = async () => {
      try {
        const res = await api.get('/content/site/home');
        setContent(res.data);
      } catch (error) {
        // use default
      }
    };

    fetchEvents();
    fetchContent();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white overflow-hidden min-h-[750px] flex items-center justify-center">
        <div className="absolute inset-0 opacity-30">
            <img src="https://picsum.photos/1920/1080" alt="Mosque Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/50 to-slate-900"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 text-center">
          
          {(content.logoUrl || '/logo.png') && (
            <img 
              src={content.logoUrl || '/logo.png'} 
              alt="Association Logo" 
              className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 rounded-full shadow-2xl border-4 border-emerald-500/30 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight">
            {content.organizationName || t('organizationName')}
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-emerald-400 mb-12 tracking-tight">
            {content.organizationSuffix || t('organizationSuffix')}
          </h2>
          
          {/* Ayah Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl mb-12 shadow-2xl max-w-4xl mx-auto transform transition duration-500 hover:scale-[1.01]">
              <Quote className="text-emerald-400 mx-auto mb-6 opacity-90" size={40} />
              
              <p className="text-2xl md:text-4xl font-serif leading-loose mb-6 text-white drop-shadow-md" dir="rtl">
                {content.heroAyahArabic || "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ"}
              </p>
              
              <p className="text-lg md:text-xl text-emerald-50 italic mb-8 font-light leading-relaxed">
                "{content.heroAyah || t('heroAyah')}"
              </p>
              
              <div className="flex items-center justify-center gap-4 text-emerald-400 text-xs md:text-sm font-bold tracking-[0.2em] uppercase opacity-90">
                <span className="h-px w-8 md:w-16 bg-emerald-400/60"></span>
                SURAH AL-MA'IDAH (5:2)
                <span className="h-px w-8 md:w-16 bg-emerald-400/60"></span>
              </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/donate" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-10 rounded-full transition transform hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-3 text-lg">
              <Heart size={22} className="fill-current" /> {t('donateNow')}
            </Link>
            <Link to="/events" className="bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white hover:text-emerald-900 text-white font-bold py-4 px-10 rounded-full transition transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-3 text-lg group">
              <Calendar size={22} className="group-hover:text-emerald-600 transition-colors" /> {t('viewEvents')}
            </Link>
          </div>
        </div>
      </div>

      {/* Mission Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center border-t-4 border-emerald-500">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{t('charityTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-300">{t('charityDesc')}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center border-t-4 border-teal-500">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{t('bondingTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-300">{t('bondingDesc')}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center border-t-4 border-emerald-600">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{t('religiousTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-300">{t('religiousDesc')}</p>
          </div>
        </div>
      </div>

      {/* Recent Events Preview */}
      <div className="bg-gray-50 dark:bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('latestUpdates')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{t('latestSubtitle')}</p>
            </div>
            <Link to="/events" className="text-emerald-600 font-semibold hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1">
              {t('viewAll')} <ArrowRight size={16} />
            </Link>
          </div>

          {usingMock && (
             <div className="mb-4 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm inline-block border border-emerald-100">
               {t('demoData')}
             </div>
          )}

          {recentEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recentEvents.slice(0, 2).map((event) => (
                <div key={event._id || event.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row hover:shadow-lg transition border border-gray-100 dark:border-slate-700">
                  <div className="md:w-1/3 bg-gray-200 dark:bg-slate-700 relative h-48 md:h-auto">
                      <img src={`https://picsum.photos/400/400?random=${event._id || event.id}`} alt="Event" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded text-xs font-bold text-emerald-600 shadow-sm uppercase">
                        {event.type}
                      </div>
                  </div>
                  <div className="p-6 md:w-2/3 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mt-1 mb-2 text-gray-900 dark:text-white line-clamp-1">{event.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">{event.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                       <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                         <Calendar size={14} className="mr-2 text-emerald-500" /> 
                         {new Date(event.startDate || event.date || '').toLocaleDateString()}
                       </div>
                       
                       <div className="flex gap-2">
                         <Link 
                           to={`/donate?eventId=${event._id || event.id}`}
                           className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                              event.status === 'completed' || event.status === 'cancelled'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none dark:bg-slate-700 dark:text-gray-500' 
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50'
                           }`}
                           onClick={(e) => {
                             if (event.status === 'completed' || event.status === 'cancelled') {
                               e.preventDefault();
                             }
                           }}
                         >
                           Participate ❤️
                         </Link>

                         <Link 
                           to={`/events/${event.slug || event.id}`} 
                           className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 px-4 py-2 rounded-lg text-sm font-semibold transition"
                         >
                           <Info size={16} /> {t('details')}
                         </Link>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('noEvents')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
