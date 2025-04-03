
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const rules = require('./webpack.rules');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = async () =>  {
  // Put your normal webpack config below here
  const htmlPlugins = [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      inject: false, // ← Forgeの自動script挿入をやめる
    }),
    new HtmlWebpackPlugin({
      filename: 'editor.html',
      template: './src/editor.html',
      inject: false, // ← こちらも
    }),
  ];

  return {
  module: {
    rules,
  },
  plugins: [
    ...htmlPlugins,
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets'),
          to: 'main/assets',
          noErrorOnMissing: true,
        },
        {
          from: path.resolve(__dirname, 'src/assets'),
          to: 'editor/assets',
          noErrorOnMissing: true,
        },
      ],
    }),
    new MonacoWebpackPlugin({
      languages: ['xml'],
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^vs\/editor\/common\/services\/editorSimpleWorker$/,
    }),
  ],
  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, '.webpack/renderer'),
    publicPath: './',
    globalObject: 'self',
  },
  ignoreWarnings: [
    {
      module: /editorSimpleWorker\.js$/,
    },
  ],
};
};
