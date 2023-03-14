'use strict'
const functions = Runtime.getFunctions() //eslint-disable-line no-undef

class Helpers {
  constructor(context, event) {
    /*
     * Load Logger Helper Methods
     */
    const loggerPath = functions['helpers/logger'].path
    const loggerLib = require(loggerPath).LoggerLib
    this.logger = new loggerLib(context, event)

    /*
     * Load Auth Helper Methods
     */
    const authPath = functions['helpers/auth'].path
    const authLib = require(authPath).AuthHelper
    this.auth = new authLib(this.logger)

    /*
     * Load Segment Helper Methods
     */
    const segmentPath = functions['helpers/segment'].path
    const segmentLib = require(segmentPath).SegmentHelper
    this.segment = new segmentLib(this.logger)

    /*
     * Load Twilio Helper Methods
     */
    const twilioPath = functions['helpers/twilio'].path
    const twilioLib = require(twilioPath).TwilioHelper
    this.twilio = new twilioLib(this.logger)
  }

  stringify(obj) {
    return JSON.stringify(obj, null, 2)
  }
}

/** @module helpers */
module.exports = Helpers
