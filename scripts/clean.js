import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const targets = ['dist', 'dist-singlefile', 'server.js'].map((p) => path.resolve(rootDir, p));

for (const target of targets) {
  try {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`Removed: ${target}`);
  } catch (e) {
    console.error(`Failed to remove ${target}:`, e);
    process.exitCode = 1;
  }
}
