# Twilio Engage Proactive Engagement

# Table of Contents

# Use Case

This solution creates a bridge between **Twilio Engage** and **Twilio Flex**, creating automated WhatsApp engagements from a User Journey on Engage depending on a pre-defined trigger. It's particularly useful for:

* Lead Conversion
* Customer Support

## Business Value

Engaging customers or leads automatically decreases the response time and therefore helps increasing lead conversion. It also saves agents time as they don't have to create conversations manually and wait for customers' replies.

# User Journey

![User Journey](assets/Proactive%20Engagement%20with%20Engage%20and%20Flex%20-%20EN.jpeg)

# How to Setup

## Pre-requisites
 * A Twilio Engage account
 * A Twilio Flex account
 * An approved WhatsApp number

## Step-by-step

### WhatsApp as a Destination
1. In your Engage account, go to **Connections > Destinations** and click on **Add Destination**
   ![Add Destination](assets/Destinations_-_Segment.png)
2. Click on **Functions** and then on **New Function**
   ![New Function](assets/Notification_Center.png)
3. Select **Destination** as the Function Type and then click on **Build**
4. Copy the content on [destination-function-whatsapp.js](segment/destination-function-whatsapp.js) and replace the function automatically created with it
5. In the right panel, select **Settings** and add the following settings (you are going to add the values to these settings later):

| Setting Name        | Type   | Sensitive | Description                                                                                                         |
|---------------------|--------|-----------|---------------------------------------------------------------------------------------------------------------------|
| contentSid          | String | No        | The content you're going to use. You can create content [here](https://console.twilio.com/us1/develop/sms/content-editor).                                                       |
| includeTraits       | Array  | No        | The profile traits you wish to include. This is set up so you can use different placeholders as part of the content |
| messagingServiceSid | String | No        | The Messaging Service that is going to be used with Content API. You can set it up [here](https://console.twilio.com/us1/develop/sms/services). Don't forget to add a WhatsApp number to it                            |
| profilesApiToken    | String | Yes       | The Segment Profiles API token used to obtain users' traits. You can set on up by going to **Profiles > Profiles Settings > API Access** (you can use the same one for all functions described here).                                |
| twilioAccountSid    | String | No        | Your Twilio Account SID. Obtainable here.                                                                           |
| twilioAuthToken     | String | Yes       | Your Twilio Account Authentication Token. Obtainable along with the Account SID                                     |

6. With the Settings ready, you can now click on **Configure** and create a name for your Destination Function. Optionally, you can set up a description and a logo as well
7. Now that the Function is created, it's time to connect it as a destination. Click on **Connect Destination**
   
   ![Connect Destination](assets/dsad_-_Functions_-_Segment.png)
8. Select the data source associated your User's profile (it's going to have the same Space name as the one you used to create the API token, as the example below), and click on **Confirm Source**
   
   ![Data source](assets/Connect_dsad_-_twilio-enghub_-_Segment.png)
9.  Fill the settings with the obtained values
10. Enable the Destination by clicking on the toggle as below:

![](assets/dsad__LATAM_Engineering_Hub__Settings_for_Personas__6__-_Segment.png)

**IMPORTANT NOTE:** Because Conversations currently works separetely from the Content API, make sure your Messaging Service has exactly **ONE** WhatsApp number.

