#!/usr/bin/env node
/**
 * Generates PNG icons for the PWA using only Node.js built-ins.
 * Creates solid indigo (#5e6ad2 = rgb(94, 106, 210)) squares.
 * PNG format: Signature + IHDR + IDAT + IEND
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── PNG helpers ──────────────────────────────────────────────────────────────

function crc32(buf) {
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcBuf   = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

function makePNG(width, height, r, g, b) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: width, height, bit-depth=8, color-type=2 (RGB), compression=0, filter=0, interlace=0
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(width,  0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8]  = 8; // bit depth
  ihdr[9]  = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Raw image data: each scanline starts with a filter byte (0 = None)
  // then width * 3 bytes of RGB
  const scanline = Buffer.allocUnsafe(1 + width * 3);
  scanline[0] = 0; // filter None
  for (let x = 0; x < width; x++) {
    scanline[1 + x * 3]     = r;
    scanline[1 + x * 3 + 1] = g;
    scanline[1 + x * 3 + 2] = b;
  }
  const rawParts = [];
  for (let y = 0; y < height; y++) rawParts.push(scanline);
  const raw = Buffer.concat(rawParts);

  const compressed = zlib.deflateSync(raw, { level: 9 });

  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, chunk('IHDR', ihdr), idat, iend]);
}

// ── Generate icons ────────────────────────────────────────────────────────────

const OUT = path.join(__dirname, '..', 'public');
const R = 94, G = 106, B = 210; // #5e6ad2 indigo

const icons = [
  { file: 'icon-192.png',       size: 192 },
  { file: 'icon-512.png',       size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

for (const { file, size } of icons) {
  const dest = path.join(OUT, file);
  const buf  = makePNG(size, size, R, G, B);
  fs.writeFileSync(dest, buf);
  const stat = fs.statSync(dest);
  console.log(`✓ ${file}  (${size}×${size})  ${stat.size} bytes`);
}

console.log('\nDone. All icons written to public/');
