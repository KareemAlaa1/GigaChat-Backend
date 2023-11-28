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
  await hashtagWords.forEach(async (hashtagWord) => {
    const hashtag = await Hashtag.findOne({ title: hashtagWord });
    // Check for this hashtage if exists in database
    // if exists update its data and save
    if (hashtag) {
      hashtag.count++;
      hashtag.tweet_list.push(tweetId);
      hashtag.save();
    } else {
      // not exist so create it and save in database
      new Hashtag({
        title: hashtagWord,
        count: 1,
        tweet_list: [tweetId],
      }).save();
    }
  });
};

module.exports = extractHashtags;
