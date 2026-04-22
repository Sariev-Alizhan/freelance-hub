'use client'
import { useLang, LANG_LABELS, type Lang } from '@/lib/context/LanguageContext'

const LANGS: Lang[] = ['en', 'ru', 'kz']

export default function AuthLangSwitcher() {
  const { lang, setLang } = useLang()
  return (
    <div style={{
      position: 'absolute', top: 16, right: 16,
      display: 'flex', gap: 4,
      padding: 3, borderRadius: 8,
      background: 'var(--fh-surface)',
      border: '1px solid var(--fh-border-2)',
    }}>
      {LANGS.map(l => {
        const active = lang === l
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              minWidth: 30, height: 26,
              padding: '0 8px',
              borderRadius: 6, border: 'none',
              background: active ? 'rgba(39,166,68,0.15)' : 'transparent',
              color: active ? '#27a644' : 'var(--fh-t4)',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {LANG_LABELS[l]}
          </button>
        )
      })}
    </div>
  )
}
