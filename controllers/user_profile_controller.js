const express = require('express');
const User = require('../models/user_model');
const mongoose = require('mongoose');

/**
 *
 * @param {*} req
 * @param {*} res
 *
 */
exports.getUserTweets = async (req, res) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.count * 1 || 1;
    const skip = (page - 1) * limit;

    const tweets = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
      },
    ])
      .unwind('tweetList')
      .lookup({
        from: 'tweets',
        localField: 'tweetList.tweetId',
        foreignField: '_id',
        as: 'tweetList.tweet',
      })
      .unwind('tweetList.tweet')
      .lookup({
        from: 'users',
        localField: 'tweetList.tweet.userId',
        foreignField: '_id',
        as: 'tweetList.tweet.tweet_owner',
      })
      .match({
        'tweetList.tweet.isDeleted': false,
        'tweetList.tweet.tweet_owner.active': true,
        'tweetList.tweet.tweet_owner.isDeleted': false,
      })
      .skip(skip)
      .limit(limit)
      .unwind('tweetList.tweet.tweet_owner')
      .project({
        tweetList: {
          tweet: {
            id: '$tweetList.tweet._id',
            referredTweetId: 1,
            description: 1,
            likesNum: { $size: '$tweetList.tweet.likersList' },
            repliesNum: 1,
            repostsNum: { $size: '$tweetList.tweet.retweetList' },
            media: 1,
            type: '$tweetList.type',
            creation_time: '$tweetList.tweet.createdAt',
            tweet_owner: {
              id: '$tweetList.tweet.userId',
              username: 1,
              nickname: 1,
              bio: 1,
              profile_image: 1,
              followers_num: {
                $size: '$tweetList.tweet.tweet_owner.followersUsers',
              },
              following_num: {
                $size: '$tweetList.tweet.tweet_owner.followingUsers',
              },
            },
            isLiked: { $in: ['$_id', '$tweetList.tweet.likersList'] },
            isRetweeted: { $in: ['$_id', '$tweetList.tweet.retweetList'] },
          },
        },
      })
      .group({
        _id: '$_id',
        tweetList: { $push: '$tweetList.tweet' },
      });
    res.send({ status: 'success', posts: tweets[0].tweetList });
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};
