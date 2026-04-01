import { useNavigate, useLocation, Link } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        🚀 CROWD<span>FUNDING</span>
      </div>

      <div className="navbar-nav">
        {userRole === 'entrepreneur' ? (
          <>
            <Link 
              to="/entrepreneur-campaigns" 
              className={`nav-link ${isActive('/entrepreneur-campaigns') ? 'active' : ''}`}
            >
              Mis Campañas
            </Link>
            <Link 
              to="/entrepreneur-profile" 
              className={`nav-link ${isActive('/entrepreneur-profile') ? 'active' : ''}`}
            >
              Perfil Emprendedor
            </Link>
          </>
        ) : (
          <>
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard Principal
            </Link>
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              Configurar Perfil
            </Link>
          </>
        )}
      </div>

      <div className="navbar-actions">
        {userEmail && <span className="user-badge">👤 {userEmail}</span>}
        <button 
          className="btn btn-ghost" 
          onClick={handleLogout}
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
