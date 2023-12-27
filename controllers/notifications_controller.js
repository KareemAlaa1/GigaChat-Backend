const Notification = require('../models/notification_model');
const AppError = require('../utils/app_error');
const catchAsync = require('../utils/catch_async');
const User = require('../models/user_model');
const dotenv = require('dotenv');
dotenv.config({ path: './config/dev.env' });

const pushNotificationEndpoint = "https://fcm.googleapis.com/fcm/send";

/**
 * Controller for handling tweet-related operations.
 * @module controllers/notifications_controller
 */

/**
 * Sends a push notification to a user.
 *
 * @function pushNotification
 * @memberof module:controllers/notifications_controller
 * @async
 * @param {Object} notification - The notification object.
 * @param {string} notifiedId - The ID of the user to whom the notification is sent.
 * @param {string} [description] - The description content of the notification (optional).
 * @returns {Promise<void>} A promise that resolves when the push notification is sent.
 *
 * @example
 * const notification = { /notification information / };
* const notifiedId = '123';
* const description = 'New notification received!';
* await notificationsController.pushNotification(notification, notifiedId, description);
* __________________________________________________________________________________________
  */
async function pushNotification(notification, notifiedId,description) {
  const user = await User.findById(notifiedId);
  const push_token=user.push_token;
  if(!push_token) {
    return console.log('No push token found');
  }
  let notificationBody = notification;
  const requestBody = {
    // Your FCM message payload goes here
    // For example:
    to: push_token,
    notification:{
      title: notification.description,
      body: description|| notification.description
    },
    data: {
      notification:notificationBody
    },
  };


  const options = {
    method: "POST",
    headers: {
      'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody)
  };
  let x = process.env.FCM_SERVER_KEY
  //fetch using options
  await fetch(pushNotificationEndpoint, options);
}





/**
 * Extracts mentions from a tweet description.
 *
 * @function getMentions
 * @memberof module:controllers/notifications_controller
 * @param {Object} tweet - The tweet object containing the description.
 * @param {string} tweet.description - The description of the tweet containing mentions.
 * @returns {Object} An object containing unique mentions found in the tweet.
 *
 * @example
 * const tweet = {
 *   description: "Hey, @user1! Check out this tweet mentioning @user2 and @user3."
 * };
 * const mentions = notificationsController.getMentions(tweet);
 * console.log(mentions);
 * // Output: { user1: true, user2: true, user3: true }
 * __________________________________________________________________________________________
 */
const getMentions=(tweet)=> {
  const mentions = {};
  const words = tweet.description.split(' ');
  for (let i = 0; i < words.length; i++) {
    if (words[i][0] == '@') {
      mentions[words[i].substring(1)] = true;
    }
  }
  return mentions;
}
exports.getMentions = getMentions;



/**
 * Adds a message notification for a user.
 *
 * @function addMessageNotification
 * @memberof module:controllers/notifications_controller
 * @async
 * @param {Object} notifier - The user who sent the message.
 * @param {Object} notified - The user who receives the message.
 * @param {string} message - The content of the message.
 * @returns {Promise<Object>} A promise that resolves with the created notification.
 *
 * @example
 * const notifier = { _id: '123', username: 'sender', profileImage: 'sender.jpg' };
 * const notified = { _id: '456' };
 * const message = 'Hello!';
 * const notification = await notificationsController.addMessageNotification(notifier, notified, message);
 * console.log(notification);
 * __________________________________________________________________________________________
 */
exports.addMessageNotification = async (notifier, notified, message) => {

  const notification = await Notification.create({
    description: `${notifier.username} sent you a message`,
    type: 'message',
    notifierProfileImage: notifier.profileImage,
    destination: notifier._id,
    notifier: notifier._id,
    notified: notified._id,
    creation_time: Date.now()
  })

  await pushNotification(notification,notified._id, message);
  return notification
}

/**
 * Adds a follow notification for a user.
 *
 * @function addFollowNotification
 * @memberof module:controllers/notifications_controller
 * @async
 * @param {Object} notifier - The user who started following.
 * @param {Object} notified - The user who got followed.
 * @returns {Promise<Object>} A promise that resolves with the created notification.
 *
 * @example
 * const notifier = { _id: '123', username: 'follower', profileImage: 'follower.jpg' };
 * const notified = { _id: '456' };
 * const notification = await notificationsController.addFollowNotification(notifier, notified);
 * console.log(notification);
 * __________________________________________________________________________________________
 */
exports.addFollowNotification = async (notifier, notified) => {
  if(notifier._id.toString()==notified._id.toString())
  {
    return;
  }
  const notification = await Notification.create({
    description: `${notifier.username} started following you`,
    type: 'follow',
    notifierProfileImage: notifier.profileImage,
    destination: notifier._id,
    notifier: notifier._id,
    notified: notified._id,
    creation_time: Date.now(),

  });

  await pushNotification(notification,notified._id);

  return notification;

}

//values: ['like', 'reply', 'mention', 'retweet', 'follow'],


/**
 * Adds a like notification for a tweet.
 *
 * @function addLikeNotification
 * @memberof module:controllers/notifications_controller
 * @async
 * @param {Object} notifier - The user who liked the tweet.
 * @param {Object} tweet - The tweet that got liked.
 * @returns {Promise<Object>} A promise that resolves with the created notification.
 *
 * @example
 * const notifier = { _id: '123', username: 'liker', profileImage: 'liker.jpg' };
 * const tweet = { _id: '789', userId: '456' };
 * const notification = await notificationsController.addLikeNotification(notifier, tweet);
 * console.log(notification);
 * __________________________________________________________________________________________
 */
exports.addLikeNotification = async (notifier, tweet) => {

  if(notifier._id.toString()===tweet.userId.toString())
  {
    return;
  }
  const notification = await Notification.create({
    description: `${notifier.username} liked your tweet`,
    type: 'like',
    notifierProfileImage: notifier.profileImage,

    destination: tweet._id,
    notifier: notifier._id,
    notified: tweet.userId,
    creation_time: Date.now(),

  });
  await pushNotification(notification, tweet.userId);
  return notification;
}

/**
 * Adds a reply notification for a user's tweet.
 *
 * @function addReplyNotification
 * @memberof module:controllers/notifications_controller
 * @async
 * @param {Object} notifier - The user who replied to the tweet.
 * @param {Object} notified - The user who owns the tweet being replied to.
 * @param {Object} replyId - The ID of the reply.
 * @returns {Promise<Object>} A promise that resolves with the created notification.
 *
 * @example
 * const notifier = { _id: '123', username: 'replier', profileImage: 'replier.jpg' };
 * const notified = { _id: '456' };
 * const replyId = { _id: '789' };
 * const notification = await notificationsController.addReplyNotification(notifier, notified, replyId);
 * console.log(notification);
 * __________________________________________________________________________________________
 */

exports.addReplyNotification = async (notifier, notified, replyId) => {
  if(notifier._id.toString()==notified._id.toString())
  {
    return;
  }
  const notification = await Notification.create({
    description: `${notifier.username} replied to your tweet`,
    type: 'reply',
    notifierProfileImage: notifier.profileImage,
    destination: replyId._id,
    notifier: notifier._id,
    notified: notified._id,
    creation_time: Date.now(),

  });
  await pushNotification(notification, notified._id);
  return notification;
}

/**
 * Adds a quote notification for a user's tweet.
 *
 * @function addQuoteNotification
 * @memberof module:controllers/notifications_controller
 * @async
 * @param {Object} notifier - The user who quoted the tweet.
 * @param {Object} notified - The user who owns the tweet being quoted.
 * @param {Object} quoteId - The ID of the quoted tweet.
 * @returns {Promise<Object>} A promise that resolves with the created notification.
 *
 * @example
 * const notifier = { _id: '123', username: 'quoter', profileImage: 'quoter.jpg' };
 * const notified = { _id: '456' };
 * const quoteId = { _id: '789' };
 * const notification = await notificationsController.addQuoteNotification(notifier, notified, quoteId);
 * console.log(notification);
 * __________________________________________________________________________________________
 */
exports.addQuoteNotification = async (notifier, notified, quoteId) => {
  if(notifier._id.toString()==notified._id.toString())
  {
    return;
  }
  const notification = await Notification.create({
    description: `${notifier.username} quoted your tweet`,
    type: 'quote',
    notifierProfileImage: notifier.profileImage,

    destination: quoteId._id,
    notifier: notifier._id,
    notified: notified._id,
    creation_time: Date.now(),

  });
  await pushNotification(notification, notified._id);
  return notification;
}



/**
 * Adds a retweet notification for a user's tweet.
 *
 * @function addRetweetNotification
 * @memberof module:controllers/notifications_controller
 * @async
 * @param {Object} notifier - The user who retweeted the tweet.
 * @param {Object} tweet - The original tweet that got retweeted.
 * @param {Object} retweet - The retweet information.
 * @returns {Promise<Object>} A promise that resolves with the created notification.
 *
 * @example
 * const notifier = { _id: '123', username: 'retweeter', profileImage: 'retweeter.jpg' };
 * const tweet = { _id: '456', userId: '789' };
 * const retweet = { / retweet information / };
* const notification = await notificationsController.addRetweetNotification(notifier, tweet, retweet);
* console.log(notification);
* __________________________________________________________________________________________
 */
exports.addRetweetNotification = async (notifier, tweet,retweet) => {
  if(notifier._id.toString()==tweet.userId.toString())
  {
    return;
  }
  const notification = await Notification.create({
    description: `${notifier.username} retweeted your tweet`,
    type: 'retweet',
    notifierProfileImage: notifier.profileImage,

    destination: tweet._id,
    notifier: notifier._id,
    notified: tweet.userId,
    creation_time: Date.now(),

  });
  await pushNotification(notification, tweet.userId);
  return notification;
}


/**
 * Adds a mention notification for users mentioned in a tweet.
 *
 * @function addMentionNotification
 * @memberof module:controllers/notifications_controller
 * @async
 * @param {Object} notifier - The user who mentioned others in the tweet.
 * @param {Object} tweet - The tweet containing mentions.
 * @returns {Promise<void>} A promise that resolves when all mention notifications are created.
 *
 * @example
 * const notifier = { _id: '123', username: 'mentioner', profileImage: 'mentioner.jpg' };
 * const tweet = { id: '456', /tweet information with mentions / };
* await notificationsController.addMentionNotification(notifier, tweet);
* __________________________________________________________________________________________
  */
exports.addMentionNotification = async (notifier, tweet) => {

  const mentions = getMentions(tweet);
  for(let i in mentions)  {
    if(i==notifier.username) continue;
    const notified = await User.findOne({username:i});
    if(!notified) continue;
    const notification= await Notification.create({
      description: `${notifier.username} mentioned you in a tweet`,
      type: 'mention',
      notifierProfileImage: notifier.profileImage,

      destination: tweet.id,
      notifier: notifier._id,
      notified: notified._id,
      creation_time: Date.now(),

    });
    await pushNotification(notification, notified._id);
  }

}
/**
 * Retrieves notifications for the authenticated user with optional pagination.
 *
 * @function getNotifications
 * @memberof module:controllers/notifications_controller
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Error} Throws an error if there is an issue during the retrieval of notifications.
 * @returns {Promise<void>} A promise that resolves with the retrieved notifications.
 *
 * @example
 * // Example usage in a route:
 * // app.get('/notifications', authController.protect, notificationController.getNotifications);
 *
 * __________________________________________________________________________________________
 */
exports.getNotifications = async (req, res) => {
  //get Notifications using Pages and limit from query
  const page = req.query.page * 1 || 1;
  const limit = req.query.count * 1 || 10;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ notified: req.user._id })
    .skip(skip).limit(limit).sort({ creation_time: -1 });

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
    },
  })
}

