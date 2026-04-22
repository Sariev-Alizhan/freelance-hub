'use client'
import { useState } from 'react'
import { Languages, Loader2, ChevronDown, RotateCcw } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

interface Props {
  text: string
  className?: string
}

const LANGS = [
  { code: 'ru', label: 'RU — Русский'   },
  { code: 'en', label: 'EN — English'   },
  { code: 'kz', label: 'KZ — Қазақша'  },
  { code: 'ar', label: 'AR — العربية'  },
  { code: 'zh', label: 'ZH — 中文'     },
  { code: 'de', label: 'DE — Deutsch'   },
  { code: 'fr', label: 'FR — Français'  },
  { code: 'es', label: 'ES — Español'   },
  { code: 'tr', label: 'TR — Türkçe'   },
  { code: 'uk', label: 'UK — Українська'},
]

export default function InlineTranslator({ text, className }: Props) {
  const { lang } = useLang()
  const [translated, setTranslated]   = useState<string | null>(null)
  const [loading,    setLoading]       = useState(false)
  const [showMenu,   setShowMenu]      = useState(false)
  const [targetLang, setTargetLang]    = useState<string | null>(null)

  const label = {
    en: { btn: 'Translate', loading: 'Translating…', original: 'Original', pick: 'Pick language' },
    ru: { btn: 'Перевести', loading: 'Перевожу…',    original: 'Оригинал',  pick: 'Выберите язык' },
    kz: { btn: 'Аудару',    loading: 'Аударылуда…',  original: 'Түпнұсқа',  pick: 'Тілді таңдаңыз' },
  }[lang] || { btn: 'Translate', loading: 'Translating…', original: 'Original', pick: 'Pick language' }

  async function translate(code: string) {
    setShowMenu(false)
    setTargetLang(code)
    setLoading(true)
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: code }),
      })
      const json = await res.json()
      if (res.ok) setTranslated(json.translated)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setTranslated(null)
    setTargetLang(null)
  }

  return (
    <div className={className}>
      {/* Translated text */}
      {translated && (
        <div style={{
          marginTop: 10, padding: '10px 12px', borderRadius: 10,
          background: 'rgba(39,166,68,0.06)', border: '1px solid rgba(39,166,68,0.2)',
          fontSize: 14, lineHeight: 1.7, color: 'var(--fh-t2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#27a644', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {LANGS.find(l => l.code === targetLang)?.label?.split('—')[0].trim()}
            </span>
            <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--fh-t4)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <RotateCcw size={11} /> {label.original}
            </button>
          </div>
          {translated}
        </div>
      )}

      {/* Translate button + lang picker */}
      <div style={{ position: 'relative', display: 'inline-block', marginTop: 8 }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 7,
            border: '1px solid var(--fh-border)',
            background: 'var(--fh-surface-2)',
            color: 'var(--fh-t4)', fontSize: 12, fontWeight: 600,
            cursor: loading ? 'default' : 'pointer', transition: 'all 0.15s',
          }}
        >
          {loading
            ? <><Loader2 size={12} className="animate-spin" /> {label.loading}</>
            : <><Languages size={12} /> {label.btn} <ChevronDown size={11} /></>
          }
        </button>

        {showMenu && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, marginBottom: 4,
            borderRadius: 10, overflow: 'hidden', zIndex: 50,
            background: 'var(--popover)', border: '1px solid var(--fh-border-2)',
            boxShadow: 'var(--shadow-dropdown)', minWidth: 170,
          }}>
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => translate(l.code)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 14px', fontSize: 13, border: 'none', cursor: 'pointer',
                  background: l.code === targetLang ? 'rgba(39,166,68,0.08)' : 'transparent',
                  color: l.code === targetLang ? '#27a644' : 'var(--fh-t2)',
                  fontWeight: l.code === targetLang ? 600 : 400,
                }}
                onMouseEnter={e => { if (l.code !== targetLang) e.currentTarget.style.background = 'var(--fh-surface-2)' }}
                onMouseLeave={e => { if (l.code !== targetLang) e.currentTarget.style.background = 'transparent' }}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
