// Learn more about destination functions API at
// https://segment.com/docs/connections/destinations/destination-functions

/**
 * Handle track event
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
 */
async function onTrack(event, settings) {
    // Learn more at https://segment.com/docs/connections/spec/track/

    const { profilesApiToken, twilioNumber, workspaceSid, workflowSid } = settings;

    const { space_id : spaceId } = event.context.personas;

    const userId = event.userId;

    const profileAPIEndpoint = `https://profiles.segment.com/v1/spaces/${spaceId}/collections/users/profiles/user_id:${userId}/traits?include=phone,name`; 
  
    try {
        const req = await fetch(profileAPIEndpoint, {
            headers: new Headers({
            Authorization: 'Basic ' + btoa(profilesApiToken + ':'),
            'Content-Type': 'application/json'
            }),
            method: 'get'
        });
        const user = await req.json();
  
        const { phone, name } = user.traits;

        const activeConversations = await fetchActiveConversations(phone, settings);

        const proxyAddress = twilioNumber.find(number=> !activeConversations.some(conversation => conversation.participantMessagingBinding.proxy_address === `whatsapp:${number}` ));

        const params = {
            channel: {
                type: 'whatsapp',
                initiated_by: 'api',
                participants: [
                  {
                    address: `whatsapp:${phone}`,
                    proxy_address:  `whatsapp:${proxyAddress}`
                  }
                ]
              }, 
              routing: {
                properties: {
                  workspace_sid: workspaceSid,
                  workflow_sid: workflowSid,
                  task_channel_unique_name: 'chat',
                  attributes: {
                    name,
                    customerAddress: `whatsapp:${phone}`,
                    customers: {
                        ...user.traits
                    }
                  }
                }
              }
        }



        await createInteracion(params, settings);

    } catch (error) {
      // Retry on connection error
      throw new RetryError(error.message);
    }
  
  }

  async function fetchActiveConversations(phone, settings){
    const accountSid = settings.twilioAccountSid;
    const authToken = settings.twilioAuthToken;
    const client = twilio(accountSid,authToken);

    console.log(phone);

    try{
      const participantConversations = await client.conversations.v1.participantConversations
        .list({address: `whatsapp:${phone}`, limit: 10000});

      return participantConversations
        .filter(conversation => conversation.conversationState === 'active');
      

    }

    catch(error){
      throw new RetryError(error.message);

    }

    
    
  }

  async function createInteracion(params, settings) {
    const accountSid = settings.twilioAccountSid;
    const authToken = settings.twilioAuthToken;

    const contentApiEndpoint = `https://flex-api.twilio.com/v1/Interactions`;

    const encodedParams = new URLSearchParams();
    encodedParams.append('Channel', JSON.stringify(params.channel));
    encodedParams.append('Routing', JSON.stringify(params.routing));


    try{
        const req = await fetch(contentApiEndpoint, {
            headers: new Headers({
            Authorization: 'Basic ' + btoa(accountSid + ':' + authToken),
            'Content-Type': 'application/x-www-form-urlencoded'
            }),
            method: 'post',
            body: encodedParams
        })
        
        const interaction = await req.json();


        console.log(JSON.stringify(interaction));
        console.log(`Interaction created with SID:${interaction.sid}`);
            

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