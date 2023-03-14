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
| contentSid          | String | No        | The content you're going to use. You can create content here.                                                       |
| includeTraits       | Array  | No        | The profile traits you wish to include. This is set up so you can use different placeholders as part of the content |
| messagingServiceSid | String | No        | The Messaging Service that is going to be used with Content API. You can set it up here.                            |
| profilesApiToken    | String | Yes       | The Segment Profiles API token used to obtain users' traits. You can set on up here.                                |
| twilioAccountSid    | String | No        | Your Twilio Account SID. Obtainable here.                                                                           |
| twilioAuthToken     | String | Yes       | Your Twilio Account Authentication Token. Obtainable along with the Account SID                                     |

6. With the Settings ready, you can now click on **Configure** and create a name for your Destination Function. Optionally, you can set up a description and a logo as well