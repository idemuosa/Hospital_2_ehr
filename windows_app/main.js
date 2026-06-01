const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "Hospital EHR System"
  });

  // Priority: 1. ENV URL, 2. Deployed default, 3. Localhost
  const startUrl = process.env.DESKTOP_URL || 'http://localhost';

  win.loadURL(startUrl);

  // Remove default menu bar for a cleaner desktop app feel
  Menu.setApplicationMenu(null);

  // Handle errors if the server isn't ready
  win.webContents.on('did-fail-load', () => {
    win.loadURL(`data:text/html,<html><body style="font-family:sans-serif; text-align:center; padding-top:20%"><h1>Hospital EHR is starting up...</h1><p>Please wait a moment and refresh or check if Docker is running.</p><button onclick="location.reload()">Refresh</button></body></html>`);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
