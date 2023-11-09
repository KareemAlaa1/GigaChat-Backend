const catchAsync = require('../utils/catchAsync');
const Hashtag = require('../models/hashtag_model');

// extract the hashtags in the tweet description
const extractHashtags = async (tweet) => {
  const tweetId = tweet.id;
  const tweetDescription = tweet.description;
  const words = tweetDescription.split(' ');
  const hashtagWords = words.filter((word) => /^#/.test(word));
  await hashtagWords.forEach(async (hashtagWord) => {
    const hashtag = await Hashtag.findOne({ title: hashtagWord });
    console.log(hashtag);
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
