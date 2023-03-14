const axios = require('axios')
const Helpers = require(Runtime.getFunctions()['helpers/index'].path)
const segmentBaseUrl = 'https://profiles.segment.com/v1/spaces/'
const segmentMidUrl = '/collections/users/profiles/'
// example full url:
// https://profiles.segment.com/v1/spaces/123spaceId/collections/users/profiles/email:team@owldemo.com/events

const demoEvents = {
  owlbank: [
    'Clicked on Savings',
    'Clicked on Credit Cards',
    'Clicked on Auto Loans',
    'Clicked on Home Loans',
    'Clicked on Business',
    'Clicked on Investing',
    'Submitted pre-approval',
    'Registered for account',
  ],
}

exports.handler = async (context, event, callback) => {
  const helpers = new Helpers(context, event)
  try {
    let { identifier, idType, demoType } = event

    //default to owlbank if not set
    if (!demoType || !Object.keys(demoEvents).includes(demoType)) {
      demoType = 'owlbank'
    }
    identifier = identifier.replace(' ', '+')
    helpers.logger.debug(
      `fetching user suggestions ${helpers.stringify(event)}`
    )
    const username = context.SEGMENT_PERSONAS_KEY
    const segmentClient = axios.create({
      baseURL: segmentBaseUrl,
      auth: { username },
    })

    const startUrl =
      context.SEGMENT_SPACE_ID + segmentMidUrl + idType + ':' + identifier

    const fullEventUrl = `${startUrl}/events?include=${demoEvents[
      demoType
    ].join(',')}`

    const eventResponse = await segmentClient.get(fullEventUrl)

    const data = eventResponse.data.data
    const history = new Map()
    if (!data) {
      callback(null, {})
      return
    }
    data.forEach((e) => {
      // aggregate event counts into a map
      if (history.has(e.event)) {
        const historyValue = history.get(e.event)
        let { count } = historyValue
        history.set(e.event, {
          count: (count += 1),
          friendlyName: e.properties.friendlyName,
        })
      } else {
        history.set(e.event, {
          count: 1,
          friendlyName: e.properties.friendlyName,
        })
      }
    })

    // create an array of objects to use for sorting later
    let listMap = []
    history.forEach(({ count, friendlyName }, key) => {
      let obj = {
        event: key,
        count,
        friendlyName,
      }
      listMap.push(obj)
    })

    // sort array of objects by the events with the highest counts first
    listMap.sort((a, b) => {
      return b.count - a.count
    })

    callback(null, { suggestions: JSON.stringify(listMap) })
  } catch (err) {
    callback(err)
  }
}
