const mongoose = require('mongoose');
const User = require('../models/user_model');
const { paginate } = require('../utils/api_features');

/**
 *
 * @param {*} reqUser
 * @returns userTweets
 *
 * Description :
 * helper function return user tweets within 2 hours
 *
 */
const getLatestUserTweet = async (reqUser) => {
  try {
    let twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    const userTweets = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(reqUser._id) },
      },
    ])
      .unwind('tweetList')
      .match({
        'tweetList.createdAt': {
          $gte: new Date(twoHoursAgo.toISOString()),
        },
      })
      .lookup({
        from: 'tweets',
        localField: 'tweetList.tweetId',
        foreignField: '_id',
        as: 'tweetDetails',
      })
      .unwind('tweetDetails')
      .match({
        $expr: {
          $not: { $in: ['$tweetDetails.userId', '$mutedUsers'] },
        },
      })
      .match({
        $expr: {
          $not: { $in: ['$tweetDetails.userId', '$blockingUsers'] },
        },
      })
      .lookup({
        from: 'users',
        localField: 'tweetDetails.userId',
        foreignField: '_id',
        as: 'tweetDetails.tweet_owner',
      })
      .unwind('tweetDetails.tweet_owner')
      .match({
        $expr: {
          $not: {
            $in: ['$_id', '$tweetDetails.tweet_owner.blockingUsers'],
          },
        },
      })
      .project({
        _id: 0,
        type: '$tweetList.type',
        followingUser: {
          _id: '$_id',
          nickname: '$nickname',
          username: '$username',
          following_num: { $size: '$followingUsers' },
          followers_num: { $size: '$followersUsers' },
          profile_image: '$profileImage',
        },
        tweetDetails: {
          _id: 1,
          description: 1,
          media: 1,
          referredTweetId: 1,
          createdAt: 1,
          likesNum: 1,
          repliesNum: '$tweetDetails.repliesCount',
          repostsNum: { $size: '$tweetDetails.retweetList' },
          tweet_owner: {
            _id: 1,
            username: 1,
            nickname: 1,
            bio: 1,
            profile_image: '$tweetDetails.tweet_owner.profileImage',
            followers_num: {
              $size: '$tweetDetails.tweet_owner.followingUsers',
            },
            following_num: {
              $size: '$tweetDetails.tweet_owner.followersUsers',
            },
          },
        },
        isFollowed: {
          $in: ['$_id', '$tweetDetails.tweet_owner.followersUsers'],
        },
        isFollowingMe: {
          $in: ['$_id', '$tweetDetails.tweet_owner.followingUsers'],
        },
        isLiked: { $in: ['$_id', '$tweetDetails.likersList'] },
        isRtweeted: { $in: ['$_id', '$tweetDetails.retweetList'] },
      })
      .sort({
        'tweetDetails.createdAt': -1,
        'tweetDetails.likesNum': -1,
        'tweetDetails.repliesNum': -1,
        'tweetDetails.repostsNum': -1,
      });
    return userTweets;
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns userTweets
 */

/**
 * Description :
 * 1- get following tweets of the user
 * 2- get latest tweets of the user (within 2 hours)
 * 3- not retrieving the muted users tweets
 * 3- apply pagination
 *
 * Ranking Tweets Criteria :
 * 1- user latest tweets
 * 2- creation time
 * 3- number of likes
 * 4- number of replies
 * 5- number of reposts
 *  */

