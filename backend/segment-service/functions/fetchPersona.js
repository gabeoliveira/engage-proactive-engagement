const Helpers = require(Runtime.getFunctions()['helpers/index'].path)
const fetchPersonaModule = require(Runtime.getFunctions()['shared/fetchPersona']
  .path)

const TokenValidator = require('twilio-flex-token-validator').functionValidator;


exports.handler = TokenValidator(async (context, event, callback) => {
  console.log(event);
  const helpers = new Helpers(context, event)
  try {
    const user = await helpers.auth.validate(context, event)
    if (!user || user === false) {
      helpers.logger.wait(() => {
        callback(null, helpers.twilio.forbiddenResponse())
      })
      return
    }
    helpers.logger.debug(`running for user: ${helpers.stringify(user)}`)
    helpers.logger.configure({ payload: { person: user } })
  } catch (err) {
    helpers.logger.error('error evaluating authorization', err)
    helpers.logger.wait(() => {
      callback(null, helpers.twilio.forbiddenResponse())
    })
    return
  }

  let response = helpers.twilio.defaultResponse()
  try {
    response = await fetchPersonaModule.fetchPersona(context, event, helpers)
    callback(null, response)
  } catch (err) {
    helpers.logger.error('error fetching persona', err)
    response.setBody(err)
    callback(response)
  }
});
