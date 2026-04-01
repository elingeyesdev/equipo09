import type { CapitalOverview } from '../types/investor.types';
import { Link } from 'react-router-dom';

interface Props {
  data: CapitalOverview;
}

export function InvestorDashboardOverview({ data }: Props) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const hasMaxConfigured = data.maxInvestmentLimit !== null;

  return (
    <div className="investor-dashboard">
      <div className="ep-stats-grid">
        <div className="ep-stat-card">
          <div className="ep-stat-value" style={{ color: hasMaxConfigured ? 'var(--success)' : 'var(--text-muted)' }}>
            {hasMaxConfigured ? formatCurrency(data.availableCapital || 0) : 'N/D'}
          </div>
          <div className="ep-stat-label">Capital Disponible</div>
        </div>

        <div className="ep-stat-card">
          <div className="ep-stat-value">
            {formatCurrency(data.totalInvested || 0)}
          </div>
          <div className="ep-stat-label">Total Invertido</div>
        </div>

        <div className="ep-stat-card">
          <div className="ep-stat-value">
            {formatCurrency(data.pendingAmount || 0)}
          </div>
          <div className="ep-stat-label">Monto Pendiente</div>
        </div>

        <div className="ep-stat-card">
          <div className="ep-stat-value">
            {data.completedInvestments || 0}
          </div>
          <div className="ep-stat-label">Inversiones</div>
        </div>
      </div>

      {!hasMaxConfigured && (
        <div className="alert alert-error" style={{ marginTop: 20 }}>
          <span>⚠</span> 
          <span>
            No has configurado tu monto máximo de inversión para calcular el capital disponible.{' '}
            <Link to="/profile" style={{ color: 'inherit', textDecoration: 'underline' }}>
              Configúralo aquí
            </Link>.
          </span>
        </div>
      )}
    </div>
  );
}
