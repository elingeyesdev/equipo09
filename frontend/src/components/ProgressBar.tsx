export type ProgressBarTone = 'low' | 'mid' | 'high' | 'complete';

export function progressToneFromPercent(clampedPercent: number): ProgressBarTone {
  if (clampedPercent >= 100) return 'complete';
  if (clampedPercent >= 75) return 'high';
  if (clampedPercent >= 25) return 'mid';
  return 'low';
}

interface Props {
  /** Visual fill width 0–100 (should be pre-clamped). */
  value: number;
  tone?: ProgressBarTone | 'auto';
  className?: string;
  trackClassName?: string;
}

export function ProgressBar({ value, tone = 'auto', className, trackClassName }: Props) {
  const safe = Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
  const resolvedTone: ProgressBarTone =
    tone === 'auto' ? progressToneFromPercent(safe) : tone;

  const toneClasses = {
    low: 'bg-gradient-to-r from-slate-300 to-slate-400',
    mid: 'bg-gradient-to-r from-[#aed581] to-[#2e7d32]', // Lima a Verde
    high: 'bg-gradient-to-r from-[#2e7d32] to-[#00897b]', // Verde a Esmeralda
    complete: 'bg-gradient-to-r from-[#2e7d32] to-[#00897b] shadow-[0_0_12px_rgba(46,125,50,0.3)]',
  };

  return (
    <div
      className={`h-2.5 w-full bg-slate-100/80 rounded-full overflow-hidden ${trackClassName ?? ''}`.trim()}
      role="progressbar"
      aria-valuenow={Math.round(safe)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progreso ${Math.round(safe)} por ciento`}
    >
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${toneClasses[resolvedTone]} ${className ?? ''}`.trim()}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}
