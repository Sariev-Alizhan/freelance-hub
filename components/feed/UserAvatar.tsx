import Image from 'next/image'

export default function UserAvatar({ url, name, size = 32 }: {
  url?: string | null
  name?: string | null
  size?: number
}) {
  if (url) {
    return (
      <Image
        src={url}
        alt={name ?? ''}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
        unoptimized
      />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.38, background: 'var(--fh-primary)', flexShrink: 0 }}
    >
      {(name ?? '?')[0]?.toUpperCase()}
    </div>
  )
}
