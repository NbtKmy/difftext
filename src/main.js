const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      //devTools: false
    },
  });
  win.loadFile(path.join(__dirname, '../dist/index.html'));
}

function createTeiEditorWindow(filePath, xmlContent) {
  const editorWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'TEIエディタ',
    webPreferences: {
      preload: path.join(__dirname, 'editorPreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      //devTools: false
    },
  });
  editorWindow.loadFile(path.join(__dirname, '../dist/editor.html'));
  editorWindow.webContents.once('did-finish-load', () => {
    editorWindow.webContents.send('load-tei-xml', { filePath, xmlContent });
  });
}

ipcMain.handle('select-xml-file', async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: 'XML Files', extensions: ['xml'] }],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const filePath = result.filePaths[0];
  const content = fs.readFileSync(filePath, 'utf-8');

  // 新しいウィンドウで開く
  createTeiEditorWindow(filePath, content);

  return true;
});

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