// exports.deleteNotification = async (req, res) => {
//   const notification = await Notification.findByIdAndDelete(req.params.notificationId);
//   if(!notification) {
//     return next(new AppError('No notification found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       notification,
//     },
//   });
// }


/**
 * Marks all notifications for the authenticated user as seen.
 *
 * @function markAllNotificationsAsSeen
 * @memberof module:controllers/notifications_controller
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Error} Throws an error if there is an issue while marking notifications as seen.
 * @returns {Promise<void>} A promise that resolves after marking notifications as seen.
 *
 * @example
 * // Example usage in a route:
 * // app.put('/notifications/mark-as-seen', authController.protect, notificationController.markAllNotificationsAsSeen);
 *
 * __________________________________________________________________________________________
 */
exports.markAllNotificationsAsSeen = async (req, res) => {
  //update until one is not seen
  const notifications = await Notification.updateMany({ notified: req.user._id, seen: false }, { seen: true });

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
    },
  })
}


/**
 * Retrieves the count of unread notifications for the authenticated user.
 *
 * @function getNotificationsCount
 * @memberof module:controllers/notifications_controller
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Error} Throws an error if there is an issue during the retrieval of notifications count.
 * @returns {Promise<void>} A promise that resolves with the count of unread notifications.
 *
 * @example
 * // Example usage in a route:
 * // app.get('/notifications/count', authController.protect, notificationController.getNotificationsCount);
 *
 * __________________________________________________________________________________________
 */
exports.getNotificationsCount = async (req, res) => {

  const notifications = await Notification.find({ notified: req.user._id, seen: false });

  res.status(200).json({
    status: 'success',
    data: {
      notificationsCount: notifications.length,
    },
  })
}

