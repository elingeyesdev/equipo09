import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getAllAdmins, createAdmin, deleteAdmin } from '../../api/admin.api';
import type { AdminUser } from '../../types/admin.types';
import './Admin.css';

export function SuperAdminDashboardPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`⚠️ ESTAS A PUNTO DE ELIMINAR LOS PERMISOS DE: ${email}\n\n¿Deseas continuar? Pasará a ser un usuario común.`)) return;
    try {
      await deleteAdmin(id);
      await loadData();
    } catch(e) {
      console.error(e);
      alert('Error eliminando privilegios');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createAdmin(creds);
      setCreds({ email: '', password: '' });
      await loadData();
      alert('Administrador creado exitosamente');
    } catch(err: any) {
       alert(err?.response?.data?.message || 'Error al crear admin');
    } finally {
      setIsSubmitting(false);
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
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>Panel de SuperAdmin</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>Crea y gestiona otros administradores de la plataforma.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '2rem', alignItems: 'start' }}>
        <div className="admin-list-container" style={{ padding: '2rem' }}>
          <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', color: '#f1f5f9' }}>Nuevo Administrador</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ color: '#cbd5e1' }}>Correo Institucional</label>
              <input
                type="email"
                required
                value={creds.email}
                onChange={e => setCreds(p => ({...p, email: e.target.value}))}
                style={{ background: '#0a0d12', border: '1px solid #1e293b', color: 'white' }}
                placeholder="admin@equipo09.com"
              />
            </div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label style={{ color: '#cbd5e1' }}>Contraseña</label>
              <input
                type="password"
                required
                minLength={8}
                value={creds.password}
                onChange={e => setCreds(p => ({...p, password: e.target.value}))}
                style={{ background: '#0a0d12', border: '1px solid #1e293b', color: 'white' }}
                placeholder="••••••••"
              />
            </div>
            <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={isSubmitting}
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none' }}
            >
              {isSubmitting ? 'Creando...' : 'Crear Administrador'}
            </button>
          </form>
        </div>

        <div className="admin-list-container">
          <div className="admin-list-header">
            <h2 className="admin-list-title">Administradores Activos</h2>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nivel de Acceso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>{a.email}</td>
                  <td>
                    <span className={`badge ${a.access_level === 'super_admin' ? 'warning' : 'success'}`}>
                       {a.access_level.toUpperCase()}
                     </span>
                  </td>
                  <td>
                     <span className={`badge ${a.is_active ? 'success' : 'danger'}`}>
                        {a.is_active ? 'activo' : 'inactivo'}
                     </span>
                  </td>
                  <td>
                    {a.access_level !== 'super_admin' && (
                       <button className="btn-sm reject" style={{ background: '#7f1d1d' }} onClick={() => handleDelete(a.id, a.email)}>Revocar</button>
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
