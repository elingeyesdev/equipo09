import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, LogOut, MessageCircle, Menu, X } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useEffect, useState } from 'react';
import { getMyConversations } from '../api/chat.api';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    getMyConversations()
      .then((convs) => {
        const total = convs.reduce((acc, c) => acc + c.unreadCount, 0);
        setUnreadCount(total);
      })
      .catch(() => { });
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('adminAccessLevel');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `text-[14px] font-medium px-3 py-1.5 rounded-md transition-colors duration-150 ${
      isActive(path)
        ? 'text-[#02A95C] font-semibold'
        : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <>
      <nav
        className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center no-underline group"
            style={{ textDecoration: 'none' }}
          >
            <img
              src="/logocrowd.jpg"
              alt="Unifundme"
              className="h-10 sm:h-14 w-auto object-contain"
            />
          </Link>

          {/* Nav links (Desktop) */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/explore" className={navLinkClass('/explore')} style={{ textDecoration: 'none' }}>
              Explorar
            </Link>
            <Link
              to="/donatok"
              className={`text-[14px] font-medium px-3 py-1.5 rounded-md transition-colors duration-150 ${
                isActive('/donatok') ? 'text-[#02A95C] font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ textDecoration: 'none' }}
            >
              DonaTok
            </Link>
            {userRole === 'entrepreneur' ? (
              <>
                <Link to="/entrepreneur-campaigns" className={navLinkClass('/entrepreneur-campaigns')} style={{ textDecoration: 'none' }}>
                  Mis Campañas
                </Link>
                <Link to="/entrepreneur-profile" className={navLinkClass('/entrepreneur-profile')} style={{ textDecoration: 'none' }}>
                  Mi Perfil
                </Link>
                <Link to="/chat" className={`${navLinkClass('/chat')} relative`} style={{ textDecoration: 'none' }}>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle size={15} strokeWidth={2} />
                    Mensajes
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-[#02A95C] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={navLinkClass('/dashboard')} style={{ textDecoration: 'none' }}>
                  Mi Panel
                </Link>
                <Link to="/profile" className={navLinkClass('/profile')} style={{ textDecoration: 'none' }}>
                  Mi Perfil
                </Link>
                <Link to="/chat" className={`${navLinkClass('/chat')} relative`} style={{ textDecoration: 'none' }}>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle size={15} strokeWidth={2} />
                    Mensajes
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-[#02A95C] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right side (Desktop + Mobile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Email (Desktop) */}
          {userEmail && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
              <div className="w-6 h-6 rounded-full bg-[#02A95C]/10 flex items-center justify-center">
                <User size={13} className="text-[#02A95C]" strokeWidth={2} />
              </div>
              <span className="text-[13px] font-medium text-gray-700 truncate max-w-[140px]">
                {userEmail}
              </span>
            </div>
          )}

          {userEmail && <NotificationBell />}

          {/* Logout (Desktop) */}
          <button
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-[13px] font-medium cursor-pointer transition-colors"
            onClick={handleLogout}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <LogOut size={15} strokeWidth={2} />
            Salir
          </button>

          {/* Hamburger Menu Button (Mobile) */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Links Dropdown */}
      {isMenuOpen && (
        <div
          className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex flex-col gap-2.5 z-40 sticky top-[69px]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <Link
            to="/explore"
            className={`text-[15px] font-medium p-2.5 rounded-lg transition-colors ${isActive('/explore') ? 'bg-[#E6F9F0] text-[#02A95C] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setIsMenuOpen(false)}
            style={{ textDecoration: 'none' }}
          >
            Explorar
          </Link>
          <Link
            to="/donatok"
            className={`text-[15px] font-medium p-2.5 rounded-lg transition-colors ${isActive('/donatok') ? 'bg-[#E6F9F0] text-[#02A95C] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setIsMenuOpen(false)}
            style={{ textDecoration: 'none' }}
          >
            DonaTok
          </Link>

          {userRole === 'entrepreneur' ? (
            <>
              <Link
                to="/entrepreneur-campaigns"
                className={`text-[15px] font-medium p-2.5 rounded-lg transition-colors ${isActive('/entrepreneur-campaigns') ? 'bg-[#E6F9F0] text-[#02A95C] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
                style={{ textDecoration: 'none' }}
              >
                Mis Campañas
              </Link>
              <Link
                to="/entrepreneur-profile"
                className={`text-[15px] font-medium p-2.5 rounded-lg transition-colors ${isActive('/entrepreneur-profile') ? 'bg-[#E6F9F0] text-[#02A95C] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
                style={{ textDecoration: 'none' }}
              >
                Mi Perfil
              </Link>
              <Link
                to="/chat"
                className={`text-[15px] font-medium p-2.5 rounded-lg transition-colors flex items-center justify-between ${isActive('/chat') ? 'bg-[#E6F9F0] text-[#02A95C] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
                style={{ textDecoration: 'none' }}
              >
                <span className="flex items-center gap-2">
                  <MessageCircle size={17} strokeWidth={2} />
                  Mensajes
                </span>
                {unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] bg-[#02A95C] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={`text-[15px] font-medium p-2.5 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-[#E6F9F0] text-[#02A95C] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
                style={{ textDecoration: 'none' }}
              >
                Mi Panel
              </Link>
              <Link
                to="/profile"
                className={`text-[15px] font-medium p-2.5 rounded-lg transition-colors ${isActive('/profile') ? 'bg-[#E6F9F0] text-[#02A95C] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
                style={{ textDecoration: 'none' }}
              >
                Mi Perfil
              </Link>
              <Link
                to="/chat"
                className={`text-[15px] font-medium p-2.5 rounded-lg transition-colors flex items-center justify-between ${isActive('/chat') ? 'bg-[#E6F9F0] text-[#02A95C] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
                style={{ textDecoration: 'none' }}
              >
                <span className="flex items-center gap-2">
                  <MessageCircle size={17} strokeWidth={2} />
                  Mensajes
                </span>
                {unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] bg-[#02A95C] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {userEmail && (
            <div className="border-t border-gray-100 pt-3 mt-1 flex flex-col gap-2">
              <div className="flex items-center gap-2 px-2.5 py-2">
                <User size={16} className="text-gray-400" />
                <span className="text-[13px] text-gray-500 truncate">{userEmail}</span>
              </div>
              <button
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 text-[14px] font-medium cursor-pointer"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
