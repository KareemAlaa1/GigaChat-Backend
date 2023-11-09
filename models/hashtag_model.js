const { mongoose, Schema } = require('mongoose');

const hashtagSchema = new Schema({
  title: {
    type: String,
    required: [true, 'A hashtag must have a title'],
    unique: true,
  },
  count: {
    type: Number,
    default: 1,
    required: true,
  },
  tweet_list: [
    {
      tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
      },
    },
  ],
});

const Hashtag = mongoose.model('Hashtag', hashtagSchema);

module.exports = Hashtag;