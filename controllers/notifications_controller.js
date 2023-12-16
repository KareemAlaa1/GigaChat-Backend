const Notification = require('../models/notification_model');
const AppError = require('../utils/app_error');
const catchAsync = require('../utils/catch_async');
const User = require('../models/user_model');


function getMentions(tweet) {
  const mentions = {};
  const words = tweet.description.split(' ');
  for (let i = 0; i < words.length; i++) {
    if (words[i][0] == '@') {
      mentions[words[i].substring(1)] = true;
    }
  }
  return mentions;
}
exports.addFollowNotification = async (notifier, notified) => {

  const notification = await Notification.create({
    description: `${notifier.username} started following you`,
    type: 'follow',
    destination: notified.username,
    notifier: notifier._id,
    notified: notified._id,
    creation_time: Date.now(),

  });

  return notification;

}

//values: ['like', 'reply', 'mention', 'retweet', 'follow'],

exports.addLikeNotification = async (notifier, tweet) => {

  const notification = await Notification.create({
    description: `${notifier.username} liked your tweet`,
    type: 'like',
    destination: tweet._id,
    notifier: notifier._id,
    notified: tweet.userId,
    creation_time: Date.now(),

  });

  return notification;
}

exports.addReplyNotification = async (notifier, notified, replyId) => {
  const notification = await Notification.create({
    description: `${notifier.username} replied to your tweet`,
    type: 'reply',
    destination: replyId._id,
    notifier: notifier._id,
    notified: notified._id,
    creation_time: Date.now(),

  });
  return notification;
}
exports.addQuoteNotification = async (notifier, notified, quoteId) => {
  const notification = await Notification.create({
    description: `${notifier.username} quoted your tweet`,
    type: 'quote',
    destination: quoteId._id,
    notifier: notifier._id,
    notified: notified._id,
    creation_time: Date.now(),

  });
  return notification;
}

exports.addRetweetNotification = async (notifier, tweet,retweet) => {

  const notification = await Notification.create({
    description: `${notifier.username} retweeted your tweet`,
    type: 'retweet',
    destination: tweet._id,
    notifier: notifier._id,
    notified: tweet.userId,
    creation_time: Date.now(),

  });

  return notification;
}

exports.addMentionNotification = async (notifier, tweet) => {
  const mentions = getMentions(tweet);
  for(let i in mentions)  {
    if(i==notifier.username) continue;
    console.log(i);
    const notified = await User.findOne({username:i});
    if(!notified) continue;
    const notification= await Notification.create({
      description: `${notifier.username} mentioned you in a tweet`,
      type: 'mention',
      destination: tweet.id,
      notifier: notifier._id,
      notified: notified._id,
      creation_time: Date.now(),

    });
    console.log(notification);
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

