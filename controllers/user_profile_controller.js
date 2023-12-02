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
    const page = req.body.page * 1 || 1;
    const limit = req.body.count * 1 || 1;
    const skip = (page - 1) * limit;
    username = req.params.username;
    const user = await User.findOne({ username }).select('_id');
    const tweets = await User.aggregate([
      {
        $match: { _id: user._id },
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
            repliesNum: '$tweetList.tweet.repliesCount',
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

exports.getUserLikedTweets = async (req, res) => {
  try {
    const page = req.body.page * 1 || 1;
    const limit = req.body.count * 1 || 1;
    const skip = (page - 1) * limit;
    username = req.params.username;
    const user = await User.findOne({ username }).select('_id');
    const tweets = await User.aggregate([
      {
        $match: { _id: user._id },
      },
    ])
      .project({
        likedTweets: 1,
      })
      .unwind('likedTweets')
      .lookup({
        from: 'tweets',
        localField: 'likedTweets',
        foreignField: '_id',
        as: 'likedTweets',
      })
      .unwind('likedTweets')
      .lookup({
        from: 'users',
        localField: 'likedTweets.userId',
        foreignField: '_id',
        as: 'likedTweets.tweet_owner',
      })
      .match({
        'likedTweets.isDeleted': false,
        'likedTweets.tweet_owner.active': true,
        'likedTweets.tweet_owner.isDeleted': false,
        'likedTweets.type': 'tweet',
      })
      .skip(skip)
      .limit(limit)
      .unwind('likedTweets.tweet_owner')
      .project({
        likedTweets: {
          id: '$likedTweets._id',
          referredTweetId: 1,
          description: 1,
          likesNum: { $size: '$likedTweets.likersList' },
          repliesNum: '$likedTweets.repliesCount',
          repostsNum: { $size: '$likedTweets.retweetList' },
          media: 1,
          type: 1,
          creation_time: '$tweetList.tweet.createdAt',
          tweet_owner: {
            id: '$likedTweets.userId',
            username: 1,
            nickname: 1,
            bio: 1,
            profile_image: 1,
            followers_num: {
              $size: '$likedTweets.tweet_owner.followersUsers',
            },
            following_num: {
              $size: '$likedTweets.tweet_owner.followingUsers',
            },
          },
          isLiked: 'true',
          isRetweeted: { $in: ['$_id', '$likedTweets.retweetList'] },
        },
      })
      .group({
        _id: '$_id',
        likedTweets: { $push: '$likedTweets' },
      });
    res.send({ status: 'success', posts: tweets[0].likedTweets });
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};
