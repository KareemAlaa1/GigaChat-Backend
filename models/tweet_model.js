const { mongoose, Schema } = require('mongoose');

const tweetSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
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
      link: {
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
  replies_list: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
    },
  ],
  likers_list: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  retweet_list: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
    },
  ],
  quote_retweet_list: [
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
  },
  creation_time: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;
