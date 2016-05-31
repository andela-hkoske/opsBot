var path = require('path');
var webpack = require('webpack');
var mainPath = path.resolve(__dirname, 'app', 'app.js');

module.exports = {
  devtool: 'eval-source-map',
  entry: {
    main: [
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/only-dev-server',
      mainPath
    ]
  },

  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public'),
    publicPath: path.resolve(__dirname, 'public')
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],

  module: {
    preLoaders: [{
      test: /\.jsx$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    }],
    loaders: [{
      test: /\.jsx?$/,
      include: path.join(__dirname, 'app'),
      loader: 'react-hot!babel',
      exclude: path.resolve(__dirname, 'node_modules')
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
