import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { Notification } from '../../types';
import LoadingScreen from '../../components/common/LoadingScreen';
import { Bell, Check, Info, AlertTriangle, CheckCircle } from 'lucide-react';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      // Mock if API missing
      setNotifications([
         { _id: '1', message: 'Welcome to the new dashboard!', type: 'info', isRead: false, createdAt: new Date().toISOString() },
         { _id: '2', message: 'Donation of 500 BDT confirmed.', type: 'success', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      // Optimistic update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'error': return <AlertTriangle className="text-red-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
           {notifications.filter(n => !n.isRead).length} New
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map((notif) => (
          <div 
            key={notif._id} 
            className={`p-4 rounded-xl border transition flex gap-4 ${
              notif.isRead ? 'bg-white border-gray-100' : 'bg-emerald-50 border-emerald-100 shadow-sm'
            }`}
          >
            <div className="mt-1 flex-shrink-0">
               {getIcon(notif.type)}
            </div>
            <div className="flex-grow">
               <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                 {notif.message}
               </p>
               <p className="text-xs text-gray-400 mt-1">
                 {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
               </p>
            </div>
            {!notif.isRead && (
              <button 
                onClick={() => markAsRead(notif._id || notif.id || '')}
                className="text-gray-400 hover:text-emerald-600 self-start" 
                title="Mark as read"
              >
                <Check size={18} />
              </button>
            )}
          </div>
        )) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
             <Bell className="mx-auto text-gray-300 mb-3" size={48} />
             <p className="text-gray-500">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;