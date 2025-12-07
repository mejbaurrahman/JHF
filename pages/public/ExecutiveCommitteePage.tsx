
import React, { useEffect, useState } from 'react';
import { User, Shield, Star, Award, TrendingUp, BookOpen, DollarSign, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/axiosInstance';
import { CommitteeMember } from '../../types';
import LoadingScreen from '../../components/common/LoadingScreen';

const ExecutiveCommitteePage: React.FC = () => {
  const { t } = useLanguage();
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get('/content/committee');
        if (res.data.length > 0) {
           setMembers(res.data);
        } else {
           // Fallback default
           setMembers(defaultCommittee);
        }
      } catch (error) {
        setMembers(defaultCommittee);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // Icon mapping
  const getIcon = (roleKey: string) => {
    switch(roleKey) {
      case 'president': return <Shield size={32} />;
      case 'vicePresident': return <Star size={32} />;
      case 'treasurer': return <DollarSign size={32} />;
      case 'organizingSecretary': return <TrendingUp size={32} />;
      case 'educationSecretary': return <BookOpen size={32} />;
      default: return <User size={32} />;
    }
  };

  const getColors = (roleKey: string) => {
     switch(roleKey) {
       case 'president': return 'bg-blue-100 text-blue-600';
       case 'vicePresident': return 'bg-indigo-100 text-indigo-600';
       case 'treasurer': return 'bg-amber-100 text-amber-600';
       case 'organizingSecretary': return 'bg-purple-100 text-purple-600';
       default: return 'bg-emerald-100 text-emerald-600';
     }
  };

  const defaultCommittee: any[] = [
    { _id: '1', name: 'Md. Abdul Karim', roleKey: 'president', order: 1 },
    { _id: '2', name: 'Sheikh Rahim', roleKey: 'vicePresident', order: 2 },
    { _id: '3', name: 'Ahmed Ali', roleKey: 'generalSecretary', order: 3 },
  ];

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('committeeTitle')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {t('committeeDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((member) => {
          const colors = getColors(member.roleKey);
          return (
            <div key={member._id || member.id} className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center group">
              <div className={`w-24 h-24 ${colors} rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 overflow-hidden`}>
                {member.imageUrl ? (
                  <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  getIcon(member.roleKey)
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{member.name}</h3>
              <p className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">{t(member.roleKey as any) || member.roleKey}</p>
              
              {member.phone && (
                <a
                  href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors mt-2 group/wa"
                  title={`Contact ${member.name} on WhatsApp`}
                >
                  <MessageCircle size={18} className="group-hover/wa:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{member.phone}</span>
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExecutiveCommitteePage;
