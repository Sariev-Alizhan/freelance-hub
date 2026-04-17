# StoryViewer TDZ

**Статус:** closed in [[Release 1.3.0]]

## Симптом

[[React Compiler]] флагал [[StoryViewer]]: `goNext`/`goPrev` использовались в `useEffect` (keyboard listener) до объявления. Параллельно — warning на [[React hooks purity]]: `useRef(Date.now())` + `Date.now()` в render body.

## Root cause

Два независимых класса проблем:
1. [[TDZ]] — `const goNext = useCallback(...)` стоял ниже `useEffect` который на него ссылался
2. Impure init — `Date.now()` в теле рендера даёт разное значение между рендерами

## Fix

1. Хойст `goNext`/`goPrev` как `useCallback` выше keyboard effect, добавить в deps
2. `useRef(0)` + `useState<number | null>(null)` + seed через `useEffect` на `story?.id`
