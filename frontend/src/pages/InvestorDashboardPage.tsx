import { Navbar } from '../components/Navbar';
import { InvestorDashboardOverview } from '../components/InvestorDashboardOverview';
import { useInvestorDashboard } from '../hooks/useInvestorDashboard';
import { Link } from 'react-router-dom';

export function InvestorDashboardPage() {
  const { data, loading, error } = useInvestorDashboard();

  return (
    <div className="app-container">
      <Navbar />

      <main className="page-content">
        <header style={{ marginBottom: 32 }}>
          <h1 className="page-title">Dashboard Inversor</h1>
          <p className="page-subtitle">
            Monitorea tu capital, inversiones activas y oportunidades.
          </p>
        </header>

        {loading && (
          <div className="spinner-wrap">
            <div className="spinner" />
            <span>Cargando métricas...</span>
          </div>
        )}

        {error && (
          <div className="campaign-empty-state fade-in">
            <div className="empty-icon">💎</div>
            <h2>Bienvenido a CrowdFunding</h2>
            <p className="text-muted" style={{ marginBottom: 24 }}>
              Parece que aún no tienes configurado tu perfil de inversor. Complétalo para empezar a invertir y monitorear tu capital.
            </p>
            <Link to="/profile" className="btn btn-primary">
              Completar Perfil →
            </Link>
          </div>
        )}

        {data && (
          <div className="fade-in">
            <InvestorDashboardOverview data={data} />
            
            <div style={{ marginTop: 48 }}>
              <h2 className="section-title">Inversiones Recientes</h2>
              <div className="campaign-empty-state">
                <div className="empty-icon">📈</div>
                <h3>Aún no tienes inversiones</h3>
                <p className="text-muted">Explora nuestras campañas activas y encuentra tu próxima oportunidad.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
