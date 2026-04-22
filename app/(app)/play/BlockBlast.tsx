'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Trophy, RotateCcw, Zap, Star, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'

// ── Constants ──────────────────────────────────────────────────────────────
const GRID = 8
const CELL = 48
const COLORS = ['#27a644', '#22c55e', '#f59e0b', '#e5484d', '#06b6d4', '#e879f9', '#f97316']

type Grid = (string | null)[][]
type BlockShape = number[][]

interface Block {
  shape: BlockShape
  color: string
}

interface LeaderEntry {
  username: string
  score:    number
  level:    number
  created_at: string
}

// ── Block library ──────────────────────────────────────────────────────────
const SHAPES: BlockShape[] = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 1], [1, 0, 0]],
  [[0, 1], [1, 1]],
  [[1, 0], [1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0], [1, 0], [1, 1]],
  [[0, 1], [0, 1], [1, 1]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 1, 1], [0, 1, 0]],
]

function randomBlock(): Block {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  return { shape, color }
}

function emptyGrid(): Grid {
  return Array.from({ length: GRID }, () => Array(GRID).fill(null))
}

function canPlace(grid: Grid, block: Block, row: number, col: number): boolean {
  for (let r = 0; r < block.shape.length; r++) {
    for (let c = 0; c < block.shape[r].length; c++) {
      if (!block.shape[r][c]) continue
      const nr = row + r, nc = col + c
      if (nr < 0 || nr >= GRID || nc < 0 || nc >= GRID || grid[nr][nc]) return false
    }
  }
  return true
}

function placeBlock(grid: Grid, block: Block, row: number, col: number): Grid {
  const ng = grid.map(r => [...r])
  for (let r = 0; r < block.shape.length; r++)
    for (let c = 0; c < block.shape[r].length; c++)
      if (block.shape[r][c]) ng[row + r][col + c] = block.color
  return ng
}

function clearLines(grid: Grid): { grid: Grid; cleared: number } {
  const ng = grid.map(r => [...r])
  let cleared = 0

  // Full rows
  const fullRows = ng.map((r, i) => r.every(c => c !== null) ? i : -1).filter(i => i >= 0)
  fullRows.forEach(ri => { ng[ri] = Array(GRID).fill(null); cleared++ })

  // Full cols
  const fullCols: number[] = []
  for (let c = 0; c < GRID; c++) {
    if (ng.every(r => r[c] !== null)) fullCols.push(c)
  }
  fullCols.forEach(ci => { ng.forEach(r => r[ci] = null); cleared++ })

  return { grid: ng, cleared }
}

function hasAnyMove(grid: Grid, tray: (Block | null)[]): boolean {
  return tray.some(block => {
    if (!block) return false
    for (let r = 0; r <= GRID - block.shape.length; r++)
      for (let c = 0; c <= GRID - block.shape[0].length; c++)
        if (canPlace(grid, block, r, c)) return true
    return false
  })
}

