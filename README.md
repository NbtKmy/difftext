# でぃふ☆てい

「でぃふ☆てい」はテキストの差分を可視化して、HTMLもしくはTEI/XMLに変換するソフトです。
Pythonだと[中村さん](https://github.com/nakamura196)がすでに[koui](https://github.com/nakamura196/koui/)というのを作成していますが、こちらはローカルで動くアプリで、「コーディングしたくないかも…」という人に作ってみました。
アプリを作る際には[中村さんのこの記事](https://zenn.dev/nakamura196/articles/442da1c74afae1)も参考にしました。

## 使用しているライブラリ

- [diff-match-patch](https://github.com/google/diff-match-patch)
- [mammoth](https://www.npmjs.com/package/mammoth)
- [monaco-editor](https://github.com/microsoft/monaco-editor)
- [vkbeautify](https://github.com/aabluedragon/vkbeautify/tree/master)

## 使い方

使い方は簡単で、
1. OSにあったアプリ（Windows用かMac用）をダウンロードしてスタートする。
1. アプリを開いて比べたいテキストを開く（現状２つのファイルのテキストを比べることができます。ファイルはdocxかtxt形式が選択可能です）。
1. 差分が表示されるので、HTMLもしくはTEI形式でダウンロードする。

という感じで使えます。
HTMLファイルはブラウザで開けます。
TEIファイルは、[TEI Critical Apparatus Toolbox](http://teicat.huma-num.fr/witnesses.php)にアップロードして開く、などなどできます。

v1.1.0からエディタもつけました。TEIファイルを作成してから、エディタでさらに情報を追加できます。

## アプリを自分で改良したい人は…

Node.js、npmなどがインストールされているか確認した後で、
以下のコマンドを実行してください。

```
git clone https://github.com/NbtKmy/difftext.git
cd difftext
npm install
```


