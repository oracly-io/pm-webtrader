const _ = require('lodash')
const debug = require('debug')('pm:build:compiler')

class AppCompiler {

  constructor({
    webpackConfig,
    watchFiles,
    logErrors
  }) {

    this.webpackConfig = webpackConfig
    if (_.isEmpty(this.webpackConfig) && !_.isObject(this.webpackConfig)) {
      throw new Error('webpackConfig arg is INVALID!')
    }

    this.watchFiles = watchFiles !== undefined ? watchFiles : false
    this.logErrors = logErrors !== undefined ? logErrors : true
  }

  log(err, stats) {
    if (err) {
      console.error(err)
    } else {
      debug(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
      }))
    }
  }

  exit(err, stats) {
    if (this.logErrors) this.log(err, stats)

    const errorsCount = _.get(stats, 'compilation.errors.length')
    if (err || errorsCount) {
      process.exit(errorsCount)
    }
  }

  start(callback) {
    const webpack = require('webpack')
    const compiler = webpack(this.webpackConfig)

    if (this.watchFiles) {
      compiler.watch({
        aggregateTimeout: 1000,
        poll: 1000,
        followSymlinks: true,
        ignored: [
          '/node_modules/(?!pm-.*)',
          '/node_modules/(pm-.*)/node_modules'
        ]
      },
      (err, stats) => {
        if (_.isFunction(callback)) callback(err, stats)
        this.log(err, stats)
      })

      debug('Watching files and re-compile on each change.')
    } else {
      compiler.run((err, stats) => {
        if (_.isFunction(callback)) callback(err, stats)
        this.exit(err, stats)
      })
    }

    debug('Compiling...')
  }
}

module.exports = AppCompiler
