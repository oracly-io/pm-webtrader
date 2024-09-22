const _ = require('lodash')
const path = require('path')

const projectRoot = path.resolve(__dirname, '../')

let outputRoot = process.env.NPM_BUILD_OUTPUT_PATH || path.resolve(projectRoot, process.env.DISTIBUTION_PATH || 'dist')
if (!path.isAbsolute(outputRoot)) {
  outputRoot = path.resolve(outputRoot)
}

const pmBasePath = process.env.PM_BASE_PATH || '/'
const stBasePath = process.env.ST_BASE_PATH || '/'
const mtBasePath = process.env.MT_BASE_PATH || '/'

const contentPublicPath = process.env.CONTENT_PUBLIC_PATH || '/'
const reactMountElementId = process.env.REACT_MOUNT_ELEMENT_ID || 'app-oracly'
const applicationType = process.env.APPLICATION_TYPE || 'desktop'

const debug = require('debug')('pm:build:config')

const analyticsEnabled = process.env.ANALYTICS_ENABLED === 'true'
const locizeDevMode = process.env.LOCIZE_DEV_MODE === 'true'
const selfHosted = process.env.HOSTED === 'true'
const watchFiles = process.env.WATCH_FILES === 'true'
const buildSizeReport = process.env.BUILD_BUNDLE_REPORT === 'true'
const buildSizeReportDebug = process.env.BUILD_BUNDLE_REPORT_DEBUG === 'true'

const _configs = {
  default: {
    cssOutputFilename: 'css/[name].css',
    htmlOutputFilename: 'index.html',
    faviconPath: projectRoot + '/static/images/favicon.png',
    outputPath: outputRoot,
    outputPublicPath: contentPublicPath,
    outputFilename: 'js/[name].js',
    outputChunkFilename: 'js/[name].js',
    inlineCss: false,
    htmlTemplatePath: projectRoot + '/build/index.html',

    watchFiles: watchFiles,
    selfhostApplication: selfHosted,
    port: process.env.PORT || 8801,
    host: process.env.HOST,

    applicationType: applicationType,

    buildSizeReport: buildSizeReport,
    buildSizeReportPath: '/size-report',
    buildSizeReportWebpackConfigPath: './webpack.config.size.report',
    buildSizeReportDebug: buildSizeReportDebug,

    mobile: {
      meta: {
        viewport: 'width=device-width, initial-scale=1'
      }
    },

    // NOTE: this used to pass configuration to runtime app.js
    replaceConfig: {
      'process.env': {
        PM_BASE_PATH: `"${pmBasePath}"`,
        ST_BASE_PATH: `"${stBasePath}"`,
        MT_BASE_PATH: `"${mtBasePath}"`,
        APPLICATION_TYPE: `"${process.env.APPLICATION_TYPE}"`,
        REACT_MOUNT_ELEMENT_ID: `"${reactMountElementId}"`,
        CHAT_REST_URL: `"${process.env.CHAT_REST_URL}"`,
        CHAT_WS_URL: `"${process.env.CHAT_WS_URL}"`,
        USERDATA_URL: `"${process.env.USERDATA_URL}"`,
        USERDATA_AVA_URL: `"${process.env.USERDATA_AVA_URL}"`,
        ANALYTICS_ENABLED: `${analyticsEnabled}`,
        LOCIZE_PROJECT_ID: `"${process.env.LOCIZE_PROJECT_ID}"`,
        LOCIZE_API_KEY: `"${process.env.LOCIZE_API_KEY}"`,
        WEBAPI_URL: `"${process.env.WEBAPI_URL}"`,
        NODE_ENV: `"${process.env.NODE_ENV}"`,
        DEBUG: `"${process.env.DEBUG}"`,
        TRACE_ACTIONS: `"${process.env.TRACE_ACTIONS}"`,
        LOCIZE_DEV_MODE: `"${process.env.LOCIZE_DEV_MODE}"`,
        WEB3_LDE_CHAIN_ID: `${process.env.WEB3_LDE_CHAIN_ID}`,
        WEB3_LDE_CHAIN_URL: process.env.WEB3_LDE_CHAIN_URL ? `"${process.env.WEB3_LDE_CHAIN_URL}"` : undefined,
      }
    }
  },
  development: {
    webpackConfigPath: './webpack.config.dev'
  },
  production: {
    webpackConfigPath: './webpack.config.prod'
  }
}

if (!_configs[process.env.NODE_ENV]) {
  throw new Error(`Could not find configuration for ${process.env.NODE_ENV}`)
}

const config = _.defaults(
  {},
  _configs[process.env.NODE_ENV],
  _configs.default)

debug(config)

module.exports = config
