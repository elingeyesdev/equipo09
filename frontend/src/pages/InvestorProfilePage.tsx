import { useNavigate } from 'react-router-dom';
import { useInvestorProfile } from '../hooks/useInvestorProfile';
import { InvestorProfileForm } from '../components/InvestorProfileForm';

export function InvestorProfilePage() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail') ?? '';
  const {
    profile,
    loading,
    saving,
    error,
    successMessage,
    isNewProfile,
    submitProfile,
  } = useInvestorProfile();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  // Iniciales del avatar
  const initials = profile
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : userEmail[0]?.toUpperCase() ?? '?';

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-brand">
          💎 Crowd<span>Funding</span>
        </span>
        <div className="navbar-actions">
          {userEmail && <span className="user-badge">👤 {userEmail}</span>}
          <button
            id="btn-logout"
            className="btn btn-ghost"
            onClick={handleLogout}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="page-content">

        {/* Profile header */}
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-meta">
            <h1>
              {profile
                ? `${profile.firstName} ${profile.lastName}`
                : 'Mi Perfil de Inversor'}
            </h1>
            <p>
              {profile?.displayName ?? 'Completa tu perfil para empezar a invertir'}
            </p>
          </div>
          <span className={`badge ${isNewProfile ? 'badge-new' : 'badge-active'}`}>
            {isNewProfile ? 'Nuevo' : 'Activo'}
          </span>
        </div>

        {/* Subtitle */}
        <p className="page-subtitle">
          {isNewProfile
            ? 'Parece que aún no tienes un perfil registrado. Completa el formulario para comenzar.'
            : 'Edita tu información personal. Solo se actualizan los campos que modifiques.'}
        </p>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            <span>⚠</span> {error}
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success" style={{ marginBottom: 24 }}>
            <span>✓</span> {successMessage}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="card">
            <div className="spinner-wrap">
              <div className="spinner" />
              Cargando tu perfil...
            </div>
          </div>
        ) : (
          <div className="card">
            <InvestorProfileForm
              profile={profile}
              saving={saving}
              isNew={isNewProfile}
              onSubmit={submitProfile}
            />
          </div>
        )}
      </main>
    </div>
  );
}
