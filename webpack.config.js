"use strict";

const debug = process.env.NODE_ENV !== "production";

const webpack = require('webpack');
const path = require('path');

module.exports = {
  devtool: debug ? 'inline-sourcemap' : null,
  entry: path.join(__dirname, 'src', 'index.js'),
  devServer: {
    inline: true,
    port: 3333,
    contentBase: "build/",
    historyApiFallback: {
      index: '/index.html'
    }
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: "/",
    filename: 'bundle.js'
  },
  module: {
    rules : [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: ["es2015", "react-app"]
        }
      },
      {
        test: /\.css$/,
        use: 'css-loader'
      },
      {
        test: /\.scss$/,
        use: 'sass-loader'
      },
    ]
  },
  plugins: debug ? [] : []
};
