
import React, { useEffect, useState } from 'react';
import { Heart, Users, BookOpen, DollarSign, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/axiosInstance';

const AboutPage: React.FC = () => {
  const { t } = useLanguage();
  const [content, setContent] = useState<any>({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get('/content/site/about');
        setContent(res.data);
      } catch (error) {
        // use defaults
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('aboutUs')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto whitespace-pre-line">
          {content.aboutDesc || t('aboutDesc')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
        <div>
           <img src="https://picsum.photos/800/600?random=about" alt="Team" className="rounded-xl shadow-lg" />
        </div>
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <h2 className="text-2xl font-bold text-emerald-600">{t('ourMission')}</h2>
          <p className="whitespace-pre-line">
            {content.missionDesc || t('missionDesc')}
          </p>
          <h2 className="text-2xl font-bold text-emerald-600">{t('ourVision')}</h2>
          <p className="whitespace-pre-line">
            {content.visionDesc || t('visionDesc')}
          </p>
        </div>
      </div>

      {/* Impact Section */}
      {(content.impacts && content.impacts.length > 0) && (
        <div className="border-t border-gray-100 dark:border-slate-800 pt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('ourImpact')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {content.impactSubtitle || t('impactSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.impacts.map((impact: any, index: number) => {
              const getIcon = () => {
                switch (impact.icon) {
                  case 'heart': return <Heart size={32} />;
                  case 'book': return <BookOpen size={32} />;
                  case 'users': return <Users size={32} />;
                  case 'dollar': return <DollarSign size={32} />;
                  case 'calendar': return <Calendar size={32} />;
                  default: return <Heart size={32} />;
                }
              };

              const getColorClasses = () => {
                switch (impact.color) {
                  case 'red': return 'bg-red-100 text-red-600';
                  case 'blue': return 'bg-blue-100 text-blue-600';
                  case 'teal': return 'bg-teal-100 text-teal-600';
                  case 'emerald': return 'bg-emerald-100 text-emerald-600';
                  case 'purple': return 'bg-purple-100 text-purple-600';
                  case 'amber': return 'bg-amber-100 text-amber-600';
                  default: return 'bg-red-100 text-red-600';
                }
              };

              return (
                <div key={index} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md text-center border border-gray-100 dark:border-slate-700">
                  <div className={`w-16 h-16 ${getColorClasses()} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    {getIcon()}
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{impact.value || ''}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{impact.label || ''}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fallback to default impacts if no content */}
      {(!content.impacts || content.impacts.length === 0) && (
        <div className="border-t border-gray-100 dark:border-slate-800 pt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('ourImpact')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('impactSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md text-center border border-gray-100 dark:border-slate-700">
               <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Heart size={32} />
               </div>
               <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">500+</h3>
               <p className="text-gray-600 dark:text-gray-400">{t('familiesSupported')}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md text-center border border-gray-100 dark:border-slate-700">
               <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <BookOpen size={32} />
               </div>
               <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">120+</h3>
               <p className="text-gray-600 dark:text-gray-400">{t('studentsSponsored')}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md text-center border border-gray-100 dark:border-slate-700">
               <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Users size={32} />
               </div>
               <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">50+</h3>
               <p className="text-gray-600 dark:text-gray-400">{t('activeVolunteers')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutPage;
