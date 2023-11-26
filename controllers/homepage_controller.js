const mongoose = require('mongoose');
const User = require('../models/user_model');
const catchAsync = require('../utils/catchAsync');

/**
 * [1] : get user by id
 * [2] : populate its followings
 * [3] : populate tweet list of each following (each tweet has id and type)
 * [4] : populate type of each tweet in each tweetlist
 * [5] : group all tweets and sort them by creation date
 * [6] : know if the login user follow tweet Owner
 * [7] : know if the login user liked tweet
 */

exports.getFollowingTweets = catchAsync(
  async (
    req,
    res,
    next = (e) => {
      res.send(500).send(e);
    },
  ) => {
    const user = await User.aggregate({
      $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
    })
      .lookup({
        from: 'users',
        localField: 'followingUsers',
        foreignField: '_id',
        as: 'followingUsers',
      })
      .unwind('followingUsers')
      .unwind('followingUsers.tweetList')
      .addFields({
        'followingUsers.tweetList.followingUserId': '$followingUsers._id',
      })
      .lookup({
        from: 'users',
        localField: 'followingUsers.tweetList.followingUserId',
        foreignField: '_id',
        as: 'followingUsers.tweetList.followingUser',
      })
      .unwind('followingUsers.tweetList.followingUser')
      .addFields({
        'followingUsers.tweetList.followingUser.following_num': {
          $size: '$followingUsers.tweetList.followingUser.followingUsers',
        },
        'followingUsers.tweetList.followingUser.followers_num': {
          $size: '$followingUsers.tweetList.followingUser.followersUsers',
        },
      })
      .group({
        _id: '$_id',
        tweetList: {
          $push: '$followingUsers.tweetList',
        },
      })
      .unwind('tweetList')
      .lookup({
        from: 'tweets',
        localField: 'tweetList.tweetId',
        foreignField: '_id',
        as: 'tweetList.tweetDetails',
      })
      .unwind('tweetList.tweetDetails')
      .addFields({
        'tweetList.tweetDetails.likesNum': {
          $size: '$tweetList.tweetDetails.likersList',
        },
        'tweetList.tweetDetails.repliesNum': {
          $size: '$tweetList.tweetDetails.repliesList',
        },
        'tweetList.tweetDetails.repostsNum': {
          $size: '$tweetList.tweetDetails.retweetList',
        },
      })
      .lookup({
        from: 'users',
        localField: 'tweetList.tweetDetails.userId',
        foreignField: '_id',
        as: 'tweetList.tweetDetails.tweet_owner',
      })
      .unwind('tweetList.tweetDetails.tweet_owner')
      .addFields({
        'tweetList.tweetDetails.tweet_owner.following_num': {
          $size: '$tweetList.tweetDetails.tweet_owner.followingUsers',
        },
        'tweetList.tweetDetails.tweet_owner.followers_num': {
          $size: '$tweetList.tweetDetails.tweet_owner.followersUsers',
        },
      })
      .addFields({
        'tweetList.isFollowed': {
          $in: ['$_id', '$tweetList.tweetDetails.tweet_owner.followersUsers'],
        },
        'tweetList.isLiked': {
          $in: ['$_id', '$tweetList.tweetDetails.likersList'],
        },
      })
      .unwind('tweetList')
      .sort({
        'tweetList.tweetDetails.createdAt': -1,
      })
      .group({
        _id: '$_id',
        tweetList: { $push: '$tweetList' },
      })
      .project({
        'tweetList.type': 1,
        'tweetList.followingUser': {
          _id: 1,
          username: 1,
          nickname: 1,
          bio: 1,
          profile_image: 1,
          followers_num: 1,
          following_num: 1,
        },
        'tweetList.tweetDetails': {
          _id: 1,
          description: 1,
          media: 1,
          referredTweetId: 1,
          createdAt: 1,
          likesNum: 1,
          repliesNum: 1,
          repostsNum: 1,
          tweet_owner: {
            _id: 1,
            username: 1,
            nickname: 1,
            bio: 1,
            profile_image: 1,
            followers_num: 1,
            following_num: 1,
          },
        },
        'tweetList.isFollowed': 1,
        'tweetList.isLiked': 1,
      });
    res.send(user[0].tweetList);
  },
);
