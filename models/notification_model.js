const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  description: {
    type: String,
  },
  type: {
    type: String,
    required: [true, 'A notification must have a type'],
    enum: {
      values: ['like', 'reply','quote', 'mention', 'retweet', 'follow'],
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
  notified: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'A notification must have a notified user'],
    ref: 'User',
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
