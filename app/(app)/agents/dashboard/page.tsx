'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Bot, DollarSign, TrendingUp, CheckCircle, Clock,
  XCircle, Plus, Loader2, Send, Settings, ExternalLink,
  Trash2, Eye, EyeOff,
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useToastHelpers } from '@/lib/context/ToastContext'

interface Balance {
  balance: number
  held: number
  total_earned: number
}

interface Transaction {
  id: string
  type: string
  amount: number
  note: string | null
  created_at: string
}

interface CustomAgent {
  id: string
  name: string
  tagline: string
  category: string
  price_per_task: number
  tasks_completed: number
  is_published: boolean
  created_at: string
}

interface TelegramSettings {
  bot_token: string | null
  channel_id: string | null
  is_active: boolean
}

const TX_LABEL: Record<string, { label: string; color: string; sign: string }> = {
  topup:  { label: 'Пополнение',  color: '#10b981', sign: '+' },
  payout: { label: 'Выплата',     color: '#10b981', sign: '+' },
  refund: { label: 'Возврат',     color: '#3b82f6', sign: '+' },
  hold:   { label: 'Заморожено',  color: '#f59e0b', sign: '-' },
  fee:    { label: 'Комиссия',    color: '#e5484d', sign: '-' },
}

function cents(n: number) { return `$${(n / 100).toFixed(2)}` }

