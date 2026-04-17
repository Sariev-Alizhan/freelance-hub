import Image from 'next/image'
import { FileText, Download } from 'lucide-react'
import type { Message } from './types'

export default function AttachmentBubble({ msg, isMine }: { msg: Message; isMine: boolean }) {
  if (!msg.attachment_url) return null

  if (msg.attachment_type === 'image') {
    return (
      <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="block mt-1">
        <Image
          src={msg.attachment_url}
          alt={msg.attachment_name || 'image'}
          width={220} height={160}
          className="rounded-2xl object-cover"
          style={{ maxHeight: 180, width: 'auto' }}
          unoptimized
        />
      </a>
    )
  }

  return (
    <a
      href={msg.attachment_url}
      target="_blank"
      rel="noopener noreferrer"
      download={msg.attachment_name}
      className="mt-1 flex items-center gap-2 px-3 py-2 rounded-2xl"
      style={{
        background: isMine ? 'rgba(255,255,255,0.15)' : 'var(--fh-surface-2)',
        maxWidth: 220,
        textDecoration: 'none',
      }}
    >
      <FileText className="h-4 w-4 flex-shrink-0" style={{ color: isMine ? '#fff' : 'var(--fh-t3)' }} />
      <span className="flex-1 min-w-0 truncate" style={{ fontSize: 12, color: isMine ? '#fff' : 'var(--fh-t2)', fontWeight: 510 }}>
        {msg.attachment_name || 'File'}
      </span>
      <Download className="h-3.5 w-3.5 flex-shrink-0" style={{ color: isMine ? 'rgba(255,255,255,0.6)' : 'var(--fh-t4)' }} />
    </a>
  )
}