exports.getFollowingTweets = async (req, res) => {
  try {
    console.log(req.user._id);
    const user = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
      },
    ])
      .lookup({
        from: 'users',
        localField: 'followingUsers',
        foreignField: '_id',
        as: 'followingUsers',
      })
      .unwind('followingUsers')
      .match({
        $expr: { $not: { $in: ['$followingUsers._id', '$mutedUsers'] } },
      })
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
        'tweetList.tweetDetails.repliesNum':
          '$tweetList.tweetDetails.repliesCount',
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
      .match({
        $expr: { $in: ['$tweetList.type', ['tweet', 'retweet']] },
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
        'tweetList.isFollowingMe': {
          $in: ['$_id', '$tweetList.tweetDetails.tweet_owner.followingUsers'],
        },
        'tweetList.isLiked': {
          $in: ['$_id', '$tweetList.tweetDetails.likersList'],
        },
        'tweetList.isRtweeted': {
          $in: ['$_id', '$tweetList.tweetDetails.retweetList'],
        },
      })
      .unwind('tweetList')
      .unwind('tweetList.tweetDetails.tweet_owner')
      .project({
        tweetList: {
          type: 1,
          followingUser: {
            _id: 1,
            username: 1,
            nickname: 1,
            bio: 1,
            profile_image: '$tweetList.followingUser.profileImage',
            followers_num: 1,
            following_num: 1,
          },
          tweetDetails: {
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
              profile_image: '$tweetList.tweetDetails.tweet_owner.profileImage',
              followers_num: 1,
              following_num: 1,
            },
          },
          isFollowed: 1,
          isLiked: 1,
          isRtweeted: 1,
          isFollowingMe: 1,
        },
      })
      .sort({
        'tweetList.tweetDetails.createdAt': -1,
        'tweetList.tweetDetails.likesNum': -1,
        'tweetList.tweetDetails.repliesNum': -1,
        'tweetList.tweetDetails.repostsNum': -1,
      })
      .group({
        _id: '$_id',
        tweetList: { $push: '$tweetList' },
      });
    let tweets = await getLatestUserTweet(req.user);
    if (user[0] !== undefined && user[0].tweetList !== undefined)
      tweets.push(...user[0].tweetList);
    try {
      if (tweets.length == 0)
        return res
          .status(404)
          .send({ error: 'This user has no following tweets' });
      const paginatedTweets = paginate(tweets, req);
      return res
        .status(200)
        .send({ status: 'success', tweetList: paginatedTweets });
    } catch (error) {
      console.log(error.message);
      return res.status(404).send({ error: error.message });
    }
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.getMentionTweets = async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
      },
    ])
      .lookup({
        from: 'tweets',
        localField: 'mentionList',
        foreignField: '_id',
        as: 'mentions',
      })
      .unwind('mentions')
      .match({
        'mentions.isDeleted': false,
      })
      .match({
        $expr: {
          $not: { $in: ['$mentions.userId', '$blockingUsers'] },
        },
      })
      .lookup({
        from: 'users',
        localField: 'mentions.userId',
        foreignField: '_id',
        as: 'mentions.tweet_owner',
      })
      .unwind('mentions.tweet_owner')
      .match({
        $expr: {
          $not: { $in: ['$_id', '$mentions.tweet_owner.blockingUsers'] },
        },
      })
      .sort('-mentions._id')
      .project({
        mentions: {
          id: '$mentions._id',
          referredTweetId: 1,
          description: 1,
          likesNum: {
            $size: '$mentions.likersList',
          },
          repliesNum: '$mentions.repliesCount',
          repostsNum: {
            $size: '$mentions.retweetList',
          },
          media: 1,
          type: 1,
          creation_time: '$mentions.createdAt',
          tweet_owner: {
            id: '$mentions.tweet_owner._id',
            username: 1,
            nickname: 1,
            bio: 1,
            profile_image: '$mentions.tweet_owner.profileImage',
            followers_num: {
              $size: '$mentions.tweet_owner.followingUsers',
            },
            following_num: {
              $size: '$mentions.tweet_owner.followersUsers',
            },
            isFollowed: {
              $in: [req.user._id, '$mentions.tweet_owner.followersUsers'],
            },
          },
          isLiked: { $in: [req.user._id, '$mentions.likersList'] },
          isRtweeted: {
            $in: [req.user._id, '$mentions.retweetList'],
          },
        },
      })
      .group({
        _id: '$_id',
        data: {
          $push: '$mentions',
        },
      });

    let tweets = user[0].data;

    try {
      if (tweets == undefined || tweets.length == 0)
        return res
          .status(404)
          .send({ error: 'This user wasnot mentioned in any tweet' });
      const paginatedTweets = paginate(tweets, req);
      return res
        .status(200)
        .send({ status: 'success', tweetList: paginatedTweets });
    } catch (error) {
      console.log(error.message);
      return res.status(404).send({ error: error.message });
    }
    return res.send(user);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
