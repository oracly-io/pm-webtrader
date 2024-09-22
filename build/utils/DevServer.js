const _ = require('lodash')
const debug = require('debug')('pm:build:dev-server')

class DevServer {

  constructor({ path, port, host }) {

    this.path = path
    if (_.isEmpty(this.path) && !_.isString(this.path)) {
      throw new Error('webpackConfig arg is INVALID!')
    }

    this.port = port
    if (_.isEmpty(this.port) && !_.isNumber(this.port)) {
      throw new Error('webpackConfig arg is INVALID!')
    }

    this.host = host;
  }

  postToGetMiddleware(req, res, next) {
    if (req.method == 'POST') {
      debug('Mutating POST to GET')
      req.method = 'GET'
    }
    next()
  }

  start(callback) {
    const express = require('express')
    const morgan = require('morgan')

    const app = express()

    // NOTE: will log requests
    app.use(morgan('dev'))
    app.use(this.postToGetMiddleware)
    app.use(express.static(this.path))

    app.listen(this.port, this.host, (err) => {
      if (err) debug(err)
      else     debug(`Hosted at http://${this.host || "localhost"}:${this.port}/`)

      if (_.isFunction(callback)) callback(err)
    })
  }

}

module.exports = DevServer
