var path = require('path');
var webpack = require('webpack');
var mainPath = path.resolve(__dirname, 'app', 'main.js');

module.exports = {
  devtool: 'eval-source-map',
  entry: {
    main: [mainPath]
  },

  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public'),
    publicPath: path.resolve(__dirname, 'public')
  },

  module: {
    preLoaders: [{
      test: /\.jsx$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    }],
    loaders: [{
      test: /\.jsx?$/,
      include: path.join(__dirname, 'app'),
      loader: 'babel-loader',
      exclude: path.resolve(__dirname, 'node_modules')
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};
