
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { EventType, EventStatus, User } from '../../types';
import api from '../../api/axiosInstance';
import { generateEventDescription } from '../../services/geminiService';
import { Sparkles, Save, ArrowLeft, Loader2, Users, Image as ImageIcon, Upload, X, ChevronDown, Check, Search } from 'lucide-react';

interface EventFormData {
  title: string;
  type: EventType;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  estimatedBudget: number;
  isPublic: boolean;
  managerIds: string[];
  bannerUrl: string;
}

const AdminEventForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    type: EventType.MAHFIL,
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    status: EventStatus.UPCOMING,
    estimatedBudget: 0,
    isPublic: true,
    managerIds: [],
    bannerUrl: ''
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  
  // Manager Dropdown State
  const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsManagerDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch Users for Manager Selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users');
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  // Fetch Event Details for Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          const all = await api.get('/events?status=');
          const found = all.data.find((e: any) => e._id === id || e.id === id);
          
          if (found) {
            let existingManagerIds: string[] = [];
            if (found.managerIds && Array.isArray(found.managerIds)) {
               existingManagerIds = found.managerIds.map((m: any) => 
                 typeof m === 'object' ? (m._id || m.id) : m
               );
            }

             setFormData({
               title: found.title,
               type: found.type,
               description: found.description || '',
               location: found.location || '',
               startDate: found.startDate ? new Date(found.startDate).toISOString().split('T')[0] : '',
               endDate: found.endDate ? new Date(found.endDate).toISOString().split('T')[0] : '',
               status: found.status || EventStatus.UPCOMING,
               estimatedBudget: found.estimatedBudget || 0,
               isPublic: found.isPublic,
               managerIds: existingManagerIds,
               bannerUrl: found.bannerUrl || ''
             });
          }
        } catch (err) {
          console.error(err);
          setError('Failed to fetch event details');
        }
      };
      fetchEvent();
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = value === '' ? 0 : parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const form = new FormData();
      form.append('image', file);
      setUploading(true);
      try {
        const { data } = await api.post('/upload', form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // Append backend URL if returned relative path
        const fullUrl = data.imageUrl.startsWith('http') 
          ? data.imageUrl 
          : `http://127.0.0.1:5000${data.imageUrl}`;
          
        setFormData(prev => ({ ...prev, bannerUrl: fullUrl }));
      } catch (error) {
        console.error(error);
        setError('Image upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const toggleManager = (userId: string) => {
    setFormData(prev => {
      const currentIds = prev.managerIds;
      if (currentIds.includes(userId)) {
        return { ...prev, managerIds: currentIds.filter(id => id !== userId) };
      } else {
        return { ...prev, managerIds: [...currentIds, userId] };
      }
    });
  };

  const handleGenerateAI = async () => {
    if (!formData.title) return alert("Please enter a title first");
    setGenerating(true);
    const desc = await generateEventDescription(formData.title, formData.type);
    setFormData(prev => ({ ...prev, description: desc }));
    setGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.title || !formData.title.trim()) {
      setError('Please enter an event title');
      setLoading(false);
      return;
    }

    try {
      // Clean and prepare data for submission
      const submitData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        location: formData.location?.trim() || '',
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        estimatedBudget: formData.estimatedBudget || 0,
        managerIds: Array.isArray(formData.managerIds) ? formData.managerIds.filter(id => id) : [],
        bannerUrl: formData.bannerUrl || ''
      };
      
      console.log('Submitting event form:', submitData);
      
      let response;
      if (isEditMode) {
        response = await api.put(`/events/${id}`, submitData);
      } else {
        response = await api.post('/events', submitData);
      }
      
      console.log('Event saved successfully:', response.data);
      navigate('/admin/events');
    } catch (err: any) {
      console.error('Event save error:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      let errorMessage = 'Failed to save event';
      
      if (err.response) {
        // Server responded with error
        const responseData = err.response.data;
        errorMessage = responseData?.message || 
                      responseData?.error || 
                      err.message ||
                      `Failed to save event: ${err.response.statusText || err.response.status}`;
        
        // Handle specific error cases
        if (err.response.status === 403) {
          errorMessage = 'You do not have permission to create events. Admin access required.';
        } else if (err.response.status === 401) {
          errorMessage = 'Please log in to create events.';
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check if the server is running.';
      } else {
        errorMessage = err.message || 'Failed to save event';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter users for dropdown
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(managerSearchTerm.toLowerCase()) || 
    (u.phone && u.phone.includes(managerSearchTerm)) ||
    u.email.toLowerCase().includes(managerSearchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/events" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
        
        {/* Basic Information */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Event Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Event Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Annual Mahfil"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Event Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value={EventType.MAHFIL}>Mahfil</option>
                <option value={EventType.TAFSEER}>Tafseer</option>
                <option value={EventType.MEETING}>Quran Class/Meeting</option>
                <option value={EventType.CHARITY}>Charity</option>
                <option value={EventType.OTHER}>Other</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                 <ImageIcon size={16} /> Banner Image
              </label>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      name="bannerUrl"
                      value={formData.bannerUrl}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Enter image URL"
                    />
                  </div>
                  <label className={`cursor-pointer bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-2.5 rounded-lg hover:bg-emerald-100 transition flex items-center justify-center gap-2 ${uploading ? 'opacity-70 cursor-wait' : ''}`}>
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    <span className="font-medium text-sm whitespace-nowrap">{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={uploadFileHandler}
                      accept="image/*"
                      disabled={uploading}
                    />
                  </label>
                </div>

                {formData.bannerUrl && (
                  <div className="relative h-64 w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                    <img 
                       src={formData.bannerUrl} 
                       alt="Banner Preview" 
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                       onError={(e) => {
                         (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Invalid+Image';
                       }}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, bannerUrl: ''})}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-red-500 hover:bg-white transition z-10"
                      title="Remove Image"
                    >
                      <X size={18} />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">
                      Banner Preview
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Date & Location */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Village Eidgah"
              />
            </div>
          </div>
        </section>

        {/* Description */}
        <section>
           <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={generating || !formData.title}
              className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-purple-200 transition disabled:opacity-50"
            >
              {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {generating ? 'Generating...' : 'Auto-Generate with AI'}
            </button>
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Detailed description of the event..."
          ></textarea>
        </section>

        {/* Management & Settings */}
        <section>
           <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Management & Settings</h2>
           
           <div className="mb-6" ref={dropdownRef}>
             <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
               <Users size={16} /> Assign Event Managers
             </label>
             
             {/* Multi-Select Dropdown Trigger */}
             <div 
               className="border border-gray-300 rounded-lg p-2 min-h-[46px] flex flex-wrap gap-2 cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500 bg-white relative"
               onClick={() => setIsManagerDropdownOpen(!isManagerDropdownOpen)}
             >
               {formData.managerIds.length === 0 && (
                 <span className="text-gray-400 py-1 px-1">Select managers...</span>
               )}
               
               {/* Selected Chips */}
               {formData.managerIds.map(id => {
                  const user = users.find(u => (u._id || u.id) === id);
                  return user ? (
                    <span key={id} className="bg-emerald-100 text-emerald-800 text-sm px-2 py-1 rounded-md flex items-center gap-1 animate-scale-up">
                       {user.name}
                       <span className="cursor-pointer hover:bg-emerald-200 rounded-full p-0.5" onClick={(e) => { e.stopPropagation(); toggleManager(id); }}>
                         <X size={12} />
                       </span>
                    </span>
                  ) : null;
               })}
               
               <div className="ml-auto text-gray-400 py-1 px-1">
                 <ChevronDown size={18} className={`transition-transform duration-200 ${isManagerDropdownOpen ? 'rotate-180' : ''}`} />
               </div>

               {/* Dropdown Menu */}
               {isManagerDropdownOpen && (
                 <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-72 overflow-hidden flex flex-col animate-fade-in-down">
                    <div className="p-2 border-b border-gray-100 relative">
                       <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                       <input 
                         type="text" 
                         className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                         placeholder="Search by name or phone..."
                         value={managerSearchTerm}
                         onChange={(e) => setManagerSearchTerm(e.target.value)}
                         onClick={(e) => e.stopPropagation()}
                         autoFocus
                       />
                    </div>
                    
                    <div className="overflow-y-auto p-1 custom-scrollbar">
                       {filteredUsers.length > 0 ? (
                         filteredUsers.map(user => {
                           const isSelected = formData.managerIds.includes(user._id || user.id || '');
                           return (
                             <div 
                                key={user._id || user.id} 
                                className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-gray-50 text-gray-800'}`}
                                onClick={(e) => { e.stopPropagation(); toggleManager(user._id || user.id || ''); }}
                             >
                                <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                                      {user.name.charAt(0)}
                                   </div>
                                   <div>
                                     <div className="font-medium text-sm">{user.name}</div>
                                     <div className={`text-xs ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>{user.phone || user.email}</div>
                                   </div>
                                </div>
                                {isSelected && <Check size={18} className="text-emerald-600" />}
                             </div>
                           );
                         })
                       ) : (
                         <div className="p-4 text-center text-sm text-gray-500">
                           No users found matching "{managerSearchTerm}"
                         </div>
                       )}
                    </div>
                 </div>
               )}
             </div>
             <p className="text-xs text-gray-500 mt-1">Managers will be listed on the event details page.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Est. Budget (BDT)</label>
              <input
                type="number"
                name="estimatedBudget"
                value={formData.estimatedBudget}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value={EventStatus.UPCOMING}>Upcoming</option>
                <option value={EventStatus.ONGOING}>Ongoing</option>
                <option value={EventStatus.COMPLETED}>Completed</option>
                <option value={EventStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>
             <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({...prev, isPublic: e.target.checked}))}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">Visible to Public</label>
            </div>
          </div>
        </section>

        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
          <button
             type="button"
             onClick={() => navigate('/admin/events')}
             className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isEditMode ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEventForm;
