interface Props {
  /** Icon size in px. Default 36. */
  size?: number
  /** Show "FreelanceHub" wordmark next to the icon. Default true. */
  showWordmark?: boolean
  className?: string
  wordmarkClass?: string
}

/**
 * FreelanceHub brand mark — editorial brutalist.
 *
 * Construction (brief §3 + §6):
 * - Sharp ink square (no rounded corners — `rx=0`)
 * - Architectural F built from stacked paper rectangles (no terminal radius)
 * - Hub-node "port" — sharp signal-green square at the end of the middle bar
 *   (replaces the old circular ring → squares are the manifesto)
 * - Wordmark: ink-weight "Freelance" + serif italic "hub"
 *
 * Colours from brief §3:
 *   --paper #F4F0E8   --ink #0A0A08   --signal-green #27a644
 *
 * Inverse-aware: square stays ink in light mode (high contrast on paper)
 * and flips to paper in dark mode (high contrast on ink).
 */
export default function Logo({
  size = 36,
  showWordmark = true,
  className = '',
  wordmarkClass = '',
}: Props) {
  return (
    <div className={`flex items-baseline gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="FreelanceHub"
        style={{ flexShrink: 0 }}
      >
        {/* Ink square (sharp — radius 0). Filled with currentColor so the icon
            inverts naturally between light and dark themes via parent text colour. */}
        <rect width="64" height="64" fill="currentColor" />

        {/* F vertical stroke — paper */}
        <rect x="14" y="12" width="9" height="40" fill="var(--fh-canvas, #F4F0E8)" />

        {/* F top bar */}
        <rect x="14" y="12" width="34" height="9" fill="var(--fh-canvas, #F4F0E8)" />

        {/* F middle bar */}
        <rect x="14" y="29" width="24" height="9" fill="var(--fh-canvas, #F4F0E8)" />

        {/* Signal-green port — ends the middle bar, sharp square (no circle) */}
        <rect x="40" y="29" width="9" height="9" fill="#27A644" />
      </svg>

      {showWordmark && (
        <span
          className={`leading-none ${wordmarkClass}`}
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: 'var(--fh-t1)',
          }}
        >
          freelance
          <span
            style={{
              fontFamily:
                'var(--font-serif-display), ui-serif, Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              color: '#27A644',
            }}
          >
            hub
          </span>
        </span>
      )}
    </div>
  )
}
