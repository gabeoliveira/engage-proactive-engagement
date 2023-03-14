const axios = require('axios')
const segmentBaseUrl = 'https://profiles.segment.com/v1/spaces/'
const segmentMidUrl = '/collections/users/profiles/'
const allowedIdTypes = ['email', 'phone', 'user_id']
// example full url:
// https://profiles.segment.com/v1/spaces/123spaceId/collections/users/profiles/email:team@owldemo.com/events?limit=25


module.exports.fetchPersona = async (context, event, helpers) => {
  try {
    let { identifier, idType, limit = 25 } = event

    /*if (identifier[0] !== '+') {
      identifier = '+' + identifier.slice(1)
    }*/
    identifier = identifier.split(' ').join('').split('-').join('')

    helpers.logger.debug(`fetching user profile ${helpers.stringify(event)}`)
    const username = context.SEGMENT_PERSONAS_KEY
    const segmentClient = axios.create({
      baseURL: segmentBaseUrl,
      auth: { username },
    })

    const promises = []
    const startUrl =
      context.SEGMENT_SPACE_ID +
      segmentMidUrl +
      idType +
      ':' +
      encodeURIComponent(identifier)
    const fullEventUrl = `${startUrl}/events?limit=${limit}`
    const fullTraitUrl = `${startUrl}/traits?limit=${limit}`
    const fullIdUrl = `${startUrl}/external_ids?limit=25`

    console.log(identifier);

    helpers.logger.debug(
      `searching for user ${helpers.stringify(fullTraitUrl)}`
    )

    promises.push(segmentClient.get(fullEventUrl))
    promises.push(segmentClient.get(fullIdUrl))
    promises.push(segmentClient.get(fullTraitUrl))

    const results = await Promise.all(promises);
    let traitData, eventData, idData, anonymousId;
    for (let i = 0; i < results.length; i++) {
      const requestUrl = results[i].config.url
      if (requestUrl.includes(fullTraitUrl)) traitData = results[i].data.traits
      if (requestUrl.includes(fullEventUrl)) eventData = results[i].data.data
      if (requestUrl.includes(fullIdUrl)) {
        idData = results[i].data.data.filter((id) =>
          allowedIdTypes.includes(id.type)
        )
        anonymousId = results[i].data.data.find(
          (id) => id.type === 'anonymous_id'
        )
      }
    }

    const res = helpers.twilio.defaultResponse();
    const body = {
      traits: traitData,
      events: eventData,
      audiences: [],
      externalIds: idData,
      anonymousId,
    }
    helpers.logger.debug('fetched persona ' + helpers.stringify(body))
    res.setBody(body)
    return res
  } catch (err) {
    helpers.logger.debug(helpers.stringify(err))

    if (err.response.status >= 400) {
      //segment throws an error, return 200 to Flex and pass through statusCode and Message from Segment
      const res = helpers.twilio.defaultResponse()
      const body = {
        statusCode: err.response.status,
        statusMessage: err.response.statusText,
      }
      helpers.logger.debug('segment profile error' + helpers.stringify(body))
      res.setBody(body)
      return res
    }

    throw err
  }
}
