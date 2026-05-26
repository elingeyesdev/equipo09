import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Rocket, User, LogOut, MessageCircle } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useEffect, useState } from 'react';
import { getMyConversations } from '../api/chat.api';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail');
  const [unreadCount, setUnreadCount] = useState(0);

  // Cargar count inicial de mensajes no leídos
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    getMyConversations()
      .then((convs) => {
        const total = convs.reduce((acc, c) => acc + c.unreadCount, 0);
        setUnreadCount(total);
      })
      .catch(() => { });
  }, [location.pathname]); // Refrescar al cambiar de página

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('adminAccessLevel');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) => `
    text-[14px] font-bold px-3 py-2 rounded-lg transition-all duration-200 relative
    ${isActive(path)
      ? 'text-[#2e7d32] bg-emerald-50'
      : 'text-slate-500 hover:text-slate-900 hover:bg-emerald-50/50'
    }
  `;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100/50 px-6 py-4 flex items-center justify-between shadow-sm shadow-emerald-900/5 animate-in slide-in-from-top-4 duration-300 font-['Sora',sans-serif]">
      <div className="flex items-center gap-10">
        <Link to="/" className="text-[18px] font-black text-[#1c2b1e] tracking-tighter hover:scale-105 transition-transform flex items-center gap-2 no-underline group">
          <Rocket className="w-6 h-6 text-[#2e7d32] group-hover:animate-bounce" strokeWidth={2.5} />
          CROWD<span className="text-[#2e7d32]">FUNDING</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/explore"
            className={navLinkClass('/explore')}
          >
            Explorar
          </Link>
          <Link
            to="/donatok"
            className={`text-[14px] font-black px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${isActive('/donatok')
                ? 'text-white'
                : 'text-white hover:opacity-90'
              }`}
            style={{
              background: isActive('/donatok')
                ? 'linear-gradient(135deg, #1c2b1e, #2e7d32)'
                : 'linear-gradient(135deg, #2e7d32, #00897b)',
              boxShadow: '0 2px 8px rgba(46,125,50,0.35)',
            }}
          >
            <span style={{ fontSize: '13px' }}></span>
            DonaTok
          </Link>
          {userRole === 'entrepreneur' ? (
            <>
              <Link
                to="/entrepreneur-campaigns"
                className={navLinkClass('/entrepreneur-campaigns')}
              >
                Mis Campañas
              </Link>
              <Link
                to="/entrepreneur-profile"
                className={navLinkClass('/entrepreneur-profile')}
              >
                Perfil Emprendedor
              </Link>
              <Link to="/chat" className={`${navLinkClass('/chat')} relative`}>
                <span className="flex items-center gap-1.5">
                  <MessageCircle size={15} strokeWidth={2.5} />
                  Mensajes
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={navLinkClass('/dashboard')}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className={navLinkClass('/profile')}
              >
                Configurar Perfil
              </Link>
              <Link to="/chat" className={`${navLinkClass('/chat')} relative`}>
                <span className="flex items-center gap-1.5">
                  <MessageCircle size={15} strokeWidth={2.5} />
                  Mensajes
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {userEmail && (
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50/80 px-4 py-2 rounded-full border border-emerald-100/50">
            <User size={14} className="text-[#2e7d32]" strokeWidth={3} />
            <span className="text-[12px] font-bold text-emerald-900 truncate max-w-[150px]">{userEmail}</span>
          </div>
        )}
        {userEmail && <NotificationBell />}
        <button
          className="bg-white hover:bg-red-50 text-slate-500 hover:text-red-700 border border-slate-200 hover:border-red-100 rounded-xl px-4 py-2 text-[13px] font-bold cursor-pointer transition-all active:scale-95 flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut size={16} strokeWidth={2.5} />
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
