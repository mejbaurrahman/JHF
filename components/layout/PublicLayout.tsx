import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  Moon,
  Sun,
  Globe,
  Home,
  Info,
  Activity,
  Image as ImageIcon,
  Calendar,
  Users,
  Briefcase,
  UserCheck,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { UserRole } from "../../types";

const PublicLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVolunteersOpen, setIsVolunteersOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNavigatingToDashboard, setIsNavigatingToDashboard] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return "/dashboard";
    const userRole =
      typeof user.role === "string"
        ? user.role.toLowerCase() === "admin"
          ? UserRole.ADMIN
          : UserRole.USER
        : user.role;
    return userRole === UserRole.ADMIN ? "/admin" : "/dashboard";
  };

  useEffect(() => {
    // Check system preference or local storage
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setIsDarkMode(true);
    }
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-emerald-600 font-semibold dark:text-emerald-400 border-b-2 border-emerald-600 pb-1 flex items-center gap-1.5"
      : "text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-300 ${
        language === "BN" ? "font-bengali" : ""
      }`}
    >
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-900 sticky top-0 z-50 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer gap-3"
              onClick={() => navigate("/")}
            >
              <img
                src="/logo.png"
                alt="JHF Logo"
                className="h-12 w-12 rounded-full shadow-sm object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/100x100/10b981/ffffff?text=JHF";
                }}
              />
              <div className="flex flex-col justify-center">
                <span className="font-bold text-lg leading-tight text-gray-800 dark:text-white hidden sm:block">
                  JHF Youth Association
                </span>
                <span className="font-bold text-xl text-gray-800 dark:text-white sm:hidden">
                  JHF
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link to="/" className={isActive("/")}>
                <Home size={18} /> {t("home")}
              </Link>
              <Link to="/about" className={isActive("/about")}>
                <Info size={18} /> {t("about")}
              </Link>
              <Link to="/gallery" className={isActive("/gallery")}>
                <ImageIcon size={18} /> {t("gallery")}
              </Link>
              <Link to="/events" className={isActive("/events")}>
                <Calendar size={18} /> {t("events")}
              </Link>

              {/* Volunteers Dropdown */}
              <div className="relative group">
                <button
                  className={`flex items-center gap-1.5 ${
                    location.pathname.startsWith("/volunteers")
                      ? "text-emerald-600 font-semibold dark:text-emerald-400"
                      : "text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400"
                  }`}
                  onClick={() => setIsVolunteersOpen(!isVolunteersOpen)}
                >
                  <Users size={18} /> {t("volunteers")}{" "}
                  <ChevronDown size={14} className="mt-0.5" />
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-2 border border-gray-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                  <Link
                    to="/volunteers/executive"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600"
                  >
                    <Briefcase size={16} /> {t("executiveCommittee")}
                  </Link>
                  <Link
                    to="/volunteers/members"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600"
                  >
                    <UserCheck size={16} /> {t("members")}
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-gray-100 dark:border-slate-700 w-16 justify-center"
              >
                <Globe size={14} /> {language}
              </button>

              {user ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setIsNavigatingToDashboard(true);
                      const path = getDashboardPath();
                      navigate(path);
                      // Reset loading state after navigation
                      setTimeout(() => setIsNavigatingToDashboard(false), 500);
                    }}
                    disabled={isNavigatingToDashboard}
                    className="text-gray-600 hover:text-emerald-600 font-medium dark:text-gray-300 flex items-center gap-2 cursor-pointer bg-transparent border-none transition-colors disabled:opacity-50"
                  >
                    {isNavigatingToDashboard ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {t("dashboard")}
                      </>
                    ) : (
                      t("dashboard")
                    )}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    {t("logout")}
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-emerald-600 font-medium dark:text-gray-300 dark:hover:text-white"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    {t("joinUs")}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              {/* Mobile Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="mr-3 text-gray-500 dark:text-gray-400"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Mobile Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="mr-4 flex items-center gap-1 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold border border-gray-200 dark:border-slate-700"
              >
                {language}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 animate-fade-in-down h-screen overflow-y-auto pb-20">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600"
              >
                <Home size={20} /> {t("home")}
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600"
              >
                <Info size={20} /> {t("about")}
              </Link>
              <Link
                to="/gallery"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600"
              >
                <ImageIcon size={20} /> {t("gallery")}
              </Link>
              <Link
                to="/events"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600"
              >
                <Calendar size={20} /> {t("events")}
              </Link>

              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Users size={14} /> {t("volunteers")}
                </p>
                <div className="pl-4 space-y-2 border-l-2 border-gray-100 dark:border-slate-700 ml-1">
                  <Link
                    to="/volunteers/executive"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600"
                  >
                    <Briefcase size={18} /> {t("executiveCommittee")}
                  </Link>
                  <Link
                    to="/volunteers/members"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600"
                  >
                    <UserCheck size={18} /> {t("members")}
                  </Link>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-700 my-4"></div>

              {user ? (
                <>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsNavigatingToDashboard(true);
                      const path = getDashboardPath();
                      navigate(path);
                      // Reset loading state after navigation
                      setTimeout(() => setIsNavigatingToDashboard(false), 500);
                    }}
                    disabled={isNavigatingToDashboard}
                    className="w-full flex items-center gap-3 text-left px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 disabled:opacity-50"
                  >
                    {isNavigatingToDashboard ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {t("dashboard")}
                      </>
                    ) : (
                      t("dashboard")
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 text-left px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-slate-800"
                  >
                    {t("logout")}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 px-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-center py-3 rounded-lg text-base font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-center py-3 rounded-lg text-base font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                  >
                    {t("joinUs")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4 gap-3">
              <img
                src="/logo.png"
                alt="JHF Logo"
                className="h-10 w-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/100x100/10b981/ffffff?text=JHF";
                }}
              />
              <span className="font-bold text-lg">JHF Youth Association</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {t("footerDesc")}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">{t("quickLinks")}</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link to="/about" className="hover:text-emerald-400">
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-emerald-400">
                  {t("viewEvents")}
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-emerald-400">
                  {t("makeDonation")}
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400">
                  {t("becomeMember")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">{t("contact")}</h3>
            <p className="text-gray-400 text-sm mb-2">
              Jesobantapur, Village Post Office
            </p>
            <p className="text-gray-400 text-sm mb-2">
              Email: contact@hilfulfuzul.org
            </p>
            <p className="text-gray-400 text-sm">Phone: +880 1700-000000</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Jesobantapur Hilful Fuzul Youth
          Association. {t("rightsReserved")}
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
