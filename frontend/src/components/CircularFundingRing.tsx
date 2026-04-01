import {
  clampPercentForBar,
  computeFundingPercent,
  formatFundingPercent,
} from '../utils/campaignFunding';

interface Props {
  currentAmount: number;
  goalAmount: number;
}

const R = 54;
const STROKE = 9;
const C = 2 * Math.PI * R;

export function CircularFundingRing({ currentAmount, goalAmount }: Props) {
  const fillPct = clampPercentForBar(computeFundingPercent(currentAmount, goalAmount));
  const labelPct = formatFundingPercent(currentAmount, goalAmount);
  const dashOffset = C * (1 - fillPct / 100);

  return (
    <div
      className="circular-funding-ring"
      role="img"
      aria-label={`Financiación al ${labelPct} por ciento de la meta`}
    >
      <svg className="circular-funding-ring-svg" viewBox="0 0 140 140" aria-hidden>
        <defs>
          <linearGradient id="previewRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle
          cx="70"
          cy="70"
          r={R}
          fill="none"
          stroke="var(--bg-input)"
          strokeWidth={STROKE}
        />
        <circle
          cx="70"
          cy="70"
          r={R}
          fill="none"
          stroke="url(#previewRingGrad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 70 70)"
          className="circular-funding-ring-arc"
        />
      </svg>
      <div className="circular-funding-ring-center">
        <span className="circular-funding-ring-pct">{labelPct}%</span>
        <span className="circular-funding-ring-sub">de la meta</span>
      </div>
    </div>
  );
}
