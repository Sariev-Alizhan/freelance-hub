'use client'

const HINTS = [
  'Нужен React разработчик для сайта, бюджет 80К',
  'Ищу дизайнера для мобильного приложения',
  'Хочу настроить рекламу в ВКонтакте',
]

export default function AIHints() {
  function applyHint(hint: string) {
    const input = document.querySelector('input[placeholder="Опишите вашу задачу..."]') as HTMLInputElement
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      nativeInputValueSetter?.call(input, hint)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.focus()
    }
  }

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
      {HINTS.map((hint) => (
        <button
          key={hint}
          onClick={() => applyHint(hint)}
          className="text-left px-4 py-3 rounded-xl border border-subtle bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
        >
          {hint}
        </button>
      ))}
    </div>
  )
}
