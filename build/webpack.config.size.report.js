const { merge } = require('webpack-merge')

const config = require('./config')

const baseConfig = require('./webpack.config.base.js')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin


module.exports = merge(baseConfig, {
  mode: 'production',
  output: {
    path: config.outputPath + config.buildSizeReportPath,
    publicPath: config.outputPublicPath + config.buildSizeReportPath,
    filename: config.outputFilename,
    chunkFilename: config.outputChunkFilename
  },
  devtool: false,
  optimization: {
    minimize: true
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: config.outputPath + config.buildSizeReportPath + '/index.html'
    }),
  ]
})
