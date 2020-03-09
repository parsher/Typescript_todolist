const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    index: './ts/index.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: "/dist/",
  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader']
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, 
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.ts', '.js', '.scss', '.css']
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "css/style.css" })
  ]
};