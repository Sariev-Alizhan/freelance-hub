// Tiny pluralization helper. We avoid pulling in Intl.PluralRules to keep
// bundles small and behavior predictable across the 3 langs we ship.
//
// Russian rules:
//   1, 21, 31, 101… → one
//   2-4, 22-24…     → few
//   0, 5-20, 25-30… → many
// English: 1 → one, else many.
// Kazakh: noun typically doesn't inflect with numerals — return many.
export function plural(
  lang: string,
  n: number,
  forms: { one: string; few: string; many: string },
): string {
  if (lang === 'ru') {
    const mod10 = n % 10
    const mod100 = n % 100
    if (mod10 === 1 && mod100 !== 11) return forms.one
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms.few
    return forms.many
  }
  if (lang === 'en') return n === 1 ? forms.one : forms.many
  return forms.many
}
