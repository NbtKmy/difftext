const webpack = require('webpack');
const rules = require('./webpack.rules');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['xml'],
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^vs\/editor\/common\/services\/editorSimpleWorker$/,
    }),
  ],
  output: {
    globalObject: 'self',
    publicPath: './',
  },
  ignoreWarnings: [
    {
      module: /editorSimpleWorker\.js$/,
    },
  ],
};
