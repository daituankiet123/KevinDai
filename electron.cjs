const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 420,
    minHeight: 650,
    title: 'Chờ Anh Về - Đếm Ngược Nghĩa Vụ Quân Sự 2026 - 2028',
    icon: path.join(__dirname, 'public/icon.svg'),
    backgroundColor: '#fff1f2',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
    autoHideMenuBar: true,
  });

  // Load production dist or local dev server
  const distPath = path.join(__dirname, 'dist', 'index.html');
  const fs = require('fs');

  if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:3000');
  }

  // Prevent app from quitting on close, hide to tray instead
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, 'public/icon.svg');
    tray = new Tray(iconPath);
    tray.setToolTip('Chờ Anh Về - Đếm Ngược Nghĩa Vụ Quân Sự 2026 - 2028');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '💖 Mở ứng dụng Chờ Anh Về',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: '📌 Ghim lên trên cùng (Always on top)',
        type: 'checkbox',
        checked: false,
        click: (item) => {
          if (mainWindow) {
            mainWindow.setAlwaysOnTop(item.checked);
          }
        },
      },
      { type: 'separator' },
      {
        label: '❌ Thoát hoàn toàn',
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      }
    });
  } catch (err) {
    console.log('Tray creation notice:', err.message);
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else if (mainWindow) mainWindow.show();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
