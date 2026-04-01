import { useEntrepreneurProfile } from '../hooks/useEntrepreneurProfile';
import { EntrepreneurProfileForm } from '../components/EntrepreneurProfileForm';
import { Navbar } from '../components/Navbar';

export function EntrepreneurProfilePage() {
  const {
    profile,
    loading,
    saving,
    error,
    successMessage,
    isNewProfile,
    submitProfile,
  } = useEntrepreneurProfile();

  const userEmail = localStorage.getItem('userEmail') ?? '';

  // Iniciales del avatar
  const initials = profile
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : userEmail[0]?.toUpperCase() ?? '?';

  // Estadísticas del perfil
  const stats = profile && !isNewProfile ? [
    { label: 'Campañas', value: profile.totalCampaigns },
    { label: 'Total recaudado', value: `$${profile.totalRaised.toLocaleString('es-CO')}` },
    { label: 'Calificación', value: profile.rating ? `${profile.rating.toFixed(1)} ★` : '—' },
    { label: 'Verificado', value: profile.identityVerified ? '✓ Sí' : '✗ Pendiente' },
  ] : null;

  return (
    <div className="app-container">
      <Navbar />
      <main className="page-content">
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-meta">
            <h1>
              {profile
                ? `${profile.firstName} ${profile.lastName}`
                : 'Mi Perfil de Emprendedor'}
            </h1>
            <p>
              {profile?.companyName
                ? `🏢 ${profile.companyName}`
                : profile?.displayName
                  ? profile.displayName
                  : 'Completa tu perfil para empezar a publicar campañas'}
            </p>
          </div>
          <span className={`badge ${isNewProfile ? 'badge-new' : 'badge-active'}`}>
            {isNewProfile ? 'Nuevo' : 'Activo'}
          </span>
        </div>
        {stats && (
          <div className="ep-stats-grid">
            {stats.map(({ label, value }) => (
              <div key={label} className="ep-stat-card">
                <div className="ep-stat-value">{value}</div>
                <div className="ep-stat-label">{label}</div>
              </div>
            ))}
          </div>
        )}
        <p className="page-subtitle">
          {isNewProfile
            ? 'Parece que aún no tienes un perfil. Completa el formulario para comenzar a publicar campañas.'
            : 'Edita tu información personal y empresarial. Solo se actualizan los campos modificados.'}
        </p>
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
        {loading ? (
          <div className="card">
            <div className="spinner-wrap">
              <div className="spinner" />
              Cargando tu perfil...
            </div>
          </div>
        ) : (
          <div className="card">
            <EntrepreneurProfileForm
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
