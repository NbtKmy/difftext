import './index.css';
import * as monaco from 'monaco-editor';
import vkbeautify from 'vkbeautify';


// グローバル変数
let monacoEditor = null;
let currentTheme = 'vs-light';

// テーマのトグル
document.getElementById('toggleThemeBtn').addEventListener('click', () => {
    currentTheme = currentTheme === 'vs-light' ? 'vs-dark' : 'vs-light';
    monaco.editor.setTheme(currentTheme);
  });

// エディタの初期化
window.electronAPI.onLoadTeiXml(({ filePath, xmlContent }) => {
    document.getElementById('teiEditorContainer').style.display = 'block';
    const prettyXml = vkbeautify.xml(xmlContent, 2);
    requestAnimationFrame(() => {
        monacoEditor = monaco.editor.create(document.getElementById('editor'), {
          value: prettyXml,
          language: 'xml',
          theme: 'vs-light',
          automaticLayout: true,
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          folding: true,
        });
      });
  
    document.title = `TEIエディタ - ${filePath}`;
  });

document.getElementById('saveTeiBtn').addEventListener('click', () => {
    const editedXml = monacoEditor.getValue();
  
    const blob = new Blob([editedXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited_tei.xml';
    a.click();
  
    URL.revokeObjectURL(url);
});
