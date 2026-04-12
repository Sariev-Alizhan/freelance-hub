/**
 * Replaces hardcoded dark-mode-only Tailwind opacity classes
 * with adaptive CSS utility classes that work in both light and dark mode.
 */
const fs = require('fs')
const path = require('path')

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'scripts') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(full))
    else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) files.push(full)
  }
  return files
}

// Order matters — more specific patterns first
const REPLACEMENTS = [
  // Hover backgrounds
  ['hover:bg-white/10', 'hover:bg-surface'],
  ['hover:bg-white/8',  'hover:bg-surface'],
  ['hover:bg-white/5',  'hover:bg-subtle'],
  ['hover:bg-white/4',  'hover:bg-subtle'],
  ['hover:bg-white/3',  'hover:bg-subtle'],
  // Static backgrounds
  ['bg-white/10', 'bg-surface'],
  ['bg-white/8',  'bg-surface'],
  ['bg-white/6',  'bg-subtle'],
  ['bg-white/5',  'bg-subtle'],
  ['bg-white/4',  'bg-subtle'],
  ['bg-white/3',  'bg-subtle'],
  // Borders
  ['border-white/12', 'border-subtle'],
  ['border-white/10', 'border-subtle'],
  ['border-white/8',  'border-subtle'],
  ['border-white/5',  'border-subtle'],
  // background/80 for header blur
  ['bg-background/80', 'bg-background/80'],   // keep — works in both modes
]

// Skip replacements in files that have gradient/colored backgrounds where white overlays are intentional
const SKIP_PATTERNS = [
  // Don't replace in landing sections that have specific gradient backgrounds
]

const root = path.join(__dirname, '..')
const files = walk(root)
let totalChanges = 0

for (const file of files) {
  // Skip globals.css and the script itself
  if (file.endsWith('.css') || file.includes('scripts')) continue

  let content = fs.readFileSync(file, 'utf8')
  let changed = false

  for (const [from, to] of REPLACEMENTS) {
    if (from === to) continue
    if (content.includes(from)) {
      content = content.split(from).join(to)
      changed = true
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8')
    console.log('✓', path.relative(root, file))
    totalChanges++
  }
}

console.log(`\nDone — updated ${totalChanges} files`)
