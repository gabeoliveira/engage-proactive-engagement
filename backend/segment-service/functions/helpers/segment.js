const Analytics = require('analytics-node')
const { v4: uuidv4 } = require('uuid')

class SegmentHelper {
  constructor(logger) {
    this.logger = logger
  }

  /**
   * @param {string} segmentKey
   * @param {string} event
   * @param {Object} properties
   * @param {string} anonymousId
   * @param {string} id
   * @returns {Promise}
   */
  async trackEvent(segmentKey, event, properties, segmentUserId, id, idType) {
    const analytics = new Analytics(segmentKey)
    const body = {
      event,
      properties,
      messageId: uuidv4(),
      userId: segmentUserId,
      context: {
        externalIds: [
          {
            id,
            type: idType,
            collection: 'users',
            encoding: 'none',
          },
        ],
      },
    }
    console.log(body);
    this.logger.debug(`sending tracking event ${JSON.stringify(body, null, 2)}`)
    /* TODO fix later
    if (userId) body.userId = userId
    else body.anonymousId = anonymousId
    */
    const result = await (() => {
      return new Promise((resolve) => { 
        analytics.track(body, () => {
          const { messageId } = body

          resolve({
            messageId,
            result: true,
          })
        })
      })
    })()

    await analytics.flush((err, batch) => console.log('Flushed'));

    return result;
  }

  async identifyUser(segmentKey, traits, userId) {
    const analytics = new Analytics(segmentKey)
    const body = {
      userId,
      traits
    }
    this.logger.debug(`sending tracking event ${JSON.stringify(body, null, 2)}`)
    /* TODO fix later
    if (userId) body.userId = userId
    else body.anonymousId = anonymousId
    */
    const result = await (() => {
      return new Promise((resolve) => {
        analytics.identify(body, () => {
          const { userId } = body

          console.log(body);

          resolve({
            userId,
            result: true,
          })
        })
      })
    })()

    await analytics.flush();

    return result
  }
}

/** @module syncHelper */
module.exports = {
  SegmentHelper,
}
