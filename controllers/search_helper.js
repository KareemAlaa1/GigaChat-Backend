const mongoose = require('mongoose');
const User = require('../models/user_model');
const Hashtag = require('../models/hashtag_model');
const Tweet = require('../models/tweet_model');
const escape = (string) =>
  string
    .replace(/['".*+?^${}()|[\]\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split('')
    .join('\\s*'); // $& means the whole matched

/**
 * This function retrieves users that match the search word. It can match users fully or partially.
 * The users are ranked based on whether the user itself matches the query, whether the users follow the current user, whether the current user follows the users, the number of followers the users have, and the number of users the users follow.
 *
 * @async\
 * @memberof module:controllers/searchHelper
 * @function searchUser
 * @param {Object} req - The request object from the client. It should contain the user's ID and the search word.
 * @param {Object} res - The response object that will be sent to the client. It will contain the status of the request and the data (users) if successful.
 * @param {Function} next - The next middleware function in the application’s request-response cycle.
 * @throws Will throw an error if there is an issue with the database query.
 * @returns {Array} users - An array of users that match the search word.
 */
exports.searchUser = async (req, res, next) => {
  try {
    const me = await User.findById(req.user._id);
    const users = await User.aggregate([
      {
        $match: {
          $or: [
            {
              username: {
                $regex: new RegExp(escape(req.searchWord), 'i'), // 'i' for case-insensitive matching
              },
            },
            {
              nickname: {
                $regex: new RegExp(escape(req.searchWord), 'i'), // 'i' for case-insensitive matching
              },
            },
          ],
        },
      },
    ])
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
        isBlocked: { $in: ['$_id', req.user.blockingUsers] },
      })
      .sort({
        searchOnMe: -1,
        isFollowedbyMe: -1,
        isFollowingMe: -1,
        followers_num: -1,
        following_num: -1,
      })

      .project(
        'username nickname bio profile_image followers_num following_num isFollowedbyMe isFollowingMe isBlocked',
      );
    return users;
  } catch (error) {
    // Handle and log errors
    throw new Error(error.message);
  }
};

/**
 * This function retrieves hashtags that match the search word. It can match hashtags fully or partially.
 * The hashtags are ranked based on their popularity (how often they are used).
 *
 * @async
 * @memberof module:controllers/searchHelper
 * @function searchHashtag
 * @param {Object} req - The request object from the client. It should contain the search word.
 * @param {Object} res - The response object that will be sent to the client. It will contain the status of the request and the data (hashtags) if successful.
 * @param {Function} next - The next middleware function in the application’s request-response cycle.
 * @throws Will throw an error if there is an issue with the database query.
 * @returns {Array} hashtags - An array of hashtags that match the search word.
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
 * This function retrieves tweets that contain words matching the search word. It can match words fully or partially.
 * The tweets are ranked based on their creation time, number of likes, number of replies, and number of reposts.
 *
 * @async
 * @function searchTweets
 * @memberof module:controllers/searchHelper
 * @param {Object} req - The request object from the client. It should contain the search word.
 * @param {Object} res - The response object that will be sent to the client. It will contain the status of the request and the data (tweets) if successful.
 * @param {Function} next - The next middleware function in the application’s request-response cycle.
 * @throws Will throw an error if there is an issue with the database query.
 * @returns {Array} tweets - An array of tweets that contain words matching the search word.
 */
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
        referredReplyId: 1,
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
          isFollowingMe: { $in: ['$_id', '$tweet_owner.followingUsers'] },
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
