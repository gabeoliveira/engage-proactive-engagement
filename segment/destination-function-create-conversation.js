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
    twilioNumber,
    twilioAccountSid: accountSid,
    twilioAuthToken: authToken,
  } = settings;
  const timeout = settings.timeout || 0;

  const { space_id: spaceId } = event.context.personas;
  const userId = event.userId;

  const profileAPIEndpoint = `https://profiles.segment.com/v1/spaces/${spaceId}/collections/users/profiles/user_id:${userId}/traits?include=phone,name`;

  try {
    const req = await fetch(profileAPIEndpoint, {
      headers: new Headers({
        Authorization: 'Basic ' + btoa(profilesApiToken + ':'),
        'Content-Type': 'application/json',
      }),
      method: 'get',
    });
    const user = await req.json();

    const { phone, name } = user.traits;
    const client = twilio(accountSid, authToken);
    const activeConversations = await fetchActiveConversations(phone, client);
    const proxyAddress = twilioNumber.find(
      (number) =>
        !activeConversations.some(
          (conversation) =>
            conversation.participantMessagingBinding.proxy_address ===
            `whatsapp:${number}`
        )
    );

    const attributes = {
      name,
      customerAddress: `whatsapp:${phone}`,
      customers: {
        ...user.traits,
      },
    };

    const params = {
      friendlyName: `Conversation with ${userId}`,
      attributes: JSON.stringify(attributes),
      'timers.closed': `PT${timeout}S`,
    };

    await createConversation(phone, proxyAddress, params, settings, client);

  } catch (error) {
    // Retry on connection error
    throw new RetryError(error.message);
  }
}


  async function fetchActiveConversations(phone, client){
    

    try{
      const participantConversations = await client.conversations.v1.participantConversations
        .list({address: `whatsapp:${phone}`, limit: 50});

      return participantConversations
        .filter(conversation => conversation.conversationState === 'active');
      

    }

    catch(error){
      throw new RetryError(error.message);

    }

    
    
  }

async function createConversation(phone, proxyAddress, params, settings, client){
  try {
    // Extract the `flowSid` property from the `settings` object using destructuring
    const { flowSid } = settings;

    // Create a new conversation using the `create` method of the `client.conversations.v1.conversations` object
    const conversation = await client.conversations.v1.conversations
      .create(params);

    // Create a webhook for the conversation using the `create` method of the `client.conversations.v1.conversations(conversation.sid).webhooks` object
    await client.conversations.v1.conversations(conversation.sid)
      .webhooks
      .create({
        'configuration.flowSid': flowSid,
        'configuration.filters': ['onMessageAdded'],
        'configuration.replayAfter': 0,
        target: 'studio'
      });

    // Add a new participant to the conversation using the `create` method of the `client.conversations.v1.conversations(conversation.sid).participants` object
    await client.conversations.v1.conversations(conversation.sid)
      .participants
      .create({
        'messagingBinding.address': `whatsapp:${phone}`,
        'messagingBinding.proxyAddress': `whatsapp:${proxyAddress}`
      });

  } catch (error) {
    // If any of the asynchronous calls within the `try` block fail, catch the error and log an error message to the console
    console.error(`Error creating conversation: ${error}`);
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