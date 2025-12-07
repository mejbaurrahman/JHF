
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Image as ImageIcon, Upload, Loader2, X } from 'lucide-react';
import api from '../../api/axiosInstance';
import { GalleryItem } from '../../types';
import LoadingScreen from '../../components/common/LoadingScreen';

const AdminGallery: React.FC = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newTitle, setNewTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchGallery();
    // Cleanup preview URL on unmount to avoid memory leaks
    return () => {
        if (previewUrl && !previewUrl.startsWith('http')) {
            URL.revokeObjectURL(previewUrl);
        }
    }
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await api.get('/content/gallery');
      setImages(res.data);
    } catch (err) {
      console.error("Failed to fetch gallery");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl && !previewUrl.startsWith('http')) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const clearSelection = () => {
    if (previewUrl && !previewUrl.startsWith('http')) {
        URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    setNewTitle('');
  };

  const addImage = async () => {
    if (!selectedFile) {
        alert("Please select an image file.");
        return;
    }
    if (!newTitle) {
        alert("Please enter a caption for the image.");
        return;
    }

    setUploading(true);
    let finalUrl = '';

    // 1. Upload Image
    try {
      const form = new FormData();
      form.append('image', selectedFile);
      
      const { data } = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Construct absolute URL if backend returns relative path
      finalUrl = data.imageUrl.startsWith('http') 
        ? data.imageUrl 
        : `http://127.0.0.1:5000${data.imageUrl}`;
    } catch (error) {
      console.error(error);
      alert('Image upload failed. Please ensure the backend server is running and configured for uploads.');
      setUploading(false);
      return;
    }

    // 2. Save Gallery Item
    try {
      await api.post('/content/gallery', {
        title: newTitle,
        imageUrl: finalUrl
      });
      fetchGallery();
      clearSelection();
    } catch (err) {
      alert('Failed to save image to gallery database.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (id: string) => {
    if(!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await api.delete(`/content/gallery/${id}`);
      setImages(images.filter(img => (img._id || img.id) !== id));
    } catch (err) {
      alert("Failed to delete image.");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Gallery</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ImageIcon size={20} className="text-emerald-600" /> Add New Photo
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* File Upload Area */}
          <div className="w-full md:w-1/3">
             <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${previewUrl ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                {previewUrl ? (
                  <div className="relative w-full h-full p-2 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                    <button 
                      onClick={(e) => { e.preventDefault(); clearSelection(); }}
                      className="absolute top-3 right-3 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                    <Upload size={32} className="mb-2 text-gray-400" />
                    <p className="text-sm font-semibold">Click to upload image</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG up to 5MB</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
             </label>
          </div>

          {/* Form Fields */}
          <div className="w-full md:w-2/3 space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Caption / Title</label>
               <input 
                 type="text" 
                 placeholder="e.g. Annual Sports Day 2024" 
                 value={newTitle}
                 onChange={e => setNewTitle(e.target.value)}
                 className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
               />
             </div>
             
             <div className="pt-2">
               <button 
                 onClick={addImage}
                 disabled={!selectedFile || !newTitle || uploading}
                 className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                 {uploading ? 'Uploading...' : 'Add to Gallery'}
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map(img => (
          <div key={img._id || img.id} className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="aspect-[4/3] bg-gray-100 relative">
              <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button 
                   onClick={() => removeImage(img._id || img.id || '')}
                   className="bg-red-600 text-white p-2 rounded-full transform scale-75 group-hover:scale-100 transition-transform shadow-lg"
                   title="Delete Image"
                 >
                   <Trash2 size={20} />
                 </button>
              </div>
            </div>
            <div className="p-3">
              <p className="font-medium text-gray-800 text-sm truncate" title={img.title}>{img.title}</p>
            </div>
          </div>
        ))}
        {images.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                <ImageIcon size={48} className="mb-4 opacity-50" />
                <p>Gallery is empty. Upload your first photo above.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminGallery;
