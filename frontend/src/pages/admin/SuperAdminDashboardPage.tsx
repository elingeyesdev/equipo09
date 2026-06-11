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
        <div className="h-full flex flex-col items-center justify-center gap-4 py-40">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#02A95C] rounded-full animate-spin" />
            <span className="text-xs font-semibold text-gray-400">Sincronizando Privilegios...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="h-full flex flex-col items-center justify-center gap-4 py-40">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{error}</h2>
            <p className="text-gray-500 font-medium">Esta sección es de acceso restringido.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="mt-4 px-5 py-2.5 bg-gray-950 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all cursor-pointer border-none"
            >
              Ir al Login
            </button>
        </div>
      </AdminLayout>
    );
  }

  const inputClass = "w-full border-gray-200 border rounded-lg px-4 py-2.5 text-[14px] outline-none transition-all bg-gray-50/50 focus:bg-white focus:border-[#02A95C] focus:ring-3 focus:ring-[#02A95C]/10 placeholder:text-gray-400 font-medium";
  const labelClass = "text-xs font-semibold text-gray-500 mb-2 block";

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none mb-1">Panel de SuperAdmin</h1>
        <p className="text-[14px] font-medium text-gray-400">Crea, audita y gestiona los privilegios de los administradores de la plataforma.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative overflow-hidden border-t-4 border-t-[#02A95C]">
           <h2 className="text-[16px] font-bold text-gray-800 tracking-tight mb-6 flex items-center gap-2 relative z-10">
              <ShieldCheck className="text-[#02A95C]" size={20} />
              Acceso Institucional
           </h2>
           
           <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
            <div className="flex flex-col">
              <label className={labelClass}>Correo Institucional</label>
              <div className="relative group">
                 <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={16} />
                 </div>
                 <input
                   type="email"
                   required
                   value={creds.email}
                   onChange={e => setCreds(p => ({...p, email: e.target.value}))}
                   className={`${inputClass} pl-10`}
                   placeholder="admin@equipo09.com"
                 />
              </div>
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Contraseña Temporal</label>
              <div className="relative group">
                 <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={16} />
                 </div>
                 <input
                   type="password"
                   required
                   minLength={8}
                   value={creds.password}
                   onChange={p => setCreds(prev => ({...prev, password: p.target.value}))}
                   className={`${inputClass} pl-10`}
                   placeholder="••••••••"
                 />
              </div>
            </div>
            
            <button 
                type="submit" 
                className="w-full bg-[#02A95C] hover:bg-[#017A42] text-white font-semibold py-2.5 rounded-lg transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer flex items-center justify-center gap-2 mt-4"
                disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Elevando Privilegios...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Crear Administrador
                </>
              )}
            </button>
          </form>
        </div>

        {/* List Container */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-[14px] font-bold text-gray-800 uppercase tracking-wide leading-none">Administradores Activos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nivel</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-4 text-[14px] font-semibold text-gray-900 group-hover:text-[#02A95C] transition-colors">{a.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border
                         ${a.access_level === 'super_admin' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
                       `}>
                         {a.access_level.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border
                          ${a.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}
                       `}>
                          {a.is_active ? 'activo' : 'inactivo'}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        {a.access_level !== 'super_admin' && (
                           <button 
                             className="bg-white hover:bg-red-50 text-gray-500 hover:text-red-700 font-bold border border-gray-200 hover:border-red-200 rounded-lg px-3 py-1.5 text-[12px] transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                             onClick={() => handleDelete(a.id, a.email)}
                           >
                             <ShieldAlert size={14} />
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
