import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  LogOut, 
  User, 
  Rocket 
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const role = localStorage.getItem('adminAccessLevel');
  const userEmail = localStorage.getItem('userEmail');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('adminAccessLevel');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-[14px]
    ${isActive 
      ? 'bg-emerald-50 text-[#2e7d32] shadow-sm' 
      : 'text-slate-400 hover:text-slate-600 hover:bg-emerald-50/30'
    }
  `;

  return (
    <div className="flex min-h-screen bg-[#f4f7f4] font-['Sora',sans-serif]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-emerald-100/50 flex flex-col p-6 sticky top-0 h-screen shrink-0 shadow-sm shadow-emerald-900/5">
        <div className="flex items-center gap-3 mb-10 px-2">
           <div className="w-10 h-10 rounded-xl bg-[#2e7d32] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={24} strokeWidth={2.5} />
           </div>
           <span className="text-[18px] font-black tracking-tighter text-[#1c2b1e]">
              Admin<span className="text-[#2e7d32]">Zone</span>
           </span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <NavLink to="/admin" className={navItemClass} end>
            <LayoutDashboard size={18} strokeWidth={2.5} />
            Dashboard
          </NavLink>
          {role === 'super_admin' && (
            <NavLink to="/superadmin" className={navItemClass}>
              <Users size={18} strokeWidth={2.5} />
              SuperAdmin
            </NavLink>
          )}
          
          <div className="h-px bg-emerald-50 my-4"></div>
          
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-[#2e7d32] font-bold text-[14px] transition-all no-underline">
             <Rocket size={18} strokeWidth={2.5} />
             Vista Pública
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-emerald-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-[#c62828] hover:bg-red-50 font-bold text-[14px] transition-all border-none bg-transparent cursor-pointer"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-emerald-50 px-8 flex items-center justify-between sticky top-0 z-40">
           <div className="text-[12px] font-black text-slate-300 uppercase tracking-widest">
              SISTEMA CENTRAL DE AUDITORÍA
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                 <span className="text-[13px] font-black text-[#1c2b1e] leading-none">{userEmail}</span>
                 <span className="text-[10px] font-bold text-[#2e7d32] uppercase tracking-tighter mt-1">
                    {role === 'super_admin' ? 'Super Administrador' : 'Administrador'}
                 </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1c2b1e] to-[#2e7d32] flex items-center justify-center text-white shadow-inner">
                 <User size={20} strokeWidth={2.5} />
              </div>
           </div>
        </header>

        <main className="p-8 md:p-10 animate-in fade-in duration-500">
           {children}
        </main>
      </div>
    </div>
  );
}
