interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizePx = { sm: 20, md: 24, lg: 32, xl: 48 } as const;

/* Material Design / iOS style: single arc (~25% of circle), rounded ends */
const R = 18;
const STROKE = 3;
const CIRCUMFERENCE = 2 * Math.PI * R;
const ARC = CIRCUMFERENCE * 0.25;

/**
 * Industry-standard modern loading icon (Material Design 3 / iOS style).
 * Single arc with rounded ends, rotating clockwise. Color via className.
 */
export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const px = sizePx[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      role="status"
      aria-label="Loading"
      className={`loading-spinner-svg inline-block shrink-0 align-middle ${className}`}
    >
      <circle
        cx="24"
        cy="24"
        r={R}
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={`${ARC} ${CIRCUMFERENCE - ARC}`}
      />
    </svg>
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen bg-[#17212b] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" className="text-[#5288c1] mx-auto mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
