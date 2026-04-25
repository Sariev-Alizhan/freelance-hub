// Resolve an order's `deadline` field to a localized label.
// New orders store one of: 'urgent' | 'week' | 'twoWeeks' | 'month' | 'long' | 'discuss'.
// Legacy orders (created before v15-i18n) store free text like 'Urgent (1-2 days)' —
// for those we pass the raw value through unchanged.
const SLUG_TO_KEY: Record<string, 'dlUrgentLabel' | 'dlWeekLabel' | 'dlTwoWeeksLabel' | 'dlMonthLabel' | 'dlLongLabel' | 'dlDiscussLabel'> = {
  urgent:   'dlUrgentLabel',
  week:     'dlWeekLabel',
  twoWeeks: 'dlTwoWeeksLabel',
  month:    'dlMonthLabel',
  long:     'dlLongLabel',
  discuss:  'dlDiscussLabel',
}

export function localizeDeadline(
  value: string | null | undefined,
  tc: Record<string, string>,
  fallback = '',
): string {
  if (!value) return fallback
  const key = SLUG_TO_KEY[value]
  return key ? tc[key] : value
}
