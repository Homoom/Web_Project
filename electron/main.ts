import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Linux平台特殊配置
  if (process.platform === 'linux') {
    mainWindow.setIcon(path.join(__dirname, '../assets/linux-icon.png'));
  }

  // ... existing code ...
