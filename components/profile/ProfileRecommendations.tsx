'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Quote, Plus, ChevronDown, Briefcase } from 'lucide-react'
import WriteRecommendationModal from './WriteRecommendationModal'

const RELATIONSHIP_LABEL: Record<string, string> = {
  client:    'Worked as client',
  colleague: 'Worked together',
  manager:   'Managed them',
  report:    'Reported to them',
  other:     'Worked together',
}

export interface Recommendation {
  id:            string
  author_id:     string
  author_title:  string | null
  relationship:  string
  body:          string
  created_at:    string
  author: {
    full_name:   string
    username:    string | null
    avatar_url:  string | null
    is_verified: boolean
  } | null
}

export default function ProfileRecommendations({
  recipientId, recipientName, recommendations, isOwnProfile, viewerLoggedIn,
}: {
  recipientId:     string
  recipientName:   string
  recommendations: Recommendation[]
  isOwnProfile:    boolean
  viewerLoggedIn:  boolean
}) {
  const [showModal, setShowModal] = useState(false)
  const [showAll, setShowAll]     = useState(false)

  if (recommendations.length === 0 && isOwnProfile) {
    return (
      <div style={{
        padding: 16, borderRadius: 12,
        background: 'var(--fh-surface)', border: '1px dashed var(--fh-border-2)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'var(--fh-primary-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Quote size={16} style={{ color: 'var(--fh-primary)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 590, color: 'var(--fh-t1)' }}>Ask for recommendations</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--fh-t4)' }}>
            LinkedIn-style testimonials weigh more than star ratings.
          </p>
        </div>
        <Link href="/dashboard/recommendations" style={{
          padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 590,
          background: 'var(--fh-surface-2)', color: 'var(--fh-t2)',
          border: '1px solid var(--fh-border)', textDecoration: 'none',
        }}>
          Manage
        </Link>
      </div>
    )
  }

  if (recommendations.length === 0 && !isOwnProfile) {
    if (!viewerLoggedIn) return null
    return (
      <div style={{
        padding: 16, borderRadius: 12,
        background: 'var(--fh-surface)', border: '1px dashed var(--fh-border-2)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Quote size={18} style={{ color: 'var(--fh-t4)', flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 13, color: 'var(--fh-t3)', flex: 1 }}>
          Worked with {recipientName}? Leave a recommendation.
        </p>
        <button onClick={() => setShowModal(true)}
          style={{
            padding: '7px 12px', borderRadius: 8, border: 'none',
            background: 'var(--fh-primary)', color: '#fff',
            fontSize: 12, fontWeight: 590, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
          <Plus size={12} /> Write
        </button>
        {showModal && (
          <WriteRecommendationModal
            recipientId={recipientId}
            recipientName={recipientName}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    )
  }

  const visible = showAll ? recommendations : recommendations.slice(0, 2)
  const hasMore = recommendations.length > 2 && !showAll

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)', margin: 0 }}>
          Recommendations
          <span style={{ fontSize: 11, color: 'var(--fh-t4)', marginLeft: 8, fontWeight: 500 }}>
            {recommendations.length}
          </span>
        </h2>
        {!isOwnProfile && viewerLoggedIn && (
          <button onClick={() => setShowModal(true)}
            style={{
              fontSize: 12, color: 'var(--fh-primary)',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0,
            }}>
            <Plus size={12} /> Write one
          </button>
        )}
        {isOwnProfile && (
          <Link href="/dashboard/recommendations" style={{
            fontSize: 12, color: 'var(--fh-primary)', textDecoration: 'none',
          }}>
            Manage
          </Link>
        )}
      </div>

      {visible.map(rec => (
        <RecommendationCard key={rec.id} rec={rec} />
      ))}

      {hasMore && (
        <button onClick={() => setShowAll(true)}
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid var(--fh-border)',
            background: 'var(--fh-surface)', color: 'var(--fh-t2)',
            fontSize: 12, fontWeight: 510, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}>
          Show all {recommendations.length} <ChevronDown size={12} />
        </button>
      )}

      {showModal && (
        <WriteRecommendationModal
          recipientId={recipientId}
          recipientName={recipientName}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const author = rec.author
  const name   = author?.full_name ?? 'A user'
  const avatar = author?.avatar_url

  return (
    <div style={{
      padding: 16, borderRadius: 12,
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        {avatar ? (
          <Image src={avatar} alt={name} width={40} height={40} unoptimized
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'var(--fh-primary-muted)', color: 'var(--fh-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700,
          }}>
            {name[0]?.toUpperCase()}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--fh-t1)' }}>
            {author?.username ? (
              <Link href={`/u/${author.username}`} style={{ color: 'var(--fh-t1)', textDecoration: 'none' }}>
                {name}
              </Link>
            ) : name}
          </p>
          {rec.author_title && (
            <p style={{ margin: '1px 0 0', fontSize: 12, color: 'var(--fh-t3)' }}>
              {rec.author_title}
            </p>
          )}
          <p style={{
            margin: '4px 0 0', fontSize: 11, color: 'var(--fh-t4)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <Briefcase size={10} />
            {RELATIONSHIP_LABEL[rec.relationship] ?? 'Worked together'}
          </p>
        </div>

        <Quote size={18} style={{ color: 'var(--fh-t4)', opacity: 0.4, flexShrink: 0 }} />
      </div>

      <p style={{
        margin: 0, fontSize: 13, color: 'var(--fh-t2)', lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
      }}>
        {rec.body}
      </p>
    </div>
  )
}
