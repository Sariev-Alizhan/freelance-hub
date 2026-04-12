interface Props {
  /** Icon size in px. Default 36. */
  size?: number
  /** Show "FreelanceHub" wordmark next to the icon. Default true. */
  showWordmark?: boolean
  className?: string
  wordmarkClass?: string
}

/**
 * FreelanceHub brand logo.
 * Icon: stylised "F" lettermark with a hub/node accent, indigo rounded square.
 * Works in both dark and light themes — the icon background is a fixed brand colour.
 */
export default function Logo({
  size = 36,
  showWordmark = true,
  className = '',
  wordmarkClass = '',
}: Props) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        {/* Background — indigo rounded square */}
        <rect width="512" height="512" rx="110" fill="#4338CA" />

        {/* F — vertical stroke */}
        <rect x="118" y="96" width="72" height="320" rx="8" fill="white" />

        {/* F — top horizontal bar */}
        <rect x="118" y="96" width="276" height="72" rx="8" fill="white" />

        {/* F — middle horizontal bar */}
        <rect x="118" y="232" width="196" height="72" rx="8" fill="white" />

        {/* Hub node — outer ring (white) tangent to end of middle bar */}
        <circle cx="350" cy="268" r="42" fill="white" />

        {/* Hub node — inner dot (brand colour) creating a ring/port shape */}
        <circle cx="350" cy="268" r="19" fill="#4338CA" />
      </svg>

      {showWordmark && (
        <span className={`font-bold tracking-tight leading-none text-[1.125rem] ${wordmarkClass}`}>
          Freelance<span className="text-primary">Hub</span>
        </span>
      )}
    </div>
  )
}
