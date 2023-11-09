const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A tweet must have an owner'],
  },
  description: {
    type: String,
    required: [true, 'A tweet must have a description'],
    maxlength: [
      280,
      'the description must have less or equal then 280 characters',
    ],
  },
  media: [
    // array of pairs {link,type}
    {
      data: {
        type: String,
        required: [true, 'A media must have a link'],
      },
      type: {
        type: String, // jpg , mp4 , gif
        enum: {
          values: ['jpg', 'mp4', 'gif'],
          message: 'media type is either: jpg, mp4, gif',
        },
      },
    },
  ],
  views: {
    type: Number,
    default: 0,
  },
  repliesList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
    },
  ],
  likersList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  retweetList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
    },
  ],
  quoteRetweetList: [
    // for future updates
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
    },
  ],
  type: {
    type: String,
    required: [true, 'A tweet must have a type'],
    enum: {
      values: ['tweet', 'quote', 'reply'],
      message: 'tweet type is either: tweet  quote, reply',
    },
    validate: {
      validator: function (val) {
        if (val !== 'tweet' && this.referredTweetId === undefined) return false;
      },
      message: 'Tweet of type qoute or reply must have referred tweet',
    },
  },
  referredTweetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;
