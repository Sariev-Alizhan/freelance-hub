export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

export const SRC_COLOR: Record<string, string> = {
  hn: '#f97316',
  reddit_ai: '#ff4500',
  reddit_ml: 'var(--fh-primary)',
  reddit_llama: '#27a644',
}

export const SRC_BG: Record<string, string> = {
  hn: 'rgba(249,115,22,0.1)',
  reddit_ai: 'rgba(255,69,0,0.1)',
  reddit_ml: 'var(--fh-primary-muted)',
  reddit_llama: 'rgba(39,166,68,0.1)',
}
