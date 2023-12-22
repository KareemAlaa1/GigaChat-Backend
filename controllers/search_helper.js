const mongoose = require('mongoose');
const User = require('../models/user_model');
const Hashtag = require('../models/hashtag_model');
const Tweet = require('../models/tweet_model');
const escape = (string) => string.replace(/['".*+?^${}()|[\]\\]/g, ''); // $& means the whole matched

/**
 * Description :
 * * get users that match the search word
 * Search Criteria :
 * * fully and partially matching users
 * Ranking Criteria :
 * 1 - if the user its self matches the query
 * 2 - users that follows me
 * 3 - users that I follow
 * 4 - number of followers
 * 5 - number of users he/she follows
 */
exports.searchUser = async (req, res, next) => {
  try {
    const me = await User.findById(req.user._id);
    const users = await User.aggregate([
      {
        $match: {
          username: {
            $regex: new RegExp(escape(req.searchWord), 'i'), // 'i' for case-insensitive matching
          },
        },
      },
    ])
      .match({
        $expr: {
          $not: { $in: ['$_id', me.blockingUsers] },
          $not: { $in: [me._id, '$blockingUsers'] },
        },
      })
      .addFields({
        isFollowedbyMe: {
          $in: ['$_id', req.user.followingUsers],
        },
        isFollowingMe: {
          $in: ['$_id', req.user.followersUsers],
        },
        searchOnMe: {
          $eq: ['$_id', req.user._id],
        },
        followers_num: { $size: '$followersUsers' },
        following_num: { $size: '$followingUsers' },
        profile_image: '$profileImage',
      })
      .sort({
        searchOnMe: -1,
        isFollowedbyMe: -1,
        isFollowingMe: -1,
        followers_num: -1,
        following_num: -1,
      })

      .project(
        'username nickname bio profile_image followers_num following_num isFollowedbyMe isFollowingMe',
      );
    return users;
  } catch (error) {
    // Handle and log errors
    throw new Error(error.message);
  }
};

/**
 * Description :
 * * get hashtags that match the search word
 * Search Criteria :
 * * fully and partially matching hashtags
 * Ranking Criteria :
 * how much popular the hashtag is
 */
exports.searchHashtag = async (req, res, next) => {
  try {
    const hashtags = await Hashtag.aggregate([
      {
        $match: {
          title: {
            $regex: new RegExp(escape(req.searchWord), 'i'), // 'i' for case-insensitive matching
          },
        },
      },
    ])
      .sort('-count')
      .project('title count');
    return hashtags;
  } catch (error) {
    // Handle and log errors
    throw new Error(error.message);
  }
};

/**
 * Description :
 * * get tweets that its content has what matches the search word
 * Search Criteria :
 * * fully and partially matching words
 * Ranking Criteria :
 * 1- creation time
 * 2- number of likes
 * 3- number of replies
 * 4- number of reposts
 * */
exports.searchTweets = async (req, res, next) => {
  try {
    const me = await User.findById(req.user._id);
    const tweets = await Tweet.aggregate([
      {
        $match: {
          description: {
            $regex: new RegExp(escape(req.searchWord), 'i'), // 'i' for case-insensitive matching
          },
        },
      },
    ])
      .lookup({
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'tweet_owner',
      })
      .match({
        $expr: {
          $not: { $in: ['$userId', me.blockingUsers] },
        },
      })
      .unwind('tweet_owner')
      .match({
        $expr: {
          $not: {
            $in: [me._id, '$tweet_owner.blockingUsers'],
          },
        },
      })
      .project({
        _id: 1,
        type: 1,
        description: 1,
        media: 1,
        referredTweetId: 1,
        createdAt: 1,
        likesNum: { $size: '$likersList' },
        repliesNum: '$repliesCount',
        repostsNum: { $size: '$retweetList' },
        tweet_owner: {
          _id: 1,
          username: 1,
          nickname: 1,
          bio: 1,
          profile_image: '$tweet_owner.profileImage',
          followers_num: { $size: '$tweet_owner.followingUsers' },
          following_num: { $size: '$tweet_owner.followersUsers' },
          isFollowed: { $in: ['$_id', '$tweet_owner.followersUsers'] },
        },
        isLiked: { $in: [req.user._id, '$likersList'] },
        isRtweeted: { $in: [req.user._id, '$retweetList'] },
      })
      .sort({
        createdAt: -1,
        likesNum: -1,
        repliesNum: -1,
        repostsNum: -1,
      });
    return tweets;
  } catch (error) {
    // Handle and log errors
    console.log(error.message);
    throw new Error(error.message);
  }
};
