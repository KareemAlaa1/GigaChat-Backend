const Hashtag = require('../models/hashtag_model');

// extract the hashtags in the tweet description
const extractHashtags = async (tweet) => {
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
      hashtag.count++;
      hashtag.tweet_list.push(tweetId);
      await hashtag.save();
    } else {
      // not exist, so create it and save in the database
      await new Hashtag({
        title: hashtagWord,
        count: 1,
        tweet_list: [tweetId],
      }).save();
    }
  }
};

const deleteHashtags = async (tweet) => {
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
      hashtag.tweet_list.pull(tweetId);

      if (hashtag.count == 0) {
        await Hashtag.findOneAndDelete({ title: hashtagWord });
      } else {
        await hashtag.save();
      }
    }
  }
};

module.exports = extractHashtags;
