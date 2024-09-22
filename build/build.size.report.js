const debug = require('debug')('pm:build-size-report')
const AppCompiler = require('./utils/AppCompiler')
const config = require('./config')

if (config.buildSizeReport) {

  const compiler = new AppCompiler({
    webpackConfig: require(config.buildSizeReportWebpackConfigPath),
    logErrors: config.buildSizeReportDebug
  })

  compiler.start(() => {
    debug('Compiled with config', config.buildSizeReportWebpackConfigPath)
    debug(`Report at http://localhost:${config.port}${config.buildSizeReportPath}`)
  })

} else {

  debug('Bunlde size report is turned off, use BUILD_BUNDLE_REPORT=true')

}
