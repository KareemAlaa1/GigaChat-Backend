const mongoose = require('mongoose');
const Tweet = require('../models/tweet_model');
const User = require('../models/user_model');
const catchAsync = require('../utils/catchAsync');

/**TODO:
 * 1 . add pagination
 * 2 . add sort
 * 3 . add auth
 * */
exports.getFollowingTweets = catchAsync(
  async (
    req,
    res,
    next = (e) => {
      res.send(400).send(e);
    },
  ) => {
    const user = await User.findById('654abf68d532cc9d284b6f90')
      .populate({
        path: 'followingUsers',
        populate: {
          path: 'tweetList',
          model: 'Tweet',
        },
      })
      .exec();
    const tweets = [];
    const { followingUsers } = user;
    followingUsers.forEach((followingUser) =>
      tweets.push(...followingUser.tweetList),
    );
    res.status(200).send(tweets);
  },
);
