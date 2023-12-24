const User = require('../models/user_model');

// extract the hashtags in the tweet description
const deleteMentions = async (tweet) => {
  const tweetId = tweet.id;
  const tweetDescription = tweet.description;
  if (tweetDescription === undefined || tweetDescription === '') return;
  const words = tweetDescription.split(/\s+|\n+/);
  const mentionWords = words.filter(
    (word, index, self) => /^@/.test(word) && self.indexOf(word) === index,
  );

  for (const mentionWord of mentionWords) {
    const username = mentionWord.replace('@', '');
    const mentionedUser = await User.findOne({ username });
    // Check for this mentionedUser if exists in the database
    // if he/she exists, update his/her data and save
    if (mentionedUser) {
      mentionedUser.mentionList.pull(tweetId);
      await mentionedUser.save();
    }
  }
};

module.exports = deleteMentions;
