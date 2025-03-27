const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      //preload: path.join(__dirname, 'preload.js'),
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,  // 念のため有効にしておく
      nodeIntegration: false
    },
  });

  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

app.whenReady().then(createWindow);

ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Text or Word Files', extensions: ['txt', 'docx'] },
    ],
  });

  if (result.canceled) return [];

  const files = await Promise.all(result.filePaths.map(async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    let content = '';

    if (ext === '.txt') {
      content = fs.readFileSync(filePath, 'utf-8');
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      content = result.value;
    }

    return { name: path.basename(filePath), content };
  }));

  return files;
});
