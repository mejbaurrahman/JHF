
import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Heart, 
  LogOut, 
  Home, 
  Users, 
  Image as ImageIcon, 
  FileText, 
  Briefcase, 
  TrendingDown, 
  DollarSign,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`) 
      ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-600' 
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  };

  const NavLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link 
      to={to} 
      onClick={() => setIsSidebarOpen(false)}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(to)}`}
    >
      <Icon size={20} className="mr-3" />
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2 font-bold text-gray-800">
           <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
             A
           </div>
           <span>Admin Panel</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 hidden md:flex items-center px-6 border-b border-gray-100">
           <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
             A
           </div>
           <span className="font-bold text-lg text-gray-800">Admin Panel</span>
        </div>

        <div className="px-6 py-4 md:hidden border-b border-gray-100">
           <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
           <p className="text-xs text-gray-500">Administrator</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)] custom-scrollbar">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2 px-4">Dashboard</div>
          <NavLink to="/admin" icon={LayoutDashboard} label="Overview" />

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-4">Operations</div>
          <NavLink to="/admin/events" icon={Calendar} label="Events" />
          <NavLink to="/admin/users" icon={Users} label="Manage Users" />

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-4">Finance</div>
          <NavLink to="/admin/donations" icon={Heart} label="Donations" />
          <NavLink to="/admin/fees" icon={DollarSign} label="Membership Fees" />
          <NavLink to="/admin/expenses" icon={TrendingDown} label="Expenses" />

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-4">Content & People</div>
          <NavLink to="/admin/cms" icon={FileText} label="Site Content" />
          <NavLink to="/admin/committee" icon={Briefcase} label="Committee" />
          <NavLink to="/admin/gallery" icon={ImageIcon} label="Gallery" />

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-4">System</div>
          <NavLink to="/admin/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100 bg-gray-50 md:bg-white">
          <Link to="/" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 mb-2">
            <Home size={20} className="mr-3" /> Public Site
          </Link>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
