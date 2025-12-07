import React from 'react';

interface LoadingScreenProps {
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ fullScreen = false }) => {
  const containerClass = fullScreen 
    ? "fixed inset-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center" 
    : "flex flex-col items-center justify-center min-h-[400px] w-full py-12";

  return (
    <div className={containerClass}>
      <div className="relative flex items-center justify-center mb-4">
        {/* Outer Spinning Ring */}
        <div className="absolute w-20 h-20 border-4 border-emerald-100 dark:border-emerald-900 rounded-full"></div>
        <div className="absolute w-20 h-20 border-4 border-t-emerald-600 border-r-emerald-600 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        
        {/* Inner Pulsing Logo */}
        <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center animate-pulse z-10">
           <img 
             src="/logo.png" 
             alt="Loading..." 
             className="w-full h-full object-cover"
             onError={(e) => {
               e.currentTarget.style.display = 'none';
             }}
           />
           {/* Fallback if image fails or loading */}
           <img 
             src="https://placehold.co/100x100/10b981/ffffff?text=JHF" 
             alt="Fallback" 
             className="w-full h-full object-cover hidden peer-[:not([src])]:block" 
           />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          Jesobantapur Hilful Fuzul
        </h3>
        <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm animate-pulse">
          Loading content...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;