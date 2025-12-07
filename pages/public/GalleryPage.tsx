
import React, { useState, useEffect } from 'react';
import { ZoomIn, X, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/axiosInstance';
import { GalleryItem } from '../../types';
import LoadingScreen from '../../components/common/LoadingScreen';

const GalleryPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await api.get('/content/gallery');
        if (res.data.length > 0) {
            setGalleryItems(res.data);
        } else {
            // Default Fallback
            setGalleryItems(mockGalleryItems);
        }
      } catch (error) {
        setGalleryItems(mockGalleryItems);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const mockGalleryItems: any[] = [
    { _id: '1', imageUrl: 'https://picsum.photos/800/800?random=11', title: 'Annual Mahfil 2023' },
    { _id: '2', imageUrl: 'https://picsum.photos/800/800?random=12', title: 'Winter Blanket Distribution' },
    { _id: '3', imageUrl: 'https://picsum.photos/800/800?random=13', title: 'Community Iftar' },
  ];

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <ImageIcon className="text-emerald-600" size={40} />
          {t('gallery')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Capturing the moments of brotherhood, service, and dedication in our community.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {galleryItems.map((item) => (
          <div 
            key={item._id || item.id} 
            className="group relative bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-slate-700 cursor-pointer"
            onClick={() => setSelectedImage(item.imageUrl)}
          >
            {/* Image Container with Zoom Effect */}
            <div className="aspect-[4/5] overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
            </div>

            {/* Overlay for Zoom Button (Appears on Hover) */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
               <button className="bg-white/20 backdrop-blur-md border border-white/50 text-white p-3 rounded-full transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-emerald-600 hover:border-emerald-600 shadow-xl">
                 <ZoomIn size={24} />
               </button>
            </div>

            {/* Permanent Title at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-12">
               <p className="text-white font-medium text-lg leading-tight drop-shadow-md border-l-4 border-emerald-500 pl-3">
                 {item.title}
               </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-emerald-600 p-2 rounded-full transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          
          <img 
            src={selectedImage} 
            alt="Full view" 
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain animate-scale-up"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
          />
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
