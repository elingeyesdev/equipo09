import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../../pages/admin/Admin.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const role = localStorage.getItem('adminAccessLevel');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('adminAccessLevel');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span>⚙️</span>
          AdminZone
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink to="/admin" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} end>
            Dashboard
          </NavLink>
          {role === 'super_admin' && (
            <NavLink to="/superadmin" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              SuperAdmin
            </NavLink>
          )}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', color: '#f87171' }}>
            Cierra Sesión
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8' }}>
            <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{localStorage.getItem('userEmail')}</span>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
            }}>
              ✨
            </div>
          </div>
        </header>
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
