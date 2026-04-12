'use client'
import { useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileText, Sparkles, Copy, Download, Check, Loader2, ChevronDown } from 'lucide-react'

const PAYMENT_OPTIONS = [
  { value: 'Предоплата 100% до начала работ', label: '100% предоплата' },
  { value: 'Постоплата 100% после сдачи работ', label: '100% постоплата' },
  { value: '50% предоплата, 50% после сдачи', label: '50/50' },
  { value: 'Поэтапная оплата по актам выполненных работ', label: 'Поэтапно' },
]

const IP_OPTIONS = [
  { value: 'Исключительные права на результат полностью передаются Заказчику с момента оплаты', label: 'Полная передача Заказчику' },
  { value: 'Заказчику передаётся простая (неисключительная) лицензия на использование результата', label: 'Лицензия Заказчику' },
  { value: 'Исключительные права остаются у Исполнителя; Заказчик получает право использования', label: 'Остаются у Исполнителя' },
]

export default function ContractClient() {
  const params = useSearchParams()

  const [form, setForm] = useState({
    clientName:      '',
    freelancerName:  '',
    workDescription: params.get('description') ?? '',
    deadline:        params.get('deadline')    ?? '',
    amount:          params.get('budget')      ?? '',
    paymentOrder:    PAYMENT_OPTIONS[0].value,
    ipRights:        IP_OPTIONS[0].value,
    city:            'Москва',
  })

  const [contract,  setContract]  = useState('')
  const [loading,   setLoading]   = useState(false)
  const [copied,    setCopied]    = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const generate = useCallback(async () => {
    if (!form.workDescription.trim()) return
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setContract('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/generate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: ctrl.signal,
      })

      if (!res.ok || !res.body) throw new Error('error')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: d } = await reader.read()
        done = d
        if (value) setContract((prev) => prev + decoder.decode(value, { stream: !d }))
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setContract('Не удалось сгенерировать договор. Попробуй ещё раз.')
      }
    } finally {
      setLoading(false)
    }
  }, [form])

  const copy = () => {
    navigator.clipboard.writeText(contract)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const blob = new Blob([contract], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'contract-freelancehub.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-subtle border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Form ── */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-subtle bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Стороны договора</h2>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Заказчик (ФИО или название)</label>
            <input className={inputCls} placeholder="ИП Иванов Иван Иванович" value={form.clientName} onChange={set('clientName')} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Исполнитель (ФИО фрилансера)</label>
            <input className={inputCls} placeholder="Петров Пётр Петрович" value={form.freelancerName} onChange={set('freelancerName')} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Город составления</label>
            <input className={inputCls} placeholder="Москва" value={form.city} onChange={set('city')} />
          </div>
        </div>

        <div className="rounded-2xl border border-subtle bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Условия работы</h2>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Описание работ <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`${inputCls} min-h-[110px] resize-none`}
              placeholder="Разработка лендинга на Next.js с интеграцией платёжной системы…"
              value={form.workDescription}
              onChange={set('workDescription')}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Срок выполнения</label>
              <input className={inputCls} placeholder="14 дней" value={form.deadline} onChange={set('deadline')} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Сумма (₽)</label>
              <input className={inputCls} type="number" placeholder="50000" value={form.amount} onChange={set('amount')} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Порядок оплаты</label>
            <div className="relative">
              <select className={`${inputCls} appearance-none pr-8`} value={form.paymentOrder} onChange={set('paymentOrder')}>
                {PAYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Права на результат (ИС)</label>
            <div className="relative">
              <select className={`${inputCls} appearance-none pr-8`} value={form.ipRights} onChange={set('ipRights')}>
                {IP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !form.workDescription.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Генерирую договор…</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Сгенерировать договор</>
          )}
        </button>
      </div>

      {/* ── Result ── */}
      <div className="rounded-2xl border border-subtle bg-card flex flex-col min-h-[500px]">
        {contract ? (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-subtle">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                Договор готов
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-subtle bg-subtle hover:bg-surface text-xs font-medium transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Скопировано' : 'Копировать'}
                </button>
                <button
                  onClick={download}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Скачать .txt
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-y-auto p-5 text-xs leading-relaxed text-foreground font-mono whitespace-pre-wrap">
              {contract}
            </pre>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold mb-1">Договор появится здесь</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Заполни описание работ и нажми «Сгенерировать» — AI напишет полный ГПХ-договор за несколько секунд
              </p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                Генерирую…
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
