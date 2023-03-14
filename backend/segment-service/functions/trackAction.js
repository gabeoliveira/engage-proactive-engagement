const TokenValidator = require('twilio-flex-token-validator').functionValidator

// should add TokenValidator
exports.handler = TokenValidator(async (context, event, callback) => {
  const helpers = loadServerlessModules(context, event)
  try {
    helpers.logger.debug(`tracking event ${JSON.stringify(event, null, 2)}`)
    const { SEGMENT_WRITE_KEY } = context

    const {  properties, id, idType } = event;

    console.log(properties);
    console.log(id);
    console.log(idType);


    let result = await helpers.segment.trackEvent(
      SEGMENT_WRITE_KEY,
      event.event,
      null,
      event.segmentUserId,
      event.id,
      event.idType
    )

    /*let result = await helpers.segment.trackEvent(
      SEGMENT_WRITE_KEY,
      'Conversation Completed',
      null,
      '1be449dc',
      '1be449dc',
      'user_id'
    );*/

    const res = helpers.twilio.defaultResponse()
    res.setBody(result)
    helpers.logger.wait(() => {
      callback(null, res)
    })
  } catch (err) {
    helpers.logger.error('track action error: ', err)
    callback(err)
  }
})

/**
 * Twilio calls this method
 * @returns {Object} all helpers available
 */
const loadServerlessModules = (context, event) => {
  const Helpers = require(Runtime.getFunctions()['helpers/index'].path);

  return new Helpers(context, event);
}
