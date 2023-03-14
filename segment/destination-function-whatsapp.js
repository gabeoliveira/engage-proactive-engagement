// Learn more about destination functions API at
// https://segment.com/docs/connections/destinations/destination-functions

/**
 * Handle track event
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
*/

async function onTrack(event, settings) {
    // Learn more at https://segment.com/docs/connections/spec/track/

    const {
      profilesApiToken,
      messagingServiceSid,
      includeTraits,
      contentSid
    } = settings;

    const { space_id : spaceId } = event.context.personas;

    const userId = event.userId;

    /* Fetch lastname and company from Personas DB via Profile API. Lookup field = user email */

    /* 1. Make GET request to Profile API 
         You can use userId value instead of email as a lookup field. In this case, insert "user_id:${userId_variable}" in Profile API URL instead of "email:${email_variable}"*/

    const profileAPIEndpoint = `https://profiles.segment.com/v1/spaces/${spaceId}/collections/users/profiles/user_id:${userId}/traits?include=${'phone,' + includeTraits.toString()}`; 

    try {
      const req = await fetch(profileAPIEndpoint, {
          headers: new Headers({
          Authorization: 'Basic ' + btoa(profilesApiToken + ':'),
          'Content-Type': 'application/json'
          }),
          method: 'get'
      });
      const user = await req.json();

      const { traits } = user
      const { phone } = traits;
  
      const contentVariables = includeTraits.reduce((acc,curr,index) => (acc[(index+1).toString()] = traits[curr],acc),{});

      console.log(contentVariables);

      await sendText({
        from: messagingServiceSid,
        to: `whatsapp:${phone}`,
        contentSid,
        contentVariables

      },
        settings
      );



    } catch (error) {
        // Retry on connection error
        throw new RetryError(error.message);
    }

}

/**
 * Sends SMS or WhatsApp message with Twilio
 *
 * https://www.twilio.com/docs/sms
 * https://www.twilio.com/docs/whatsapp
 *
 */
async function sendText(params, settings) {
  const accountSid = settings.twilioAccountSid;
  const authToken = settings.twilioAuthToken;
  const { from , to , contentSid , contentVariables} = params;

  const contentApiEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

  const encodedParams = new URLSearchParams();
  encodedParams.append('From', from);
  encodedParams.append('To', to);
  encodedParams.append('ContentSid', contentSid);
  encodedParams.append('ContentVariables', JSON.stringify(contentVariables));

  try{
    const req = await fetch(contentApiEndpoint, {
        headers: new Headers({
        Authorization: 'Basic ' + btoa(accountSid + ':' + authToken),
        'Content-Type': 'application/x-www-form-urlencoded'
        }),
        method: 'post',
        body: encodedParams
    })
    
      const message = await req.json();
    
      console.log(`Message created with SID:${message.sid}`);
        

  }

  catch(err){
    console.log(err.message);
    throw new RetryError(err.message);
  }

  
}



/**
 * Handle identify event
 * @param  {SegmentIdentifyEvent} event
 * @param  {FunctionSettings} settings
 */
async function onIdentify(event, settings) {
    // Learn more at https://segment.com/docs/connections/spec/identify/
    throw new EventNotSupported('identify is not supported');
}

/**
 * Handle group event
 * @param  {SegmentGroupEvent} event
 * @param  {FunctionSettings} settings
 */
async function onGroup(event, settings) {
    // Learn more at https://segment.com/docs/connections/spec/group/
    throw new EventNotSupported('group is not supported');
}

/**
 * Handle page event
 * @param  {SegmentPageEvent} event
 * @param  {FunctionSettings} settings
 */
async function onPage(event, settings) {
    // Learn more at https://segment.com/docs/connections/spec/page/
    throw new EventNotSupported('page is not supported');
}

/**
 * Handle screen event
 * @param  {SegmentScreenEvent} event
 * @param  {FunctionSettings} settings
 */
async function onScreen(event, settings) {
    // Learn more at https://segment.com/docs/connections/spec/screen/
    throw new EventNotSupported('screen is not supported');
}

/**
 * Handle alias event
 * @param  {SegmentAliasEvent} event
 * @param  {FunctionSettings} settings
 */
async function onAlias(event, settings) {
    // Learn more at https://segment.com/docs/connections/spec/alias/
    throw new EventNotSupported('alias is not supported');
}

/**
 * Handle delete event
 * @param  {SegmentDeleteEvent} event
 * @param  {FunctionSettings} settings
 */
async function onDelete(event, settings) {
    // Learn more at https://segment.com/docs/partners/spec/#delete
    throw new EventNotSupported('delete is not supported');
}
