const Hashtag = require('../models/hashtag_model');

// update the hashtags when tweet is deleted
const updateHashtags = async (tweet) => {
  try {
    const tweetId = tweet.id;
    const tweetDescription = tweet.description;
    if (tweetDescription === undefined || tweetDescription === '') return;
    const words = tweetDescription.split(' ');
    const hashtagWords = words.filter(
      (word, index, self) => /^#/.test(word) && self.indexOf(word) === index,
    );
    for (const hashtagWord of hashtagWords) {
      const hashtag = await Hashtag.findOne({ title: hashtagWord });
      // Check for this hashtag if it exists in the database
      // if it exists, update its data and save
      if (hashtag) {
        hashtag.count--;
        hashtag.tweet_list = hashtag.tweet_list.filter(
          (tweet) => tweet != tweetId,
        );
        await hashtag.save();
      }
    }
  } catch (error) {
    // Handle and log errors
    return res.status(500).send({ error: error.message });
  }
};

module.exports = updateHashtags;
