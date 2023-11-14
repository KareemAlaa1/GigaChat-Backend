const mongoose = require('mongoose');
const Tweet = require('../models/tweet_model');
const User = require('../models/user_model');
const catchAsync = require('../utils/catchAsync');
const {
  selectNeededInfoForUser,
  selectNeededInfoForTweets,
} = require('../utils/api_features');

/*helper function to get all tweet of  following users */
allTweetsOfFollowingUsers = (followingUsers) => {
  const allTweets = [];
  followingUsers.forEach((followingUser) => {
    followingUser.tweetList.forEach((tweet) => {
      //check if tweetOnwer is the following user or not to check if it's a tweet or retweet
      if (tweet.userId._id.toString() == followingUser._id.toString()) {
        tweet.type = 'tweet';
        allTweets.push({ ...tweet, tweetOwner: followingUser });
      } else {
        tweet.type = 'retweet';
        allTweets.push({
          ...tweet,
          tweetOwner: tweet.userId,
          retweeter: followingUser,
        });
      }
    });
  });
  return allTweets;
};


exports.getFollowingTweets = catchAsync(
  async (
    req,
    res,
    next = (e) => {
      res.send(500).send(e);
    },
  ) => {
    
    const user = await User.findById(req.user._id)
      .lean()
      .populate({
        path: 'followingUsers',
        populate: {
          path: 'tweetList',
          model: 'Tweet',
          populate: {
            path: 'userId',
            model: 'User',
          },
        },
      })
      .exec();
    req.user = user;
    const { followingUsers } = user;

    // construct allTweets array containnig all tweets which each tweet element contain its user
    const allTweets = allTweetsOfFollowingUsers(followingUsers);

    // filter deleted tweets and replies
    var tweets = allTweets.filter(
      (tweet) => tweet.isDeleted !== true && tweet.type !== 'reply',
    );

    // extract useful info for tweetOwner and following user if they are not the same
    // in case tweetOnwer wasn't the following user this means the following user retweet this tweet
    tweets = await Promise.all(
      tweets.map(async (tweet) => {
        await selectNeededInfoForUser(tweet, req);
        return tweet;
      }),
    );

    // extract useful info for each tweet and send it
    res.status(200).send(await selectNeededInfoForTweets(tweets, req));
  },
);
