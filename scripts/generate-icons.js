import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');
const source = path.resolve(publicDir, 'icon.svg');

const sizes = [
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
];

async function generate() {
  const svgBuffer = fs.readFileSync(source);

  for (const { name, size, maskable } of sizes) {
    let input = svgBuffer;
    if (maskable) {
      // Add extra safe-zone padding for maskable icons (content kept within 80%).
      input = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-64 -64 640 640"><rect width="640" height="640" x="-64" y="-64" rx="128" fill="#f43f5e"/><g transform="translate(0,0) scale(0.8) translate(64,64)">${svgBuffer
          .toString()
          .replace(/<svg[^>]*>/, '')
          .replace(/<\/svg>/, '')}</g></svg>`
      );
    }
    const out = path.resolve(publicDir, name);
    await sharp(input).resize(size, size).png().toFile(out);
    console.log(`Generated: ${name}`);
  }
}

generate().catch((e) => {
  console.error('Icon generation failed:', e);
  process.exit(1);
});
