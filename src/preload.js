const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectXmlFile: () => ipcRenderer.invoke('select-xml-file'),
  onLoadTeiXml: (callback) => ipcRenderer.on('load-tei-xml', (_, data) => callback(data))
});

