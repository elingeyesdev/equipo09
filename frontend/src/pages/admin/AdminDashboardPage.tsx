import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getDashboardStats, getAllUsers, getAllCampaigns, updateCampaignStatus, softDeleteUser, hardDeleteCampaign } from '../../api/admin.api';
import type { DashboardStats, SystemUser, SystemCampaign } from '../../types/admin.types';
import { 
  Users, 
  Rocket, 
  CircleDollarSign, 
  Check, 
  X, 
  Trash2, 
  ShieldAlert 
} from 'lucide-react';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [campaigns, setCampaigns] = useState<SystemCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [st, usr, cmp] = await Promise.all([
        getDashboardStats(),
        getAllUsers(),
        getAllCampaigns()
      ]);
      setStats(st);
      setUsers(usr);
      setCampaigns(cmp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!window.confirm(`¿Estás seguro de mover la campaña a '${status}'?`)) return;
    try {
      await updateCampaignStatus(id, status);
      await loadData();
    } catch(e) {
      console.error(e);
    }
  };

  const handleDeleteCampaign = async (id: string, title: string) => {
    if (!window.confirm(`ESTAS SEGURO de eliminar la campaña: "${title}"?\n\nEsta acción es destructiva. Si la campaña tiene inversiones, será Cancelada en lugar de eliminada.`)) return;
    try {
      await hardDeleteCampaign(id);
      await loadData();
    } catch(e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!window.confirm(`¿Deseas suspender/eliminar al usuario "${email}"?\nLe impedirá iniciar sesión.`)) return;
    try {
      await softDeleteUser(id);
      await loadData();
    } catch(e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-full flex flex-col items-center justify-center gap-6 py-40">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2e7d32] rounded-full animate-spin" />
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Sincronizando Auditoría Central...</span>
        </div>
      </AdminLayout>
    );
  }

  const statCard = "bg-white border border-emerald-50 rounded-[28px] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-6 group";

  return (
    <AdminLayout>
      <div className="mb-12 flex flex-col gap-2">
        <h1 className="text-3xl font-black text-[#1c2b1e] tracking-tight leading-none mb-1">Resumen del Sistema</h1>
        <p className="text-[15px] font-medium text-slate-400 italic">Gestiona la actividad, integridad y métricas clave de la plataforma con solidez financiera.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className={statCard}>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#2e7d32] group-hover:scale-110 transition-transform">
             <Users size={28} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Usuarios Registrados</div>
            <div className="text-3xl font-black text-[#1c2b1e] tracking-tight leading-none">{stats?.totalUsers || 0}</div>
          </div>
        </div>

        <div className={statCard}>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#2e7d32] group-hover:scale-110 transition-transform">
             <Rocket size={28} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Campañas Activas</div>
            <div className="text-3xl font-black text-[#1c2b1e] tracking-tight leading-none">{stats?.totalCampaigns || 0}</div>
          </div>
        </div>

        <div className={statCard}>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#2e7d32] group-hover:scale-110 transition-transform">
             <CircleDollarSign size={28} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Capital Movilizado</div>
            <div className="text-3xl font-black text-[#1c2b1e] tracking-tight leading-none">${(stats?.totalFunded || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Campañas Needing Review */}
        <div className="bg-white rounded-[32px] border border-emerald-50 overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-emerald-50 flex items-center justify-between">
            <h2 className="text-[16px] font-black text-[#1c2b1e] tracking-tight uppercase tracking-widest leading-none">Revisión de Campañas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Título</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Creador</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Objetivo</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {campaigns.map(c => (
                  <tr key={c.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-8 py-5 text-[14px] font-black text-[#1c2b1e] group-hover:text-[#2e7d32] transition-colors">{c.title}</td>
                    <td className="px-8 py-5 text-[14px] font-medium text-slate-600">{c.creator_email}</td>
                    <td className="px-8 py-5 text-[14px] font-black text-[#1c2b1e]">${parseFloat(c.goal_amount).toLocaleString()}</td>
                    <td className="px-8 py-5">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                         ${c.status === 'approved' ? 'bg-emerald-50 text-[#2e7d32] border-emerald-100' : 
                           c.status === 'pending_review' ? 'bg-amber-50 text-[#f9a825] border-amber-200' : 
                           'bg-red-50 text-[#c62828] border-red-100'}
                       `}>
                          {c.status.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <button 
                          className="w-9 h-9 flex items-center justify-center bg-emerald-50 text-[#2e7d32] rounded-xl hover:bg-[#2e7d32] hover:text-white transition-all active:scale-95 border-none cursor-pointer" 
                          title="Aprobar"
                          onClick={() => handleStatusUpdate(c.id, 'approved')}
                        >
                           <Check size={18} strokeWidth={3} />
                        </button>
                        <button 
                          className="w-9 h-9 flex items-center justify-center bg-amber-50 text-[#f9a825] rounded-xl hover:bg-[#f9a825] hover:text-white transition-all active:scale-95 border-none cursor-pointer" 
                          title="Rechazar"
                          onClick={() => handleStatusUpdate(c.id, 'rejected')}
                        >
                           <X size={18} strokeWidth={3} />
                        </button>
                        <button 
                          className="w-9 h-9 flex items-center justify-center bg-red-50 text-[#c62828] rounded-xl hover:bg-[#c62828] hover:text-white transition-all active:scale-95 border-none cursor-pointer" 
                          title="Eliminar"
                          onClick={() => handleDeleteCampaign(c.id, c.title)}
                        >
                           <Trash2 size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                       <div className="text-slate-200 mb-2 flex justify-center">
                          <Check size={48} strokeWidth={1} />
                       </div>
                       <p className="text-[14px] font-bold text-slate-400 uppercase tracking-widest">No hay campañas pendientes de auditoría.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Users */}
        <div className="bg-white rounded-[32px] border border-emerald-50 overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-emerald-50 flex items-center justify-between">
            <h2 className="text-[16px] font-black text-[#1c2b1e] tracking-tight uppercase tracking-widest leading-none">Últimos Usuarios</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Fecha Registro</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {users.slice(0, 10).map(u => (
                  <tr key={u.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-8 py-5 text-[14px] font-black text-[#1c2b1e] group-hover:text-[#2e7d32] transition-colors">{u.email}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                         ${u.is_active ? 'bg-emerald-50 text-[#2e7d32] border-emerald-100' : 'bg-red-50 text-[#c62828] border-red-100'}
                       `}>
                        {u.is_active ? 'activo' : 'inactivo'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[14px] font-medium text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        {u.is_active && (
                          <button 
                            className="bg-white hover:bg-red-50 text-slate-400 hover:text-[#c62828] font-bold border border-gray-100 hover:border-red-100 rounded-xl px-4 py-2 text-[12px] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                            onClick={() => handleDeleteUser(u.id, u.email)}
                          >
                            <ShieldAlert size={14} strokeWidth={2.5} />
                            Bloquear
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
