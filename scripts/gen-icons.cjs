// Generates simple flat PWA icons (no external image deps available).
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function makeIcon(size) {
  const bg = hexToRgb('#0b0e1a');
  const ring = hexToRgb('#7c3aed');
  const glow = hexToRgb('#22d3ee');
  const cx = size / 2;
  const cy = size / 2;
  const rowBytes = size * 4;
  const raw = Buffer.alloc((rowBytes + 1) * size);

  for (let y = 0; y < size; y++) {
    let offset = y * (rowBytes + 1);
    raw[offset] = 0; // filter type none
    offset += 1;
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const R = size * 0.42;
      const r2 = size * 0.30;
      let color = bg;
      let alpha = 255;
      // rounded square background handled by alpha falloff at corners
      const corner = Math.max(Math.abs(dx), Math.abs(dy));
      const edge = size * 0.46;
      if (corner > edge) {
        alpha = 0;
      }
      if (dist < R && dist > R - size * 0.045) {
        color = ring; // outer ring = level ring
      } else if (dist < r2) {
        const t = dist / r2;
        color = [
          Math.round(glow[0] * (1 - t) + bg[0] * t * 0.3),
          Math.round(glow[1] * (1 - t) + bg[1] * t * 0.3),
          Math.round(glow[2] * (1 - t) + bg[2] * t * 0.3),
        ];
      }
      const idx = offset + x * 4;
      raw[idx] = color[0];
      raw[idx + 1] = color[1];
      raw[idx + 2] = color[2];
      raw[idx + 3] = alpha;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  return png;
}

const outDir = path.join(__dirname, '..', 'public');
for (const size of [192, 512]) {
  fs.writeFileSync(path.join(outDir, `pwa-${size}.png`), makeIcon(size));
}
console.log('icons generated');
