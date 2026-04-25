import type { Category } from '@/lib/types'
import { CATEGORIES } from '@/lib/mock/categories'

/** Returns the localized label for a category, given a slug. Falls back to
 *  the English label, then to the raw slug if neither resolves. */
export function localizeCategory(
  slug: string | null | undefined,
  tc: Record<string, string>,
): string {
  if (!slug) return ''
  const cat = CATEGORIES.find(c => c.slug === slug)
  if (!cat) return slug
  if (cat.labelKey && tc[cat.labelKey]) return tc[cat.labelKey]
  return cat.label
}

/** Returns the same Category shape but with the `label` field swapped for the
 *  localized version. Convenient when components iterate over CATEGORIES and
 *  render `cat.label` — pass the result of this helper instead. */
export function localizedCategories(tc: Record<string, string>): Category[] {
  return CATEGORIES.map(c => ({
    ...c,
    label: c.labelKey && tc[c.labelKey] ? tc[c.labelKey] : c.label,
  }))
}
