const debug = require('debug')('pm:build')
const AppCompiler = require('./utils/AppCompiler')
const DevServer = require('./utils/DevServer')
const config = require('./config')

const compiler = new AppCompiler({
  webpackConfig: require(config.webpackConfigPath),
  watchFiles: config.watchFiles
})
compiler.start(() => {
  debug("Compiled with config", config.webpackConfigPath)
})

if (config.selfhostApplication) {
  const server = new DevServer({
    path: config.outputPath,
    port: config.port,
    host: config.host,
  })
  server.start()
}
