import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

// 1. Resolve all directory paths using Node.js path.resolve() and import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');
const publicDir = path.resolve(rootDir, 'public');
const distDir = path.resolve(rootDir, 'dist');
const distSingleDir = path.resolve(rootDir, 'dist-singlefile');

// Helper function to recursively find all files in a directory using path.resolve()
function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.resolve(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function buildPackage() {
  console.log('📦 Starting packaging process with Node.js path.resolve()...');

  // Ensure target directories exist using path.resolve()
  [publicDir, distDir, distSingleDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 2. Locate and bundle static assets (images, icons, manifests)
  const iconCandidate = path.resolve(publicDir, 'icon.svg');
  const manifestCandidate = path.resolve(publicDir, 'manifest.json');

  let iconDataUri = '';
  let appleIconDataUri = '';
  let manifestDataUri = '';

  if (fs.existsSync(iconCandidate)) {
    const iconBuffer = fs.readFileSync(iconCandidate);
    iconDataUri = `data:image/svg+xml;base64,${iconBuffer.toString('base64')}`;
  }

  // iOS requires a PNG apple-touch-icon; inline the 180px PNG for single-file builds.
  const appleIconCandidate = path.resolve(publicDir, 'icon-180.png');
  if (fs.existsSync(appleIconCandidate)) {
    const appleBuffer = fs.readFileSync(appleIconCandidate);
    appleIconDataUri = `data:image/png;base64,${appleBuffer.toString('base64')}`;
  }

  if (fs.existsSync(manifestCandidate)) {
    let manifestText = fs.readFileSync(manifestCandidate, 'utf-8');
    // Inline PNG icons referenced by the manifest into data URIs.
    for (const iconName of ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png']) {
      const iconPath = path.resolve(publicDir, iconName);
      if (fs.existsSync(iconPath)) {
        const iconBuffer = fs.readFileSync(iconPath);
        const iconUri = `data:image/png;base64,${iconBuffer.toString('base64')}`;
        manifestText = manifestText.replace(new RegExp(`"?${iconName}"?`, 'g'), `"${iconUri}"`);
      }
    }
    manifestDataUri = `data:application/manifest+json;base64,${Buffer.from(manifestText).toString('base64')}`;
  }

  // 3. Process standalone single-file HTML with inlined assets
  const singleFileSource = path.resolve(distSingleDir, 'index.html');
  if (!fs.existsSync(singleFileSource)) {
    throw new Error(`Single-file source not found at: ${singleFileSource}`);
  }

  let singleFileHtml = fs.readFileSync(singleFileSource, 'utf-8');

  // Inline manifest and icon assets into the HTML document
  if (manifestDataUri) {
    singleFileHtml = singleFileHtml.replace(
      /<link rel="manifest"[^>]*>/i,
      `<link rel="manifest" href="${manifestDataUri}" />`
    );
  }
  if (iconDataUri) {
    singleFileHtml = singleFileHtml.replace(
      /<link rel="icon"[^>]*>/i,
      `<link rel="icon" type="image/svg+xml" href="${iconDataUri}" />`
    );
  }
  if (appleIconDataUri) {
    singleFileHtml = singleFileHtml.replace(
      /<link rel="apple-touch-icon"[^>]*>/i,
      `<link rel="apple-touch-icon" href="${appleIconDataUri}" />`
    );
  }

  // Write standalone single-file HTML to all target locations using path.resolve()
  const standaloneTargets = [
    path.resolve(publicDir, 'ChoAnhVe_SingleFile_Offline.html'),
    path.resolve(distDir, 'ChoAnhVe_SingleFile_Offline.html'),
    path.resolve(distSingleDir, 'ChoAnhVe_SingleFile_Offline.html'),
    singleFileSource,
  ];

  standaloneTargets.forEach((targetPath) => {
    fs.writeFileSync(targetPath, singleFileHtml, 'utf-8');
  });

  console.log(`✅ Standalone single-file HTML saved to: ${path.resolve(publicDir, 'ChoAnhVe_SingleFile_Offline.html')}`);

  // 4. Create Standalone ZIP file for complete offline use
  const zip = new JSZip();

  // Add the standalone index.html
  zip.file('index.html', singleFileHtml);

  // Bundle all static assets from public/ (excluding zip files)
  const publicFiles = getAllFiles(publicDir);
  publicFiles.forEach((filePath) => {
    const relativeName = path.relative(publicDir, filePath);
    if (!relativeName.endsWith('.zip') && !relativeName.endsWith('.html')) {
      zip.file(relativeName, fs.readFileSync(filePath));
    }
  });

  // Bundle static assets from dist/assets if available
  const distAssetsDir = path.resolve(distDir, 'assets');
  if (fs.existsSync(distAssetsDir)) {
    const assetFiles = getAllFiles(distAssetsDir);
    const assetsFolder = zip.folder('assets');
    assetFiles.forEach((filePath) => {
      const fileName = path.basename(filePath);
      assetsFolder.file(fileName, fs.readFileSync(filePath));
    });
  }

  // Add direct Windows launcher (executes directly in default browser)
  const windowsBatContent = `@echo off
start "" "%~dp0index.html"
exit
`;
  zip.file('Chay_Ung_Dung_Windows.bat', windowsBatContent);

  // Add pure Node.js static server using path.resolve()
  const nodeServerContent = `import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDirectory = path.resolve(__dirname);
const PORT = 5500;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const reqUrl = (req.url || '/').split('?')[0];
  const relativePath = reqUrl === '/' ? 'index.html' : reqUrl.slice(1);
  const resolvedPath = path.resolve(rootDirectory, relativePath);

  if (!resolvedPath.startsWith(rootDirectory)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }

  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(resolvedPath).pipe(res);
  } else {
    const fallback = path.resolve(rootDirectory, 'index.html');
    if (fs.existsSync(fallback)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(fallback).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
});

server.listen(PORT, '127.0.0.1', () => {
  const url = \`http://localhost:\${PORT}\`;
  console.log(\`[Chờ Anh Về] Máy chủ cục bộ đang hoạt động tại: \${url}\`);
  const openCommand = process.platform === 'win32'
    ? \`start \${url}\`
    : process.platform === 'darwin'
    ? \`open \${url}\`
    : \`xdg-open \${url}\`;

  exec(openCommand, () => {});
});
`;
  zip.file('serve.mjs', nodeServerContent);

  // Add Windows batch for Node.js server option
  const nodeBatContent = `@echo off
cd /d "%~dp0"
node serve.mjs
`;
  zip.file('Chay_Server_NodeJS.bat', nodeBatContent);

  // Add Mac / Linux launcher
  const unixShContent = `#!/bin/sh
cd "$(dirname "$0")"
if which xdg-open >/dev/null 2>&1; then
  xdg-open index.html
elif which open >/dev/null 2>&1; then
  open index.html
else
  node serve.mjs
fi
`;
  zip.file('Chay_Ung_Dung_Mac_Linux.sh', unixShContent);

  // Add documentation README
  const readmeContent = `💖 ỨNG DỤNG "CHỜ ANH VỀ" - BẢN ĐÓNG GÓI CHẠY TRÊN MỌI MÁY TÍNH (OFFLINE 100%)
=======================================================================
Cặp đôi: Đại Tuấn Kiệt & Lê Thị Thanh Tuyền
Đơn vị: Trường Cao đẳng Hậu cần 2, TP. Thủ Đức (2026 - 2028)

CÁCH SỬ DỤNG:
1. Nhấp đúp chuột vào file "Chay_Ung_Dung_Windows.bat" (hoặc nhấp đúp trực tiếp vào file "index.html").
2. Ứng dụng sẽ tự động mở trên trình duyệt mặc định (Chrome, Edge, Firefox, Cốc Cốc).
3. Nếu bạn muốn chạy qua giao thức HTTP cục bộ bằng Node.js, nhấp đúp "Chay_Server_NodeJS.bat".
4. Trên macOS / Linux: Chạy file "Chay_Ung_Dung_Mac_Linux.sh".
5. Hoạt động 100% Offline, không yêu cầu kết nối Internet.
`;
  zip.file('README.txt', readmeContent);

  // 5. Generate and save the standalone ZIP file
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const zipTargets = [
    path.resolve(publicDir, 'ChoAnhVe_Desktop_Portable.zip'),
    path.resolve(distDir, 'ChoAnhVe_Desktop_Portable.zip'),
    path.resolve(distSingleDir, 'ChoAnhVe_Desktop_Portable.zip'),
  ];

  zipTargets.forEach((targetPath) => {
    fs.writeFileSync(targetPath, zipBuffer);
  });

  console.log(`✅ Standalone ZIP package generated: ${path.resolve(publicDir, 'ChoAnhVe_Desktop_Portable.zip')} (${Math.round(zipBuffer.length / 1024)} KB)`);
  console.log('🎉 Packaging completed successfully!');
}

buildPackage().catch((error) => {
  console.error('❌ Build and packaging failed:', error);
  process.exit(1);
});
