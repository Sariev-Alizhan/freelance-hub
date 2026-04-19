'use client'
import { useCallback, useState } from 'react'
import { Search, RefreshCw, X } from 'lucide-react'
import { CURRENT_RELEASE } from '@/lib/company-report'
import { useProfile } from '@/lib/context/ProfileContext'
import { useLang } from '@/lib/context/LanguageContext'
import { useUser } from '@/lib/hooks/useUser'
import { useFeedData } from '@/lib/hooks/useFeedData'
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh'
import StoriesBar from '@/components/stories/StoriesBar'
import NewsCard from '@/components/feed/NewsCard'
import PostCard from '@/components/feed/PostCard'
import UpdateCard from '@/components/feed/UpdateCard'
import ReleaseCard from '@/components/feed/ReleaseCard'
import EditorCard from '@/components/feed/EditorCard'

export default function FeedPage() {
  const { user } = useUser()
  const { profile } = useProfile()
  const { t } = useLang()
  const tf = t.feedPage

  const [search, setSearch] = useState('')
  const [query,  setQuery]  = useState('')   // committed search

  const {
    loading, refreshing, load,
    handleReact, handleDeletePost,
    getR, feedItems,
  } = useFeedData({ user, query })

  const onRefresh = useCallback(() => load(true), [load])
  const { pullY, threshold } = usePullToRefresh({
    onRefresh,
    disabled: loading || refreshing,
  })

  return (
    <div>
      {pullY > 0 && (
        <div className="flex justify-center pt-2 pb-1 md:hidden" style={{ height: pullY, overflow: 'hidden', transition: 'height 0.1s' }}>
          <RefreshCw className="h-5 w-5 animate-spin" style={{ color: 'var(--fh-t4)', opacity: pullY / threshold }} />
        </div>
      )}
      {refreshing && (
        <div className="flex justify-center py-2 md:hidden">
          <RefreshCw className="h-5 w-5 animate-spin" style={{ color: 'var(--fh-primary)' }} />
        </div>
      )}

      {/* Desktop: constrained width */}
      <div className="hidden sm:block mx-auto max-w-[640px] px-4 sm:px-6">
        <div className="sticky z-20 pt-4 pb-3" style={{ top: 'var(--feed-sticky-top, 0px)', background: 'var(--fh-canvas)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
          <div className="flex items-center gap-2" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)', borderRadius: 24, padding: '10px 16px' }}>
            <Search className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--fh-t4)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') setQuery(search) }} placeholder={tf.searchDesktop} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--fh-t1)', fontFamily: 'inherit' }} />
            {search && <button onClick={() => { setSearch(''); setQuery('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', padding: 0 }}><X className="h-3.5 w-3.5" /></button>}
          </div>
        </div>
        {!query && <div style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)', borderRadius: 18, padding: '4px 12px', marginBottom: 12, overflow: 'hidden' }}><StoriesBar currentUserId={user?.id} /></div>}
        {loading ? <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl animate-pulse" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)', height: 140 }} />)}</div> : feedItems.length === 0 ? <div className="flex flex-col items-center justify-center py-20 gap-3 text-center"><Search className="h-8 w-8" style={{ color: 'var(--fh-t4)', opacity: 0.3 }} /><p style={{ fontSize: 14, color: 'var(--fh-t4)' }}>{tf.emptyFound}</p><button onClick={() => { setSearch(''); setQuery('') }} style={{ fontSize: 13, color: 'var(--fh-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>{tf.clear}</button></div> : <div className="space-y-3">{feedItems.map((item) => { if (item.kind === 'update') return <UpdateCard key="update" reactions={getR(`update-v${CURRENT_RELEASE.version}`)} onReact={handleReact} user={user} profile={profile} />; if (item.kind === 'release') return <ReleaseCard key={`rel-${item.data.version}`} release={item.data} reactions={getR(`rel-${item.data.version}`)} onReact={handleReact} user={user} profile={profile} />; if (item.kind === 'editor') return <EditorCard key={`ed-${item.data.id}`} post={item.data} reactions={getR(`ed-${item.data.id}`)} onReact={handleReact} user={user} profile={profile} />; if (item.kind === 'post') return <PostCard key={item.data.id} post={item.data} reactions={getR(item.data.id)} onReact={handleReact} user={user} profile={profile} onDelete={handleDeletePost} />; return <NewsCard key={item.data.id} item={item.data} reactions={getR(item.data.id)} onReact={handleReact} user={user} profile={profile} /> })}</div>}
        <div className="h-8" />
      </div>

      {/* Mobile: edge-to-edge Instagram layout */}
      <div className="sm:hidden">
        {!query && (
          <div style={{ borderBottom: '0.5px solid var(--fh-sep)', paddingBottom: 2 }}>
            <StoriesBar currentUserId={user?.id} />
          </div>
        )}

        {query && (
          <div style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--fh-sep)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--fh-surface-2)', borderRadius: 12, padding: '10px 14px' }}>
              <Search style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--fh-t4)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') setQuery(search) }} placeholder={tf.searchMobile} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15, color: 'var(--fh-t1)', fontFamily: 'inherit' }} autoFocus />
              <button onClick={() => { setSearch(''); setQuery('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', padding: 0 }}><X style={{ width: 16, height: 16 }} /></button>
            </div>
          </div>
        )}

        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ borderBottom: '0.5px solid var(--fh-sep)', padding: '16px', display: 'flex', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--fh-surface-2)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, borderRadius: 6, background: 'var(--fh-surface-2)', marginBottom: 8, width: '40%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 10, borderRadius: 5, background: 'var(--fh-surface-2)', width: '80%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : feedItems.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 12, textAlign: 'center' }}>
            <Search style={{ width: 32, height: 32, color: 'var(--fh-t4)', opacity: 0.3 }} />
            <p style={{ fontSize: 15, color: 'var(--fh-t4)' }}>{tf.emptyFound}</p>
            <button onClick={() => { setSearch(''); setQuery('') }} style={{ fontSize: 14, color: 'var(--fh-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>{tf.clearSearch}</button>
          </div>
        ) : (
          <div>
            {feedItems.map((item) => {
              if (item.kind === 'update')  return <UpdateCard  key="update" reactions={getR(`update-v${CURRENT_RELEASE.version}`)} onReact={handleReact} user={user} profile={profile} />
              if (item.kind === 'release') return <ReleaseCard key={`rel-${item.data.version}`} release={item.data} reactions={getR(`rel-${item.data.version}`)} onReact={handleReact} user={user} profile={profile} />
              if (item.kind === 'editor')  return <EditorCard  key={`ed-${item.data.id}`} post={item.data} reactions={getR(`ed-${item.data.id}`)} onReact={handleReact} user={user} profile={profile} />
              if (item.kind === 'post')    return <PostCard    key={item.data.id} post={item.data} reactions={getR(item.data.id)} onReact={handleReact} user={user} profile={profile} onDelete={handleDeletePost} />
              return <NewsCard key={item.data.id} item={item.data} reactions={getR(item.data.id)} onReact={handleReact} user={user} profile={profile} />
            })}
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
