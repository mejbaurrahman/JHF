import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Heart,
  CreditCard,
  Calendar,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Track route changes for loading state
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300); // Show loading for at least 300ms for smooth transition

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    { path: "/dashboard/donations", label: "My Donations", icon: Heart },
    { path: "/dashboard/fees", label: "My Fees", icon: CreditCard },
    { path: "/dashboard/events", label: "My Events", icon: Calendar },
    { path: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { path: "/dashboard/profile", label: "Profile", icon: User },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2 font-bold text-gray-800">
          <img
            src="/logo.png"
            className="w-8 h-8 rounded-full"
            alt="Logo"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span>JHF Dashboard</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-600"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none border-r border-gray-200
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-emerald-600 hover:text-emerald-700"
          >
            <Home size={20} />{" "}
            <span className="hidden md:inline">JHF Home</span>
          </Link>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold overflow-hidden border border-emerald-200">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0) || "U"
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path, item.exact)
                    ? "bg-emerald-50 text-emerald-700 border-r-4 border-emerald-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
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

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen p-4 md:p-8 relative animate-fade-in">
        {/* Loading Overlay */}
        {isNavigating && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Loading...
              </p>
            </div>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