export default function CreatorDashboard() {
  const { user, loading: userLoading } = useUser()
  const { success, error: toastError } = useToastHelpers()

  const [balance, setBalance]       = useState<Balance | null>(null)
  const [transactions, setTx]       = useState<Transaction[]>([])
  const [myAgents, setMyAgents]     = useState<CustomAgent[]>([])
  const [tg, setTg]                 = useState<TelegramSettings>({ bot_token: '', channel_id: '', is_active: false })
  const [loading, setLoading]       = useState(true)
  const [topUpLoading, setTopUp]    = useState(false)
  const [tgSaving, setTgSaving]     = useState(false)
  const [tgTesting, setTgTesting]   = useState(false)
  const [showToken, setShowToken]   = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    const [balRes, agentsRes, tgRes] = await Promise.all([
      fetch('/api/agents/balance'),
      fetch('/api/agents/builder'),
      fetch('/api/agents/telegram'),
    ])
    const [balData, agentsData, tgData] = await Promise.all([
      balRes.json(), agentsRes.json(), tgRes.json(),
    ])
    setBalance(balData.balance ?? null)
    setTx(balData.transactions ?? [])
    setMyAgents(agentsData.agents ?? [])
    if (tgData.settings) setTg(tgData.settings)
    setLoading(false)
  }, [])

  useEffect(() => { if (user) loadAll() }, [user, loadAll])

  async function handleTopUp() {
    setTopUp(true)
    const res = await fetch('/api/agents/balance', { method: 'POST' })
    if (res.ok) { success('Баланс пополнен!', '+$50 demo кредитов'); loadAll() }
    else toastError('Ошибка', 'Не удалось пополнить баланс')
    setTopUp(false)
  }

  async function handleTgSave() {
    setTgSaving(true)
    const res = await fetch('/api/agents/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tg),
    })
    if (res.ok) success('Сохранено', 'Telegram настройки обновлены')
    else toastError('Ошибка', 'Не удалось сохранить')
    setTgSaving(false)
  }

  async function handleTgTest() {
    setTgTesting(true)
    const res = await fetch('/api/agents/telegram', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot_token: tg.bot_token, channel_id: tg.channel_id }),
    })
    const data = await res.json()
    if (res.ok) success('Успешно!', 'Тестовое сообщение отправлено в канал')
    else toastError('Ошибка', data.error ?? 'Проверьте токен и ID канала')
    setTgTesting(false)
  }

  async function handleDeleteAgent(agentId: string) {
    setDeletingId(agentId)
    const res = await fetch('/api/agents/builder', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: agentId }),
    })
    if (res.ok) { success('Удалено', 'Агент удалён'); setMyAgents(p => p.filter(a => a.id !== agentId)) }
    else toastError('Ошибка', 'Не удалось удалить')
    setDeletingId(null)
  }

  async function togglePublish(agent: CustomAgent) {
    await fetch('/api/agents/builder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: agent.id, is_published: !agent.is_published }),
    })
    setMyAgents(p => p.map(a => a.id === agent.id ? { ...a, is_published: !a.is_published } : a))
  }

  if (userLoading || (loading && user)) {
    return <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  }

  if (!user) {
    return <div className="page-shell page-shell--narrow text-center">
      <Bot className="h-12 w-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--fh-t4)' }} />
      <p className="text-lg font-semibold mb-4">Войдите чтобы открыть Creator Portal</p>
      <Link href="/auth/login" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">Войти</Link>
    </div>
  }

  return (
    <div className="page-shell page-shell--reading space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>Creator Portal</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--fh-t4)' }}>Управляйте агентами, доходом и публикациями</p>
        </div>
        <Link href="/agents/builder"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Создать агента
        </Link>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Баланс', value: cents(balance?.balance ?? 0), color: '#7170ff', icon: <DollarSign className="h-5 w-5" /> },
          { label: 'Всего заработано', value: cents(balance?.total_earned ?? 0), color: '#10b981', icon: <TrendingUp className="h-5 w-5" /> },
          { label: 'Заморожено', value: cents(balance?.held ?? 0), color: '#f59e0b', icon: <Clock className="h-5 w-5" /> },
        ].map(card => (
          <div key={card.label} className="rounded-2xl p-5" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: `${card.color}14`, color: card.color }}>
                {card.icon}
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--fh-t4)' }}>{card.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: card.color, letterSpacing: '-0.03em' }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Top-up button */}
      <div className="flex justify-end">
        <button onClick={handleTopUp} disabled={topUpLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
          style={{ background: 'rgba(113,112,255,0.1)', color: '#7170ff', border: '1px solid rgba(113,112,255,0.2)' }}>
          {topUpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
          Demo пополнение +$50
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My agents */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: 'var(--fh-t1)' }}>Мои агенты</h2>
            <Link href="/agents/builder" className="text-xs font-medium" style={{ color: '#7170ff' }}>
              + Создать
            </Link>
          </div>
          {myAgents.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--fh-t4)' }} />
              <p className="text-sm mb-3" style={{ color: 'var(--fh-t4)' }}>Агентов пока нет</p>
              <Link href="/agents/builder"
                className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                style={{ background: 'rgba(113,112,255,0.1)', color: '#7170ff' }}>
                Создать первого агента
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myAgents.map(agent => (
                <div key={agent.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)' }}>
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(113,112,255,0.1)' }}>
                    <Bot className="h-4 w-4" style={{ color: '#7170ff' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--fh-t1)' }}>{agent.name}</p>
                    <p className="text-xs" style={{ color: 'var(--fh-t4)' }}>
                      {agent.tasks_completed} задач · {agent.price_per_task?.toLocaleString() ?? 0} ₸/задача
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => togglePublish(agent)} title={agent.is_published ? 'Скрыть' : 'Опубликовать'}
                      className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                      style={{ color: agent.is_published ? '#10b981' : 'var(--fh-t4)' }}>
                      {agent.is_published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <Link href={`/agents/custom_${agent.id}`} title="Открыть"
                      className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                      style={{ color: 'var(--fh-t4)' }}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <button onClick={() => handleDeleteAgent(agent.id)} disabled={deletingId === agent.id}
                      className="p-1.5 rounded-lg transition-colors hover:opacity-70 disabled:opacity-30"
                      style={{ color: '#e5484d' }}>
                      {deletingId === agent.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
          <h2 className="font-bold mb-4" style={{ color: 'var(--fh-t1)' }}>Транзакции</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--fh-t4)' }} />
              <p className="text-sm" style={{ color: 'var(--fh-t4)' }}>Транзакций пока нет</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map(tx => {
                const cfg = TX_LABEL[tx.type] ?? { label: tx.type, color: 'var(--fh-t3)', sign: '' }
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-subtle last:border-0">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${cfg.color}14`, color: cfg.color }}>
                      {tx.type === 'payout' || tx.type === 'topup' || tx.type === 'refund'
                        ? <CheckCircle className="h-4 w-4" />
                        : <XCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: 'var(--fh-t2)' }}>{cfg.label}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--fh-t4)' }}>{tx.note}</p>
                    </div>
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: cfg.color }}>
                      {cfg.sign}{cents(Math.abs(tx.amount))}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Telegram settings */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
        <div className="flex items-center gap-2 mb-5">
          <Send className="h-5 w-5" style={{ color: '#2AABEE' }} />
          <h2 className="font-bold" style={{ color: 'var(--fh-t1)' }}>Telegram публикация</h2>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
            style={{ background: tg.is_active ? 'rgba(16,185,129,0.1)' : 'var(--fh-surface-2)', color: tg.is_active ? '#10b981' : 'var(--fh-t4)', border: `1px solid ${tg.is_active ? 'rgba(16,185,129,0.2)' : 'var(--fh-border)'}` }}>
            {tg.is_active ? 'Активно' : 'Не активно'}
          </span>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--fh-t3)' }}>
          При одобрении SMM задачи — посты автоматически публикуются в ваш Telegram канал.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fh-t3)' }}>Bot Token</label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={tg.bot_token ?? ''}
                onChange={e => setTg(t => ({ ...t, bot_token: e.target.value }))}
                placeholder="1234567890:AAF..."
                className="w-full px-3 py-2.5 pr-9 rounded-xl text-sm bg-background border border-subtle focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button onClick={() => setShowToken(s => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5"
                style={{ color: 'var(--fh-t4)' }}>
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--fh-t4)' }}>
              Создайте бота через <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="underline">@BotFather</a>
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fh-t3)' }}>Channel ID</label>
            <input
              value={tg.channel_id ?? ''}
              onChange={e => setTg(t => ({ ...t, channel_id: e.target.value }))}
              placeholder="@mychannel или -100123456789"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-subtle focus:outline-none focus:border-primary/50 transition-colors"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--fh-t4)' }}>
              Добавьте бота как администратора канала
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={tg.is_active} onChange={e => setTg(t => ({ ...t, is_active: e.target.checked }))}
              className="accent-primary w-4 h-4" />
            <span className="text-sm" style={{ color: 'var(--fh-t2)' }}>Автопубликация активна</span>
          </label>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={handleTgTest} disabled={tgTesting || !tg.bot_token || !tg.channel_id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
              style={{ background: 'var(--fh-surface-2)', color: 'var(--fh-t2)', border: '1px solid var(--fh-border)' }}>
              {tgTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
              Тест
            </button>
            <button onClick={handleTgSave} disabled={tgSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 bg-primary text-white hover:bg-primary/90">
              {tgSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
