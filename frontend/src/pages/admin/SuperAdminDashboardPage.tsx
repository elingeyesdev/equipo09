import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getAllAdmins, createAdmin, deleteAdmin } from '../../api/admin.api';
import type { AdminUser } from '../../types/admin.types';
import { 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Lock 
} from 'lucide-react';

export function SuperAdminDashboardPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (e: any) {
      if (e.response?.status === 401) {
        setError('Acceso denegado. Se requieren permisos de Super Administrador.');
      } else {
        console.error('Error loading admin list:', e);
        setError('Error al cargar la lista de administradores.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`ESTAS A PUNTO DE ELIMINAR LOS PERMISOS DE: ${email}\n\n¿Deseas continuar? Pasará a ser un usuario común.`)) return;
    try {
      await deleteAdmin(id);
      await loadData();
    } catch(e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createAdmin(creds);
      setCreds({ email: '', password: '' });
      await loadData();
    } catch(err: any) {
        console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-full flex flex-col items-center justify-center gap-6 py-40">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2e7d32] rounded-full animate-spin" />
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Sincronizando Privilegios...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="h-full flex flex-col items-center justify-center gap-6 py-40">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800">{error}</h2>
            <p className="text-slate-400 font-medium">Esta sección es de acceso restringido.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="mt-4 px-6 py-2 bg-[#1c2b1e] text-white font-bold rounded-xl hover:bg-emerald-800 transition-all cursor-pointer"
            >
              Ir al Login
            </button>
        </div>
      </AdminLayout>
    );
  }

  const inputClass = "w-full border-gray-200 border-[1.5px] rounded-xl px-4 py-3 text-[14px] outline-none transition-all bg-gray-50/50 focus:bg-white focus:border-[#2e7d32] focus:ring-4 focus:ring-emerald-500/10 placeholder:text-gray-400 font-medium";
  const labelClass = "text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block";

  return (
    <AdminLayout>
      <div className="mb-12 flex flex-col gap-2">
        <h1 className="text-3xl font-black text-[#1c2b1e] tracking-tight leading-none mb-1">Panel de SuperAdmin</h1>
        <p className="text-[15px] font-medium text-slate-400 italic">Crea, auditia y gestiona los privilegios de los administradores de la plataforma.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Form Container */}
        <div className="lg:col-span-1 bg-white border border-emerald-50 rounded-[32px] p-8 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
           
           <h2 className="text-[18px] font-black text-[#1c2b1e] tracking-tight mb-8 flex items-center gap-3 relative z-10">
              <UserPlus className="text-[#2e7d32]" size={22} strokeWidth={2.5} />
              Acceso Institucional
           </h2>
           
           <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
            <div className="flex flex-col">
              <label className={labelClass}>Correo Institucional</label>
              <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={18} strokeWidth={2.5} />
                 </div>
                 <input
                   type="email"
                   required
                   value={creds.email}
                   onChange={e => setCreds(p => ({...p, email: e.target.value}))}
                   className={`${inputClass} pl-12`}
                   placeholder="admin@equipo09.com"
                 />
              </div>
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Contraseña Temporal</label>
              <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} strokeWidth={2.5} />
                 </div>
                 <input
                   type="password"
                   required
                   minLength={8}
                   value={creds.password}
                   onChange={p => setCreds(prev => ({...prev, password: p.target.value}))}
                   className={`${inputClass} pl-12`}
                   placeholder="••••••••"
                 />
              </div>
            </div>
            
            <button 
                type="submit" 
                className="w-full bg-[#1c2b1e] hover:bg-[#2e7d32] text-white font-black py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-900/10 border-none cursor-pointer flex items-center justify-center gap-3 mt-4"
                disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Elevando Privilegios...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} strokeWidth={2.5} />
                  Crear Administrador
                </>
              )}
            </button>
          </form>
        </div>

        {/* List Container */}
        <div className="lg:col-span-2 bg-white border border-emerald-50 rounded-[32px] overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-emerald-50">
            <h2 className="text-[16px] font-black text-[#1c2b1e] tracking-tight uppercase tracking-widest leading-none">Administradores Activos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Nivel</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {admins.map(a => (
                  <tr key={a.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-8 py-5 text-[14px] font-black text-[#1c2b1e] group-hover:text-[#2e7d32] transition-colors">{a.email}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                         ${a.access_level === 'super_admin' ? 'bg-amber-50 text-[#f9a825] border-amber-200' : 'bg-emerald-50 text-[#2e7d32] border-emerald-100'}
                       `}>
                         {a.access_level.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                          ${a.is_active ? 'bg-emerald-50 text-[#00897b] border-emerald-100' : 'bg-red-50 text-[#c62828] border-red-100'}
                       `}>
                          {a.is_active ? 'activo' : 'inactivo'}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end">
                        {a.access_level !== 'super_admin' && (
                           <button 
                             className="bg-white hover:bg-red-50 text-slate-400 hover:text-[#c62828] font-bold border border-gray-100 hover:border-red-100 rounded-xl px-4 py-2 text-[12px] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                             onClick={() => handleDelete(a.id, a.email)}
                           >
                             <ShieldAlert size={14} strokeWidth={2.5} />
                             Revocar
                           </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
