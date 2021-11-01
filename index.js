import { Expo } from 'expo-server-sdk';


// EXpo push notification is working based on Token.
// Server should save the toekn when user enabled the PN
// e.g. .../api/savetoken


const getToken = function(email) {
  const email2toekn = {
    '2@2.com': 'gL7d9fMjttdnQ6IblEeErK',
    'yuruk.nurcan@gmail.com': 'gL7d9fMjttdnQ6IblEeErK',
  }

  let token = 'ExponentPushToken['+email2toekn[email]+']';

  return token;
}

const sendingPN = function(pushToken, msg) {
  // Create a new Expo SDK client
  // optionally providing an access token if you have enabled push security
  let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);    
  }

  // Create the messages that you want to send to clients
  let messages = [];

  // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: pushToken,
      sound: 'default',
      body: msg,
      data: { withSome: 'Status Updated!' },
    })
  
  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (err) {
        console.error(err);
      }
    }
  })();  
}


var args = process.argv.slice(2);

if(args.length == 2){
  let token = getToken(args[0]);
  if(token) {
    sendingPN(token, args[1]);  
  } else {
    console.log('Email is NOT blind with device yet.');
  }
} else if(args.length == 1) {
  console.log('Missing message content');
} else {  
  console.log('Missing client token');
}
