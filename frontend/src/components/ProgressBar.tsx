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

  return (
    <div
      className={`progress-bar-bg ${trackClassName ?? ''}`.trim()}
      role="progressbar"
      aria-valuenow={Math.round(safe)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progreso ${Math.round(safe)} por ciento`}
    >
      <div
        className={`progress-bar-fill progress-bar-fill--${resolvedTone} ${className ?? ''}`.trim()}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}
