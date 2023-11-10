const mongoose = require('mongoose');
const Tweet = require('../models/tweet_model');
const User = require('../models/user_model');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/api_features');

/**TODO:
 * 1 . add auth
 * */
allTweetsOfFollowingUsers = (followingUsers) => {
  const allTweets = [];
  followingUsers.forEach((followingUser) => {
    followingUser.tweetList.forEach((tweet) => {
      allTweets.push({ ...tweet, tweetOwner: followingUser });
    });
  });
  return allTweets;
};

selectNeededInfoForUser = async (tweet, req) => {
  req.query.type = 'array';
  req.query.fields = '_id,username,nickname,bio,profileImage,followingUsers,followersUsers';
  const apiFeatures = new APIFeatures(
    [tweet.tweetOwner],
    req.query,
  ).limitFields();
  tweet.tweetOwner = await apiFeatures.query;
};

selectNeededInfoForTweets = async (tweets, req) => {
  req.query.type = 'array';
  req.query.fields =
    '_id,description,media,type,referredTweetId,createdAt,tweetOwner';
  const apiFeatures = new APIFeatures(tweets, req.query)
    .sort()
    .paginate()
    .limitFields();
  return await apiFeatures.query;
};

exports.getFollowingTweets = catchAsync(
  async (
    req,
    res,
    next = (e) => {
      res.send(400).send(e);
    },
  ) => {
    const user = await User.findById('654abf68d532cc9d284b6f90')
      .lean()
      .populate({
        path: 'followingUsers',
        populate: {
          path: 'tweetList',
          model: 'Tweet',
        },
      })
      .exec();
    const { followingUsers } = user;
    // construct allTweets array containnig all tweets which each tweet element contain its user
    const allTweets = allTweetsOfFollowingUsers(followingUsers);

    // filter deleted tweets and anu not tweet type
    var tweets = allTweets.filter(
      (tweet) => tweet.isDeleted !== true && tweet.type !== 'reply',
    );

    // itterate on each tweet owner to extract useful info for tweetOwner
    tweets = await Promise.all(
      tweets.map(async (tweet) => {
        await selectNeededInfoForUser(tweet, req);
        return tweet;
      }),
    );
    // itterate on each tweet owner to extract useful info for tweet and send it
    res.status(200).send(await selectNeededInfoForTweets(tweets, req));
  },
);
