
import React from 'react';
import { User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const MembersPage: React.FC = () => {
  const { t } = useLanguage();
  // Generate mock members
  const members = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Member Name ${i + 1}`,
    joinDate: `Jan 202${3 + (i % 2)}`
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('membersTitle')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {t('membersDesc')}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <User size={28} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('memberSince')} {member.joinDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersPage;
