import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  User, 
  Rocket,
  Menu,
  ChevronRight
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('adminAccessLevel');
  const userEmail = localStorage.getItem('userEmail');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('adminAccessLevel');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-3 px-4 py-3 text-[14px] font-medium transition-colors duration-150 rounded-md no-underline
    ${isActive 
      ? 'bg-[#3c4b64] text-white font-semibold' 
      : 'text-gray-300 hover:text-white hover:bg-[#3c4b64]/50'
    }
  `;

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    return ['admin', ...paths.slice(1)];
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-gray-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside 
        className={`bg-[#2f353a] flex flex-col transition-all duration-200 sticky top-0 h-screen shrink-0 z-50 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden md:w-16 md:px-2'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-[#23282c] bg-[#24282c] overflow-hidden">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-md object-cover" />
              <span className="text-white text-base font-bold tracking-tight whitespace-nowrap">
                Unifundme <span className="text-gray-400 font-normal text-xs">Admin</span>
              </span>
            </div>
          ) : (
            <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-md object-cover mx-auto" />
          )}
        </div>

        {/* Sidebar Nav */}
        <nav className="flex flex-col gap-1.5 p-3 flex-1 overflow-y-auto">
          {sidebarOpen && (
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mt-3 mb-1">
              Principal
            </div>
          )}
          <NavLink to="/admin" className={navItemClass} end style={{ textDecoration: 'none' }}>
            <LayoutDashboard size={18} />
            {sidebarOpen && <span>Estadísticas</span>}
          </NavLink>
          
          {sidebarOpen && (
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mt-3 mb-1">
              Contenido
            </div>
          )}
          <NavLink to="/admin/campaigns/review" className={navItemClass} style={{ textDecoration: 'none' }}>
             <Rocket size={18} />
             {sidebarOpen && <span>Revisión de Campañas</span>}
          </NavLink>

          {role === 'super_admin' && (
            <>
              {sidebarOpen && (
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mt-3 mb-1">
                  Sistema
                </div>
              )}
              <NavLink to="/superadmin" className={navItemClass} style={{ textDecoration: 'none' }}>
                <Users size={18} />
                {sidebarOpen && <span>Gestión de Admins</span>}
              </NavLink>
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#23282c] bg-[#24282c]">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-400 hover:text-white hover:bg-red-600/80 text-[14px] font-medium transition-colors border-none bg-transparent cursor-pointer ${
              !sidebarOpen && 'justify-center'
            }`}
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-[#d8dbe0] px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600 border-none bg-transparent cursor-pointer"
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-gray-600">
              <span className="text-gray-400">Dashboard</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-800 capitalize">{getBreadcrumbs().join(' / ')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
                <span className="text-[13px] font-semibold text-gray-800 leading-none">{userEmail}</span>
                <span className="text-[10px] font-medium text-gray-500 mt-1">
                   {role === 'super_admin' ? 'Super Administrador' : 'Administrador'}
                </span>
             </div>
             <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600">
                <User size={18} />
             </div>
          </div>
        </header>

        {/* Sub-header Breadcrumb line */}
        <div className="bg-white border-b border-[#d8dbe0] px-6 py-2.5 flex items-center gap-2 text-xs text-gray-500">
          <span>Home</span>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-800 font-medium capitalize">{getBreadcrumbs().join(' / ')}</span>
        </div>

        {/* Page content */}
        <main className="p-6 md:p-8 flex-1">
           {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-[#d8dbe0] px-6 py-3 text-xs text-gray-500 flex justify-between">
          <div>
            <span className="font-semibold text-gray-700">UniFundMe Admin</span> &copy; 2026.
          </div>
          <div>
            Desarrollado con <span className="text-gray-700 font-semibold">CoreUI Layout</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
