'use client'

import { useState, useEffect } from 'react'
import {
  FileText, Globe,
  Download, ExternalLink, Link2, Code2,
} from 'lucide-react'

interface ProfileDocument {
  id:        string
  name:      string
  url:       string
  file_type: string
  file_size: number | null
  doc_type:  string
  created_at: string
}

interface ProfileProSectionProps {
  userId:            string
  portfolioWebsite?: string | null
  githubUrl?:        string | null
  linkedinUrl?:      string | null
  resumeUrl?:        string | null
  resumeFilename?:   string | null
  headline?:         string | null
  // Social links
  telegramUrl?:      string | null
  instagramUrl?:     string | null
  twitterUrl?:       string | null
  youtubeUrl?:       string | null
  tiktokUrl?:        string | null
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const DOC_TYPE_ICON: Record<string, string> = {
  resume: '📄', portfolio: '🗂', certificate: '🎓', other: '📎',
}
const DOC_TYPE_LABEL: Record<string, string> = {
  resume: 'Resume / CV', portfolio: 'Portfolio', certificate: 'Certificate', other: 'Document',
}

export default function ProfileProSection({
  userId,
  portfolioWebsite,
  githubUrl,
  linkedinUrl,
  resumeUrl,
  resumeFilename,
  headline,
  telegramUrl,
  instagramUrl,
  twitterUrl,
  youtubeUrl,
  tiktokUrl,
}: ProfileProSectionProps) {
  const [documents, setDocuments]   = useState<ProfileDocument[]>([])
  const [loadedDocs, setLoadedDocs] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loadedDocs) {
        fetch(`/api/profile/public/${userId}/documents`)
          .then(r => r.json())
          .then(d => { setDocuments(d.documents ?? []); setLoadedDocs(true) })
          .catch(() => setLoadedDocs(true))
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [userId, loadedDocs])

  const socialLinks = [
    telegramUrl  && { href: telegramUrl,  label: 'Telegram',  color: '#29b6f6', emoji: '✈️' },
    instagramUrl && { href: instagramUrl, label: 'Instagram', color: '#e1306c', emoji: '📸' },
    twitterUrl   && { href: twitterUrl,   label: 'X / Twitter', color: '#1d9bf0', emoji: '𝕏' },
    youtubeUrl   && { href: youtubeUrl,   label: 'YouTube',   color: '#ff0000', emoji: '▶️' },
    tiktokUrl    && { href: tiktokUrl,    label: 'TikTok',    color: '#010101', emoji: '🎵' },
  ].filter(Boolean) as { href: string; label: string; color: string; emoji: string }[]

  const hasLinks     = portfolioWebsite || githubUrl || linkedinUrl || socialLinks.length > 0
  const hasResume    = !!resumeUrl
  const hasDocuments = documents.length > 0

  // If nothing to show at all (even after loading), render nothing
  if (!hasLinks && !hasResume && !headline && loadedDocs && !hasDocuments) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Headline ──────────────────────────────────────────── */}
      {headline && (
        <div
          style={{
            padding: '14px 18px', borderRadius: 10,
            background: 'linear-gradient(135deg, #7170ff14 0%, #06b6d414 100%)',
            border: '1px solid #7170ff30',
          }}
        >
          <p style={{ margin: 0, fontSize: 15, fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }}>
            {headline}
          </p>
        </div>
      )}

      {/* ── Links: portfolio / GitHub / LinkedIn ──────────────── */}
      {hasLinks && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Links
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {portfolioWebsite && (
              <a
                href={portfolioWebsite}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)', textDecoration: 'none', transition: 'border-color 0.15s' }}
              >
                <Globe size={15} style={{ color: '#7170ff', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--fh-t1)', fontWeight: 510 }}>Portfolio Website</span>
                <span style={{ fontSize: 12, color: 'var(--fh-t4)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {portfolioWebsite.replace(/^https?:\/\//, '')}
                </span>
                <ExternalLink size={12} style={{ color: 'var(--fh-t4)', flexShrink: 0 }} />
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)', textDecoration: 'none' }}
              >
                <Code2 size={15} style={{ color: '#9ca3af', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--fh-t1)', fontWeight: 510 }}>GitHub</span>
                <span style={{ fontSize: 12, color: 'var(--fh-t4)', flex: 1 }}>
                  {githubUrl.replace('https://github.com/', '@')}
                </span>
                <ExternalLink size={12} style={{ color: 'var(--fh-t4)', flexShrink: 0 }} />
              </a>
            )}
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)', textDecoration: 'none' }}
              >
                <Link2 size={15} style={{ color: '#0a66c2', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--fh-t1)', fontWeight: 510 }}>LinkedIn</span>
                <ExternalLink size={12} style={{ color: 'var(--fh-t4)', flexShrink: 0 }} />
              </a>
            )}
            {socialLinks.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)', textDecoration: 'none' }}
              >
                <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1 }}>{s.emoji}</span>
                <span style={{ fontSize: 13, color: 'var(--fh-t1)', fontWeight: 510 }}>{s.label}</span>
                <ExternalLink size={12} style={{ color: 'var(--fh-t4)', flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Resume / CV download ──────────────────────────────── */}
      {hasResume && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Resume / CV
          </p>
          <a
            href={resumeUrl!}
            target="_blank"
            rel="noopener noreferrer"
            download={resumeFilename || 'resume.pdf'}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              borderRadius: 10, background: 'var(--fh-surface-2)',
              border: '1px solid var(--fh-border)', textDecoration: 'none',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: '#ef444418',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FileText size={18} style={{ color: '#ef4444' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 590, color: 'var(--fh-t1)' }}>
                {resumeFilename || 'Resume.pdf'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--fh-t4)' }}>PDF document</p>
            </div>
            <Download size={15} style={{ color: 'var(--fh-t4)', flexShrink: 0 }} />
          </a>
        </div>
      )}

      {/* ── Attached documents ────────────────────────────────── */}
      {hasDocuments && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Documents & Certificates
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {documents.map(doc => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  borderRadius: 8, background: 'var(--fh-surface-2)',
                  border: '1px solid var(--fh-border)', textDecoration: 'none',
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1 }}>{DOC_TYPE_ICON[doc.doc_type] || '📎'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 510, color: 'var(--fh-t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.name}
                  </p>
                  <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--fh-t4)' }}>
                    {DOC_TYPE_LABEL[doc.doc_type]}
                    {doc.file_size ? ` · ${formatFileSize(doc.file_size)}` : ''}
                  </p>
                </div>
                <Download size={13} style={{ color: 'var(--fh-t4)', flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
