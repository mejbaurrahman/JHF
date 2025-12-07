import React from 'react';
import { Heart, Users, BookOpen } from 'lucide-react';

const ImpactPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Impact</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          See how your contributions are changing lives in our community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md text-center">
           <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <Heart size={32} />
           </div>
           <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">500+</h3>
           <p className="text-gray-600 dark:text-gray-400">Families Supported</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md text-center">
           <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <BookOpen size={32} />
           </div>
           <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">120+</h3>
           <p className="text-gray-600 dark:text-gray-400">Students Sponsored</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md text-center">
           <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <Users size={32} />
           </div>
           <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">50+</h3>
           <p className="text-gray-600 dark:text-gray-400">Active Volunteers</p>
        </div>
      </div>
    </div>
  );
};

export default ImpactPage;