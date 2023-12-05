const mongoose = require('mongoose');
const Tweet = require('../models/tweet_model');
const User = require('../models/user_model');

exports.getUserDatabyId = async (id) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $project: {
        _id: 1,
        username: 1,
        nickname: 1,
        bio: 1,
        profileImage: 1,
        followersUsers: {
          $size: '$followersUsers',
        },
        followingUsers: {
          $size: '$followingUsers',
        },
        isDeleted: 1,
      },
    },
  ]);
  if (user[0] === null || user[0].isDeleted === true) {
    return null;
  }

  const userData = {};
  userData.id = user[0]._id;
  userData.username = user[0].username;
  userData.nickname = user[0].nickname;
  userData.bio = user[0].bio;
  userData.profile_image = user[0].profileImage;
  userData.followers_num = user[0].followersUsers;
  userData.following_num = user[0].followingUsers;

  return userData;
};

exports.getTweetDatabyId = async (id) => {
  // const tweet = await Tweet.findById(id);
  const tweet = await Tweet.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $project: {
        _id: 1,
        userId: 1,
        referredTweetId: 1,
        referredReplyId: 1,
        description: 1,
        views: 1,
        likersList: {
          $size: '$likersList',
        },
        repliesList: '$repliesCount',

        retweetList: {
          $size: '$retweetList',
        },
        quoteRetweetList: {
          $size: '$quoteRetweetList',
        },
        media: 1,
        type: 1,
        createdAt: 1,
        isDeleted: 1,
      },
    },
  ]);
  if (tweet.length === 0 || tweet[0].isDeleted === true) {
    return null;
  }

  const tweetData = {};
  tweetData.id = tweet[0]._id;
  tweetData.userId = tweet[0].userId;
  tweetData.referredTweetId = tweet[0].referredTweetId;
  tweetData.referredReplyId = tweet[0].referredReplyId;
  tweetData.description = tweet[0].description;
  tweetData.viewsNum = tweet[0].views;
  tweetData.likesNum = tweet[0].likersList;
  tweetData.repliesNum = tweet[0].repliesList;
  tweetData.repostsNum = tweet[0].retweetList + tweet[0].quoteRetweetList;
  tweetData.media = tweet[0].media;
  tweetData.type = tweet[0].type;
  tweetData.creation_time = tweet[0].createdAt;
  return tweetData;
};

exports.getRequiredTweetDatafromTweetObject = async (tweet) => {
  const tweetData = {};
  tweetData.id = tweet._id;
  tweetData.userId = tweet.userId;
  tweetData.referredTweetId = tweet.referredTweetId;
  tweetData.referredReplyId = tweet.referredReplyId;
  tweetData.description = tweet.description;
  tweetData.viewsNum = tweet.views;
  tweetData.likesNum = tweet.likersList.length;
  tweetData.repliesNum = tweet.repliesCount;
  tweetData.repostsNum =
    tweet.retweetList.length + tweet.quoteRetweetList.length;
  tweetData.media = tweet.media;
  tweetData.type = tweet.type;
  tweetData.creation_time = tweet.createdAt;
  return tweetData;
};
