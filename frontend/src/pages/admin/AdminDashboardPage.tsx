import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getDashboardStats, getAllUsers, getAllCampaigns, updateCampaignStatus, softDeleteUser, hardDeleteCampaign } from '../../api/admin.api';
import type { DashboardStats, SystemUser, SystemCampaign } from '../../types/admin.types';
import './Admin.css';

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
      alert('Error updating status');
    }
  };

  const handleDeleteCampaign = async (id: string, title: string) => {
    if (!window.confirm(`⚠️ ¿ESTAS SEGURO de eliminar la campaña: "${title}"?\n\nEsta acción es destructiva. Si la campaña tiene inversiones, será Cancelada en lugar de eliminada.`)) return;
    try {
      await hardDeleteCampaign(id);
      await loadData();
    } catch(e) {
      console.error(e);
      alert('Error eliminando campaña');
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!window.confirm(`⚠️ ¿Deseas suspender/eliminar al usuario "${email}"?\nLe impedirá iniciar sesión.`)) return;
    try {
      await softDeleteUser(id);
      await loadData();
    } catch(e) {
      console.error(e);
      alert('Error eliminando usuario');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <span className="spinner" style={{ width: 40, height: 40, borderColor: '#3b82f6', borderTopColor: 'transparent' }} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>Resumen del Sistema</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>Gestiona la actividad y métricas clave de la plataforma.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Usuarios Registrados</div>
          <div className="stat-value">{stats?.totalUsers || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Campañas Activas</div>
          <div className="stat-value">{stats?.totalCampaigns || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Capital Movilizado</div>
          <div className="stat-value">${(stats?.totalFunded || 0).toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Campañas Needing Review */}
        <div className="admin-list-container">
          <div className="admin-list-header">
            <h2 className="admin-list-title">Revisión de Campañas</h2>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Creador</th>
                <th>Objetivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.title}</td>
                  <td>{c.creator_email}</td>
                  <td>${parseFloat(c.goal_amount).toLocaleString()}</td>
                  <td>
                     <span className={`badge ${c.status === 'approved' ? 'success' : c.status === 'pending_review' ? 'warning' : 'danger'}`}>
                        {c.status.replace('_', ' ')}
                     </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-sm approve" onClick={() => handleStatusUpdate(c.id, 'approved')}>✓ Aprobar</button>
                      <button className="btn-sm reject" onClick={() => handleStatusUpdate(c.id, 'rejected')}>✗ Rechazar</button>
                      <button className="btn-sm reject" style={{ background: '#7f1d1d' }} onClick={() => handleDeleteCampaign(c.id, c.title)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
                    No hay campañas pendientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* System Users */}
        <div className="admin-list-container">
          <div className="admin-list-header">
            <h2 className="admin-list-title">Últimos Usuarios</h2>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 10).map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'success' : 'danger'}`}>
                        {u.is_active ? 'activo' : 'inactivo'}
                     </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                     {u.is_active && (
                       <button className="btn-sm reject" style={{ background: '#7f1d1d' }} onClick={() => handleDeleteUser(u.id, u.email)}>🗑️ Bloquear</button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
}
