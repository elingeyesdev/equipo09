import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { EntrepreneurCampaign, CampaignFinancialProgress } from '../types/campaign.types';
import { CircularFundingRing } from './CircularFundingRing';
import { getCampaignFinancialProgress } from '../api/campaign.api';
import { formatCampaignCurrency } from '../utils/campaignFunding';

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Borrador',
    published: 'Publicada',
    in_review: 'En revisión',
    pending_review: 'En aprobación',
    approved: 'Aprobada',
    funded: 'Financiada',
    partially_funded: 'Parcialmente financiada',
    completed: 'Completada',
    failed: 'Fallida',
    rejected: 'Rechazada',
    cancelled: 'Cancelada',
    suspended: 'Suspendida',
  };
  return map[status] ?? status;
}

function investmentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    completed: 'Confirmado',
    pending: 'Pendiente',
    failed: 'Fallido',
    refunded: 'Reembolsado',
    partially_refunded: 'Reemb. parcial',
  };
  return map[status] ?? status;
}

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

interface Props {
  campaign: EntrepreneurCampaign | null;
  open: boolean;
  onClose: () => void;
  onSubmitForReview?: () => void;
  onPublish?: () => void;
  actionLoading?: boolean;
}

export function CampaignPreviewModal({
  campaign,
  open,
  onClose,
  onSubmitForReview,
  onPublish,
  actionLoading,
}: Props) {
  const [finance, setFinance] = useState<CampaignFinancialProgress | null>(null);
  const [financeLoading, setFinanceLoading] = useState(false);

  useEffect(() => {
    if (!open || !campaign) {
      setFinance(null);
      return;
    }

    let cancelled = false;
    setFinance(null);
    setFinanceLoading(true);

    (async () => {
      try {
        const data = await getCampaignFinancialProgress(campaign.id);
        if (!cancelled) setFinance(data);
      } catch (err) {
        if (!cancelled) setFinance(null);
        console.error(err);
      } finally {
        if (!cancelled) setFinanceLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, campaign?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !campaign) return null;

  const canSubmit = campaign.status === 'draft';
  const canPublish = campaign.status === 'draft' || campaign.status === 'approved';

  const cur = finance?.currentAmount ?? campaign.currentAmount;
  const goal = finance?.goalAmount ?? campaign.goalAmount;
  const currency = campaign.currency || 'USD';
  const investorsTotal = finance?.investorCount ?? campaign.investorCount;
  const recent = finance?.recentInvestments ?? [];

  const node = (
    <div className="modal-root" role="dialog" aria-modal="true" aria-labelledby="preview-title">
      <button type="button" className="modal-backdrop" onClick={onClose} aria-label="Cerrar" />
      <div className="modal-panel campaign-preview-panel">
        <header className="campaign-preview-header">
          <div>
            <p className="campaign-preview-eyebrow">Vista previa</p>
            <h2 id="preview-title" className="campaign-preview-title">
              {campaign.title}
            </h2>
            <p className="campaign-preview-meta">
              {campaign.categoryName} · {statusLabel(campaign.status)}
            </p>
          </div>
          <button type="button" className="btn btn-ghost modal-close-btn" onClick={onClose}>
            Cerrar
          </button>
        </header>

        <div className="campaign-preview-highlight">
          <CircularFundingRing currentAmount={cur} goalAmount={goal} />
          <div className="campaign-preview-amounts">
            <div className="campaign-preview-amount-block">
              <span className="campaign-preview-amount-label">Recaudado</span>
              <span className="campaign-preview-amount-value">
                {formatCampaignCurrency(cur, currency)}
              </span>
            </div>
            <div className="campaign-preview-amount-block">
              <span className="campaign-preview-amount-label">Meta</span>
              <span className="campaign-preview-amount-value">
                {formatCampaignCurrency(goal, currency)}
              </span>
            </div>
            {finance != null && finance.remainingAmount > 0 && (
              <div className="campaign-preview-amount-block">
                <span className="campaign-preview-amount-label">Falta</span>
                <span className="campaign-preview-amount-value campaign-preview-amount-value--muted">
                  {formatCampaignCurrency(finance.remainingAmount, currency)}
                </span>
              </div>
            )}
          </div>
        </div>

        <section className="campaign-preview-section">
          <h3 className="campaign-preview-section-title">Descripción</h3>
          <p className="campaign-preview-description">
            {campaign.shortDescription?.trim()
              ? campaign.shortDescription
              : 'Sin descripción breve. Añádela al crear o editar la campaña para que los inversores entiendan tu proyecto.'}
          </p>
        </section>

        <section className="campaign-preview-section">
          <h3 className="campaign-preview-section-title">Quiénes aportaron</h3>
          {financeLoading && (
            <p className="campaign-preview-muted">Cargando aportes…</p>
          )}
          {!financeLoading && investorsTotal === 0 && (
            <p className="campaign-preview-muted">Aún no hay aportes registrados.</p>
          )}
          {!financeLoading && investorsTotal > 0 && recent.length === 0 && (
            <p className="campaign-preview-muted">
              {investorsTotal}{' '}
              {investorsTotal === 1 ? 'persona ha aportado' : 'personas han aportado'} (detalle no
              disponible).
            </p>
          )}
          {!financeLoading && recent.length > 0 && (
            <ul className="campaign-preview-contributors">
              {recent.map((inv) => (
                <li key={inv.id} className="campaign-preview-contributor-row">
                  <div className="campaign-preview-contributor-main">
                    <span className="campaign-preview-contributor-name">
                      {inv.isAnonymous || !inv.investorDisplayName?.trim()
                        ? 'Anónimo'
                        : inv.investorDisplayName}
                    </span>
                    <span className="campaign-preview-contributor-meta">
                      {investmentStatusLabel(inv.status)} · {formatShortDate(inv.createdAt)}
                    </span>
                  </div>
                  <span className="campaign-preview-contributor-amount">
                    {formatCampaignCurrency(inv.amount, inv.currency || currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {(canSubmit || canPublish) && (
          <footer className="campaign-preview-actions">
            {canSubmit && (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={actionLoading}
                onClick={onSubmitForReview}
              >
                Enviar a aprobación
              </button>
            )}
            {canPublish && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={actionLoading}
                onClick={onPublish}
              >
                Publicar campaña
              </button>
            )}
          </footer>
        )}
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
