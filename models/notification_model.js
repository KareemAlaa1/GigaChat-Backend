const mongoose = require('mongoose');
const defaultImage = 'https://cdn.discordapp.com/attachments/972107703973457930/1184983163399852032/image.png?ex=658df492&is=657b7f92&hm=d17faa50f2cfb592762e714603e9ba875676855e2be97902ad752306dbc24a42&';

const notificationSchema = new mongoose.Schema({
  description: {
    type: String,
  },
  type: {
    type: String,
    required: [true, 'A notification must have a type'],
    enum: {
      values: ['like', 'reply','quote', 'mention', 'retweet', 'follow', 'message'],
      message:
        'notification type is either: like, reply, mention, retweet, follow',
    },
  },
  destination: {
    type: String,
    required: [true, 'A notification must have a destination'],
  },
  seen: {
    type: Boolean,
    default: false,
  },
  creation_time: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  notifier: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'A notification must have a notifier'],
    ref: 'User',
  },
  notifierProfileImage: {
    type: String,
    default: defaultImage,

  },
  notified: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'A notification must have a notified user'],
    ref: 'User',
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
