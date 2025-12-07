
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { User, Mail, Phone, MapPin, Briefcase, Camera, Save, Loader2 } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    occupation: '',
    bio: '',
    profileImage: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        occupation: user.occupation || '',
        bio: user.bio || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', formData);
      await checkAuth(); // Refresh context
      alert('Profile updated successfully');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       const form = new FormData();
       form.append('image', file);
       setUploading(true);
       try {
         const { data } = await api.post('/upload', form, {
             headers: { 'Content-Type': 'multipart/form-data' }
         });
         const fullUrl = data.imageUrl.startsWith('http') ? data.imageUrl : `http://127.0.0.1:5000${data.imageUrl}`;
         setFormData(prev => ({ ...prev, profileImage: fullUrl }));
       } catch (error) {
         console.error(error);
         alert('Upload failed');
       } finally {
         setUploading(false);
       }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>

      <form onSubmit={handleUpdate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-8">
           <div className="relative w-28 h-28 mb-4 group">
             <div className="w-full h-full rounded-full overflow-hidden border-4 border-emerald-50">
               {formData.profileImage ? (
                 <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-3xl">
                   {formData.name.charAt(0)}
                 </div>
               )}
             </div>
             <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition border border-gray-200">
               <Camera size={18} className="text-gray-600" />
               <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
             </label>
             {uploading && <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center text-white text-xs">Uploading...</div>}
           </div>
           <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
           <p className="text-gray-500">{user?.role}</p>
        </div>

        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
               <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                   type="text" 
                   value={formData.name} 
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                 />
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
               <div className="relative">
                 <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                   type="text" 
                   value={formData.occupation} 
                   onChange={e => setFormData({...formData, occupation: e.target.value})}
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                 />
               </div>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                   type="email" 
                   value={formData.email} 
                   onChange={e => setFormData({...formData, email: e.target.value})}
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                 />
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
               <div className="relative">
                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                   type="text" 
                   value={formData.phone} 
                   onChange={e => setFormData({...formData, phone: e.target.value})}
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                 />
               </div>
             </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="relative">
                 <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                 <textarea 
                   rows={2}
                   value={formData.address}
                   onChange={e => setFormData({...formData, address: e.target.value})}
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                 ></textarea>
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea 
                 rows={3}
                 value={formData.bio}
                 onChange={e => setFormData({...formData, bio: e.target.value})}
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                 placeholder="Tell us about yourself..."
              ></textarea>
           </div>
        </div>

        <div className="mt-8 flex justify-end">
           <button 
             type="submit" 
             disabled={loading}
             className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
           >
             {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
             Save Changes
           </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
