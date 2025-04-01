import './index.css';
const { getDiffTeiVariantXml, getSideBySideDiff } = require('./diffUtils');


// グローバル変数
let files = [];
let baseIndex = 0;


// 連動ハイライト
function setupDiffHighlighting() {
    const allDiffBlocks = document.querySelectorAll('.diff-block');
    allDiffBlocks.forEach(el => {
        el.addEventListener('mouseenter', () => {
        const id = el.dataset.diffId;
        document.querySelectorAll(`[data-diff-id="${id}"]`).forEach(match => {
            match.classList.add('highlight');
            });
        });

        el.addEventListener('mouseleave', () => {
        const id = el.dataset.diffId;
        document.querySelectorAll(`[data-diff-id="${id}"]`).forEach(match => {
            match.classList.remove('highlight');
            });
        });
    });
}

function renderDiffView() {
    const leftFile = files[baseIndex];
    const rightFile = files[1 - baseIndex];
  
    const { left, right } = getSideBySideDiff(leftFile.content, rightFile.content);
  
    diffView.innerHTML = `
      <h2>差分ビュー</h2>
      <div style="display: flex; gap: 20px;">
        <div style="flex: 1; border-right: 1px solid #ccc;">
          <h4>${leftFile.name}</h4>
          <div class="diff-column" style="white-space: pre-wrap;">${left}</div>
        </div>
        <div style="flex: 1;">
          <h4>${rightFile.name}</h4>
          <div class="diff-column" style="white-space: pre-wrap;">${right}</div>
        </div>
      </div>
    `;
    // 同期ハイライト処理はここでも呼び出し
    setupDiffHighlighting();
  }

document.getElementById('selectBtn').addEventListener('click', async () => {
  files = await window.electronAPI.selectFiles();
  const container = document.getElementById('fileContainer');
  const diffView = document.getElementById('diffView');

  container.innerHTML = '';
  diffView.innerHTML = '';
  // ファイルが一つしか選択されていない場合は、その内容を表示
  if (files.length === 1) {
    files.forEach(file => {
        const section = document.createElement('div');
        section.innerHTML = `<h3>${file.name}</h3><pre>${file.content}</pre>`;
        container.appendChild(section);
    });
  }

  if (files.length === 2) {
    // オリジナル文書選択用UI
    const baseSelector = document.createElement('div');
    baseSelector.innerHTML = `
        <p>どちらを「元のテキスト」としますか？</p>
        <label><input type="radio" name="baseFile" value="0" checked> ${files[0].name}</label><br>
        <label><input type="radio" name="baseFile" value="1"> ${files[1].name}</label>
    `;
    container.appendChild(baseSelector);

    baseSelector.querySelectorAll('input[name="baseFile"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          baseIndex = parseInt(e.target.value);
          renderDiffView(); // 再描画
        });
      });
    
    renderDiffView();
  } else {
    diffView.innerHTML = '<p style="color: gray;">※ 差分は2ファイル選択時のみ表示されます。</p>';
  }
});

// ファイル名を取得
const getWitLabel = (filename) =>
    filename.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_');

// TEIエクスポート
document.getElementById('exportTeiBtn').addEventListener('click', async () => {
    if (files.length !== 2) {
      alert('TEIエクスポートは2ファイル選択時のみ可能です。');
      return;
    }

    const leftFile = files[baseIndex];
    const rightFile = files[1 - baseIndex];
    const label1 = getWitLabel(leftFile.name);
    const label2 = getWitLabel(rightFile.name);
  
    const teiContent = getDiffTeiVariantXml(leftFile.content, rightFile.content, label1, label2);
    const fullTei = `<?xml version="1.0" encoding="utf-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
    <teiHeader>
        <fileDesc>
            <titleStmt>
                <title>Title</title>
            </titleStmt>
            <publicationStmt>
                <p>Publication</p>
            </publicationStmt>
            <sourceDesc>
                <listWit>
                    <witness xml:id="${label1}">${label1}</witness>
                    <witness xml:id="${label2}">${label2}</witness>
                </listWit>
            </sourceDesc>
        </fileDesc>
    </teiHeader>
    <text>
        <body>
            <p>
                ${teiContent}
            </p>
        </body>
    </text>
</TEI>`;
  
    const blob = new Blob([fullTei], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diff_output.xml';
    a.click();
  
    URL.revokeObjectURL(url);
  });


// HTMLダウンロード
  document.getElementById('exportHtmlBtn').addEventListener('click', () => {
    if (files.length !== 2) {
      alert('2つのファイルを選択してください');
      return;
    }
  
    const leftFile = files[baseIndex];
    const rightFile = files[1 - baseIndex];
    const { left, right } = getSideBySideDiff(leftFile.content, rightFile.content);
  
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>差分比較ビュー</title>
            <style>
            body { font-family: sans-serif; }
            .diff-block.insert { background-color: lightgreen; }
            .diff-block.delete { background-color: pink; }
            .diff-block.placeholder { color: transparent; }
            .diff-block.highlight { outline: 2px solid gold; }
            .container { display: flex; gap: 20px; }
            .column { flex: 1; white-space: pre-wrap; }
            </style>
        </head>
        <body>
            <h2>差分比較ビュー</h2>
            <div class="container">
            <div class="column"><h4>${leftFile.name}</h4>${left}</div>
            <div class="column"><h4>${rightFile.name}</h4>${right}</div>
            </div>
        </body>
        </html>
    `;
  
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diff_view.html';
    a.click();
  
    URL.revokeObjectURL(url);
  });

// TEIエディタを開く
/* function openTeiEditor(initialXmlText) {
  document.getElementById('teiEditorContainer').style.display = 'block';
  monacoEditor = monaco.editor.create(document.getElementById('editor'), {
    value: initialXmlText,
    language: 'xml',
    theme: 'vs-light',
    automaticLayout: true,
  });
}
*/

document.getElementById('openEditorBtn').addEventListener('click', async() => {
  await window.electronAPI.selectXmlFile();
});


