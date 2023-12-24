const Notification = require('../models/notification_model');
const AppError = require('../utils/app_error');
const catchAsync = require('../utils/catch_async');
const User = require('../models/user_model');
const dotenv = require('dotenv');
dotenv.config({ path: './config/dev.env' });

const pushNotificationEndpoint = "https://fcm.googleapis.com/fcm/send";


async function pushNotification(notification, notifiedId) {
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
      body: notification.description
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
  console.log(x,options);
  //fetch using options
  await fetch(pushNotificationEndpoint, options);
}




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




exports.addMessageNotification = async (notifier, notified, message) => {

  const notification = await Notification.create({
    description: `${notifier.username} sent you a message`,
    type: 'message',
    notifierProfileImage: notifier.profileImage,
    destination: notified._id,
    notifier: notifier._id,
    notified: notified._id,
    creation_time: Date.now()
  })

  await pushNotification(notification,notified._id);
  return notification
}
exports.addFollowNotification = async (notifier, notified) => {
  if(notifier._id==notified._id)
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

exports.addLikeNotification = async (notifier, tweet) => {
  if(notifier._id==tweet.userId)
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

exports.addReplyNotification = async (notifier, notified, replyId) => {
  if(notifier._id==notified._id)
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
exports.addQuoteNotification = async (notifier, notified, quoteId) => {
  if(notifier._id==notified._id)
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

exports.addRetweetNotification = async (notifier, tweet,retweet) => {
  if(notifier._id==tweet.userId)
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

exports.getNotificationsCount = async (req, res) => {

  const notifications = await Notification.find({ notified: req.user._id, seen: false });

  res.status(200).json({
    status: 'success',
    data: {
      notificationsCount: notifications.length,
    },
  })
}

