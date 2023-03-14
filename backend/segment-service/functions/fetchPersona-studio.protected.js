const Helpers = require(Runtime.getFunctions()['helpers/index'].path)
const fetchPersonaModule = require(Runtime.getFunctions()['shared/fetchPersona']
  .path)


exports.handler = async (context, event, callback) => {
  const helpers = new Helpers(context, event)
  let response = helpers.twilio.defaultResponse()

  try {
    response = await fetchPersonaModule.fetchPersona(context, event, helpers)
    callback(null, response)
  } catch (err) {
    helpers.logger.error('error fetching persona for studio', err)
    response.setBody(err)
    callback(response)
  }
}
