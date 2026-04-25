// Regenerate the full icon family from the new editorial brutalist mark.
// Source of truth: the 48×48 ink square from public/logo-full.svg.
// Run: node scripts/gen-icons.mjs

import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const ROOT = resolve(import.meta.dirname, '..')

// Master icon SVG — same proportions as logo-full.svg's left square,
// scaled to a clean 512 viewBox so sharp can render any size crisply.
const MASTER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 48 48">
  <rect width="48" height="48" fill="#0A0A08"/>
  <rect x="10.5" y="9" width="6.75" height="30" fill="#F4F0E8"/>
  <rect x="10.5" y="9" width="25.5" height="6.75" fill="#F4F0E8"/>
  <rect x="10.5" y="21.75" width="18" height="6.75" fill="#F4F0E8"/>
  <rect x="30" y="21.75" width="6.75" height="6.75" fill="#27A644"/>
</svg>`

const PNG_TARGETS = [
  { size: 180, out: 'public/apple-touch-icon.png' },
  { size: 192, out: 'public/icon-192.png' },
  { size: 512, out: 'public/icon-512.png' },
  { size: 512, out: 'public/logo-icon.png' },
]

const ICO_SIZES = [16, 32, 48]
const ICO_OUT = 'app/favicon.ico'

const SVG_TARGETS = [
  'public/logo-icon.svg',
  'public/icon.svg',
]

async function renderPng(size) {
  return sharp(Buffer.from(MASTER_SVG))
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

async function main() {
  for (const { size, out } of PNG_TARGETS) {
    const buf = await renderPng(size)
    await writeFile(resolve(ROOT, out), buf)
    console.log(`wrote ${out} (${size}×${size}, ${buf.length}B)`)
  }

  const icoBuffers = await Promise.all(ICO_SIZES.map(renderPng))
  const icoBuf = await pngToIco(icoBuffers)
  await writeFile(resolve(ROOT, ICO_OUT), icoBuf)
  console.log(`wrote ${ICO_OUT} (${ICO_SIZES.join('/')}, ${icoBuf.length}B)`)

  for (const out of SVG_TARGETS) {
    await writeFile(resolve(ROOT, out), MASTER_SVG + '\n')
    console.log(`wrote ${out}`)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