// ── Component ──────────────────────────────────────────────────────────────
export default function BlockBlast() {
  const { user } = useUser()
  const [grid,     setGrid]     = useState<Grid>(emptyGrid())
  const [tray,     setTray]     = useState<(Block | null)[]>([randomBlock(), randomBlock(), randomBlock()])
  const [selected, setSelected] = useState<number | null>(null)
  const [score,    setScore]    = useState(0)
  const [level,    setLevel]    = useState(1)
  const [combo,    setCombo]    = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [hover,    setHover]    = useState<{ r: number; c: number } | null>(null)
  const [flash,    setFlash]    = useState<Set<string>>(new Set())
  const [leaders,  setLeaders]  = useState<LeaderEntry[]>([])
  const [tab,      setTab]      = useState<'game' | 'board'>('game')
  const [saving,   setSaving]   = useState(false)
  const scoreSaved = useRef(false)

  // Load leaderboard
  useEffect(() => {
    const db = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(db as any).from('game_scores')
      .select('username, score, level, created_at')
      .order('score', { ascending: false })
      .limit(20)
      .then(({ data }: { data: LeaderEntry[] | null }) => { if (data) setLeaders(data) })
  }, [gameOver])

  const scorePoints = useCallback((cleared: number, comboVal: number) => {
    if (cleared === 0) return 0
    const base = cleared * 100 * level
    const multi = cleared >= 2 ? cleared * 1.5 : 1
    const comboBonus = comboVal > 0 ? comboVal * 50 : 0
    return Math.round(base * multi + comboBonus)
  }, [level])

  // Refill tray if all used
  const refillIfNeeded = useCallback((t: (Block | null)[]) => {
    if (t.every(b => b === null)) return [randomBlock(), randomBlock(), randomBlock()]
    return t
  }, [])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (selected === null || !tray[selected] || gameOver) return
    const block = tray[selected]!
    if (!canPlace(grid, block, row, col)) return

    let ng = placeBlock(grid, block, row, col)
    const { grid: cleared, cleared: cnt } = clearLines(ng)
    ng = cleared

    const newCombo = cnt > 0 ? combo + 1 : 0
    const pts = scorePoints(cnt, newCombo)
    const newScore = score + pts
    const newLevel = Math.floor(newScore / 2000) + 1

    setGrid(ng)
    setScore(newScore)
    setLevel(newLevel)
    setCombo(newCombo)

    if (cnt > 0) {
      // Flash cleared cells
      const flashSet = new Set<string>()
      ng.forEach((r, ri) => r.forEach((_, ci) => {
        if (grid[ri][ci] && !ng[ri][ci]) flashSet.add(`${ri}-${ci}`)
      }))
      setFlash(flashSet)
      setTimeout(() => setFlash(new Set()), 300)
    }

    const newTray = refillIfNeeded(tray.map((b, i) => i === selected ? null : b))
    setTray(newTray)
    setSelected(null)

    if (!hasAnyMove(ng, newTray)) setGameOver(true)
  }, [selected, tray, grid, gameOver, combo, score, level, scorePoints, refillIfNeeded])

  // Save score on game over
  useEffect(() => {
    if (!gameOver || !user || scoreSaved.current || score === 0) return
    scoreSaved.current = true
    setSaving(true)
    const db = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(db as any).from('game_scores')
      .insert({ user_id: user.id, username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player', score, level })
      .then(() => setSaving(false))
      .catch(() => setSaving(false))
  }, [gameOver, user, score, level])

  function restart() {
    setGrid(emptyGrid())
    setTray([randomBlock(), randomBlock(), randomBlock()])
    setSelected(null)
    setScore(0)
    setLevel(1)
    setCombo(0)
    setGameOver(false)
    scoreSaved.current = false
  }

  // Preview: highlight cells where selected block would land
  const previewCells = new Set<string>()
  if (selected !== null && tray[selected] && hover) {
    const block = tray[selected]!
    const { r, c } = hover
    if (canPlace(grid, block, r, c)) {
      block.shape.forEach((row, ri) => {
        row.forEach((cell, ci) => {
          if (cell) previewCells.add(`${r + ri}-${c + ci}`)
        })
      })
    }
  }

  const maxScore = leaders[0]?.score || 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fh-surface)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Zap size={20} style={{ color: '#27a644' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#27a644', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              FreelanceHub Play
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--fh-t1)', letterSpacing: '-0.04em', margin: '0 0 4px' }}>
            Block Blast
          </h1>
          <p style={{ fontSize: 13, color: 'var(--fh-t4)', margin: 0 }}>
            Fill rows & columns to clear them. Compete with other freelancers.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: 4, borderRadius: 12, background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)' }}>
          {[{ id: 'game', label: '🎮 Play' }, { id: 'board', label: '🏆 Leaderboard' }].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as 'game' | 'board')}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: tab === t.id ? '#27a644' : 'transparent',
                color: tab === t.id ? '#fff' : 'var(--fh-t3)',
                fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'game' ? (
          <>
            {/* Stats bar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Score', value: score.toLocaleString(), color: '#27a644' },
                { label: 'Level', value: level, color: '#f59e0b' },
                { label: 'Combo', value: combo > 0 ? `×${combo}` : '—', color: '#22c55e' },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '10px 8px', borderRadius: 10, background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--fh-t4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Game grid */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID}, ${CELL}px)`,
                gap: 2,
                padding: 8,
                borderRadius: 14,
                background: 'var(--fh-surface-2)',
                border: '1px solid var(--fh-border)',
                width: 'fit-content',
                margin: '0 auto',
              }}>
                {grid.map((row, ri) =>
                  row.map((cell, ci) => {
                    const key = `${ri}-${ci}`
                    const isPreview = previewCells.has(key)
                    const isFlash = flash.has(key)
                    const canDrop = selected !== null && tray[selected] && isPreview

                    return (
                      <div
                        key={key}
                        onClick={() => handleCellClick(ri, ci)}
                        onMouseEnter={() => setHover({ r: ri, c: ci })}
                        onMouseLeave={() => setHover(null)}
                        style={{
                          width: CELL, height: CELL, borderRadius: 6, cursor: selected !== null ? 'pointer' : 'default',
                          background: isFlash ? '#fff'
                            : cell ? cell
                            : isPreview && canDrop ? (tray[selected!]?.color + '60') : 'var(--fh-surface)',
                          border: isPreview && canDrop ? `2px solid ${tray[selected!]?.color}` : '1px solid var(--fh-border)',
                          transition: 'all 0.1s',
                          transform: isFlash ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: cell ? `inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 3px rgba(0,0,0,0.2)` : undefined,
                        }}
                      />
                    )
                  })
                )}
              </div>

              {/* Game Over overlay */}
              {gameOver && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 14, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 12,
                  background: 'rgba(8,9,10,0.88)', backdropFilter: 'blur(4px)',
                }}>
                  <div style={{ fontSize: 36 }}>💀</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Game Over</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#27a644' }}>{score.toLocaleString()}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                    {saving ? 'Saving score…' : score > maxScore ? '🏆 New record!' : `Best: ${maxScore.toLocaleString()}`}
                  </div>
                  <button
                    onClick={restart}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px',
                      borderRadius: 10, border: 'none', background: '#27a644', color: '#fff',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={14} /> Play again
                  </button>
                </div>
              )}
            </div>

            {/* Block tray */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
              {tray.map((block, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(block ? (selected === i ? null : i) : null)}
                  disabled={!block}
                  style={{
                    padding: '12px', borderRadius: 12, cursor: block ? 'pointer' : 'default',
                    background: selected === i ? 'rgba(39,166,68,0.12)' : 'var(--fh-surface-2)',
                    border: selected === i ? '2px solid #27a644' : '1px solid var(--fh-border)',
                    opacity: block ? 1 : 0.3, transition: 'all 0.15s', minWidth: 80, minHeight: 80,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {block && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${block.shape[0].length}, 16px)`,
                      gap: 2,
                    }}>
                      {block.shape.flatMap((row, ri) =>
                        row.map((cell, ci) => (
                          <div key={`${ri}-${ci}`} style={{
                            width: 16, height: 16, borderRadius: 3,
                            background: cell ? block.color : 'transparent',
                            boxShadow: cell ? `inset 0 1px 0 rgba(255,255,255,0.25)` : undefined,
                          }} />
                        ))
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--fh-t4)', marginBottom: 8 }}>
              {selected !== null ? '👆 Click a cell on the grid to place the block' : '👆 Select a block from the tray above'}
            </p>

            <button
              onClick={restart}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '10px', borderRadius: 10, border: '1px solid var(--fh-border)',
                background: 'var(--fh-surface-2)', color: 'var(--fh-t3)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} /> Restart
            </button>
          </>
        ) : (
          /* Leaderboard */
          <div style={{ borderRadius: 16, border: '1px solid var(--fh-border)', overflow: 'hidden', background: 'var(--fh-surface)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--fh-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={16} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fh-t1)' }}>Top Players</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--fh-t4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={12} /> {leaders.length} players
              </span>
            </div>
            {leaders.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--fh-t4)', fontSize: 13 }}>
                No scores yet. Be the first to play!
              </div>
            ) : leaders.map((entry, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                borderBottom: i < leaders.length - 1 ? '1px solid var(--fh-sep)' : undefined,
                background: i === 0 ? 'rgba(245,158,11,0.05)' : i === 1 ? 'rgba(148,163,184,0.04)' : i === 2 ? 'rgba(180,120,60,0.04)' : undefined,
              }}>
                <div style={{ width: 28, textAlign: 'center', fontSize: 16, fontWeight: 800 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span style={{ color: 'var(--fh-t4)', fontSize: 13 }}>#{i + 1}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fh-t1)' }}>{entry.username}</div>
                  <div style={{ fontSize: 11, color: 'var(--fh-t4)' }}>Level {entry.level}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={12} style={{ color: '#27a644' }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#27a644', letterSpacing: '-0.03em' }}>
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
