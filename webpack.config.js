const path = require('path');

module.exports = {
  entry: './working_js/authentication.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
            presets: ['env']
        }
      }
    ]
  }
};