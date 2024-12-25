const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './web/react/apps.js',
  output: {
    filename: './build/react/bundle.js',
  },
  module: {
    rules: [{ test: /\.js$/, use: 'babel-loader' }],
  },
  plugins: [new HtmlWebpackPlugin({ template: './web/apps.html' })],
};