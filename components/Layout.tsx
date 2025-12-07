import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Calendar, Heart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-emerald-600';

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
               <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
                 J
               </div>
               <span className="font-bold text-xl text-gray-800 hidden sm:block">Jesobantapur Hilful Fuzul</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`flex items-center gap-1 ${isActive('/')}`}>
                <Home size={18} /> Home
              </Link>
              <Link to="/events" className={`flex items-center gap-1 ${isActive('/events')}`}>
                <Calendar size={18} /> Events
              </Link>
              <Link to="/donate" className={`flex items-center gap-1 ${isActive('/donate')}`}>
                <Heart size={18} /> Donate
              </Link>
              
              {userRole ? (
                <>
                  <Link 
                    to={userRole === UserRole.ADMIN ? "/admin" : "/dashboard"} 
                    className={`flex items-center gap-1 ${isActive(userRole === UserRole.ADMIN ? "/admin" : "/dashboard")}`}
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 hover:text-red-700">
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
                  <User size={18} /> Login
                </Link>
              )}
            </div>

            <div className="flex items-center md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-gray-900">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">Home</Link>
              <Link to="/events" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">Events</Link>
              <Link to="/donate" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">Donate</Link>
              {userRole ? (
                 <>
                  <Link to={userRole === UserRole.ADMIN ? "/admin" : "/dashboard"} onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">Dashboard</Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                 </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 font-bold hover:bg-emerald-50">Login</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Jesobantapur Hilful Fuzul</h3>
            <p className="text-gray-400 text-sm">
              Empowering youth, serving the community, and spreading the light of faith.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/events" className="hover:text-emerald-400">Upcoming Events</Link></li>
              <li><Link to="/donate" className="hover:text-emerald-400">Make a Donation</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400">Member Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-gray-400 text-sm">Jesobantapur, Village Post Office</p>
            <p className="text-gray-400 text-sm">Email: contact@hilfulfuzul.org</p>
            <p className="text-gray-400 text-sm">Phone: +880 1700-000000</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Jesobantapur Hilful Fuzul Youth Association. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;