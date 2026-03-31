// Generate app icons from the orange cat idle sprite data
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const ICONS_DIR = join(import.meta.dirname, '..', 'src-tauri', 'icons');

// IDLE_1 sprite data from src/cat-v5/sprite-data.ts (28x20, facing right)
const IDLE = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,0,0,0,0,0,6,6,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,6,3,2,6,0,0,0,6,2,3,6,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,6,2,3,3,6,6,6,3,3,2,6,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,6,3,3,3,2,2,3,3,3,3,6,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,6,2,3,3,3,3,2,2,3,3,3,2,6,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,6,3,3,3,3,3,3,3,3,3,3,3,6,0,0,0,0],
  [0,0,0,0,0,0,6,0,0,0,0,6,3,3,3,6,3,3,3,6,3,3,3,6,0,0,0,0],
  [0,0,0,0,0,6,3,6,0,0,0,6,3,3,3,6,3,3,3,6,3,3,3,6,0,0,0,0],
  [0,0,0,0,0,6,3,6,0,0,0,6,2,3,3,3,3,6,3,3,3,3,2,6,0,0,0,0],
  [0,0,0,0,6,3,6,0,0,0,0,0,6,3,3,3,6,9,6,6,6,3,6,0,0,0,0,0],
  [0,0,0,0,6,3,6,0,0,0,0,0,0,6,3,3,3,6,3,3,3,6,0,0,0,0,0,0],
  [0,0,0,0,0,6,3,6,0,0,0,0,6,3,3,3,3,3,6,6,3,6,0,0,0,0,0,0],
  [0,0,0,0,0,6,3,3,6,0,0,6,3,3,3,3,6,3,3,3,3,6,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,3,3,6,6,3,3,3,3,3,3,6,3,6,6,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,6,3,3,3,3,3,3,6,6,3,3,6,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,6,6,3,3,3,3,3,3,6,3,3,6,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0,0,0],
];

const PALETTE = {
  0: null,          // transparent
  2: "#ef6c00",     // dark orange
  3: "#fb8c00",     // medium orange
  6: "#482a00",     // dark brown
  9: "#f69988",     // pink
};

function drawCatIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Warm background circle
  ctx.fillStyle = '#ffecd2';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Subtle orange border
  ctx.strokeStyle = '#f4a83d';
  ctx.lineWidth = Math.max(1, size / 64);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - ctx.lineWidth / 2, 0, Math.PI * 2);
  ctx.stroke();

  // Draw cat pixels
  const spriteH = IDLE.length;       // 20
  const spriteW = IDLE[0].length;    // 28
  // Find actual bounds (skip empty rows/cols)
  let minR = spriteH, maxR = 0, minC = spriteW, maxC = 0;
  for (let r = 0; r < spriteH; r++) {
    for (let c = 0; c < spriteW; c++) {
      if (IDLE[r][c] !== 0) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    }
  }
  const catW = maxC - minC + 1;
  const catH = maxR - minR + 1;

  const padding = size * 0.15;
  const available = size - padding * 2;
  const pixelSize = Math.floor(available / Math.max(catW, catH));
  const totalW = catW * pixelSize;
  const totalH = catH * pixelSize;
  const offX = (size - totalW) / 2;
  const offY = (size - totalH) / 2 + size * 0.03; // slight vertical offset

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const color = PALETTE[IDLE[r][c]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(
        offX + (c - minC) * pixelSize,
        offY + (r - minR) * pixelSize,
        pixelSize,
        pixelSize,
      );
    }
  }

  return canvas.toBuffer('image/png');
}

// Generate all required sizes
const iconFiles = [
  [32, '32x32.png'],
  [128, '128x128.png'],
  [256, '128x128@2x.png'],
  [30, 'Square30x30Logo.png'],
  [44, 'Square44x44Logo.png'],
  [71, 'Square71x71Logo.png'],
  [89, 'Square89x89Logo.png'],
  [107, 'Square107x107Logo.png'],
  [142, 'Square142x142Logo.png'],
  [150, 'Square150x150Logo.png'],
  [284, 'Square284x284Logo.png'],
  [310, 'Square310x310Logo.png'],
  [50, 'StoreLogo.png'],
  [512, 'icon.png'],
];

for (const [size, name] of iconFiles) {
  writeFileSync(join(ICONS_DIR, name), drawCatIcon(size));
}

// Generate .icns using iconutil
const iconsetDir = join(ICONS_DIR, 'icon.iconset');
mkdirSync(iconsetDir, { recursive: true });
const icnsSizes = [
  [16, 'icon_16x16.png'],
  [32, 'icon_16x16@2x.png'],
  [32, 'icon_32x32.png'],
  [64, 'icon_32x32@2x.png'],
  [128, 'icon_128x128.png'],
  [256, 'icon_128x128@2x.png'],
  [256, 'icon_256x256.png'],
  [512, 'icon_256x256@2x.png'],
  [512, 'icon_512x512.png'],
];
for (const [size, name] of icnsSizes) {
  writeFileSync(join(iconsetDir, name), drawCatIcon(size));
}
execSync(`iconutil -c icns "${iconsetDir}" -o "${join(ICONS_DIR, 'icon.icns')}"`);
execSync(`rm -rf "${iconsetDir}"`);

// Generate .ico if magick available
try {
  execSync('which magick', { stdio: 'ignore' });
  const tmpFiles = [];
  for (const s of [16, 32, 48, 256]) {
    const p = join(ICONS_DIR, `_tmp_${s}.png`);
    writeFileSync(p, drawCatIcon(s));
    tmpFiles.push(p);
  }
  execSync(`magick ${tmpFiles.map(f => `"${f}"`).join(' ')} "${join(ICONS_DIR, 'icon.ico')}"`);
  tmpFiles.forEach(f => execSync(`rm -f "${f}"`));
} catch {
  console.log('magick not found, skipping .ico');
}

console.log('Icons generated!');
