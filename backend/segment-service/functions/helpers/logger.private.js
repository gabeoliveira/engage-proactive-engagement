const levels = {
  debug: 4,
  info: 3,
  warning: 2,
  error: 1,
}

class LoggerLib {
  constructor(context, event) {
    if (context.ROLLBAR_TOKEN) {
      const rollbar = this._configureRollbar(context, event)
      console.log('started rollbar on host', rollbar.options.host)
      return rollbar
    } else {
      return new Logger(context, event)
    }
  }

  _configureRollbar(context, event) {
    const Rollbar = require('rollbar')
    const rollbar = new Rollbar({ accessToken: context.ROLLBAR_TOKEN })
    // other configure options: https://docs.rollbar.com/docs/rollbarjs-configuration-reference
    // scrub fields (api keys)
    let options = { payload: { context: context.DOMAIN_NAME + context.PATH } }
    if (context.LOGLEVEL) {
      options.reportLevel = context.LOGLEVEL
    }
    if (context.ROLLBAR_ENVIRONMENT) {
      options.payload.environment = context.ROLLBAR_ENVIRONMENT
    }
    // TODO: check event for info around the person
    // person = {  id: 42, email: 'dadams@example.com', username: 'dadams'}
    if (event.userId || event.email) {
      options.payload.person = { id: event.userId, email: event.email }
    }
    console.log('initializing rollbar with options', JSON.stringify(options, null, 2))
    rollbar.configure(options)
    return rollbar
  }
}

class Logger {
  constructor(context, event) {
    this.logLevel = context && context.LOGLEVEL ? context.LOGLEVEL : 'warning'
    this.options = { reportLevel: this.logLevel }
  }

  log(message) {
    if (levels[this.logLevel] >= levels['info']) {
      console.log(message)
    }
  }

  debug(message) {
    if (levels[this.logLevel] >= levels['debug']) {
      console.debug(message)
    }
  }

  info(message) {
    if (levels[this.logLevel] >= levels['info']) {
      console.info(message)
    }
  }

  warning(message) {
    if (levels[this.logLevel] >= levels['warning']) {
      console.warn(message)
    }
  }

  error(message) {
    if (levels[this.logLevel] >= levels['error']) {
      console.error(message)
    }
  }

  //copies what rollbar expects
  wait(callback) {
    callback()
  }

  //copies what rollbar would do
  configure(payload) {
    this.payload = payload
  }
}

/** @module logger */
module.exports = {
  LoggerLib,
}
