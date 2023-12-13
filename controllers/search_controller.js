const mongoose = require('mongoose');
const User = require('../models/user_model');
const Hashtag = require('../models/hashtag_model');

/**
 * Description :
 * search for words in tweets or
 * search for users with usernames or with part of their username
 * search for hashtags
 */
exports.search = async (req, res, next) => {
  try {
    const type = req.query.type;
    if (!type || type == undefined)
      return res.status(400).send({
        error:
          'Search request must have a type in query one of these values [ user , tweet , hashtag ] ',
      });
    const searchWord = req.query.word;
    if (!searchWord || searchWord == undefined)
      return res
        .status(400)
        .send({ error: 'Search request must have a search word in query' });
    req.searchWord = searchWord;
    if (type == 'user') {
      // return matching users using their username or screen name or part of them
      return searchUser(req, res, next);
    } else if (type == 'tweet') {
      // return tweets that include the search query
      return searchTweets(req, res, next);
    } else if (type == 'hashtag') {
      //return hashtags that include the search query
      return searchHashtag(req, res, next);
    } else {
      // not allowed search type
      res.status(400).send({
        error:
          'Only these values [ user , tweet , hashtag ] are allowed in type of search request',
      });
    }
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

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
const searchUser = async (req, res, next) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.count * 1 || 1;
    const skip = (page - 1) * limit;
    const users = await User.aggregate([
      {
        $match: {
          username: {
            $regex: new RegExp(req.searchWord, 'i'), // 'i' for case-insensitive matching
          },
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
      })
      .sort({
        searchOnMe: -1,
        isFollowedbyMe: -1,
        isFollowingMe: -1,
        followers_num: -1,
        following_num: -1,
      })
      .skip(skip)
      .limit(limit)
      .project(
        'username nickname bio profile_image followers_num following_num isFollowedbyMe isFollowingMe',
      );
    res.status(200).send({ users });
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
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
const searchHashtag = async (req, res, next) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.count * 1 || 1;
    const skip = (page - 1) * limit;
    const hashtags = await Hashtag.aggregate([
      {
        $match: {
          title: {
            $regex: new RegExp(req.searchWord, 'i'), // 'i' for case-insensitive matching
          },
        },
      },
    ])
      .skip(skip)
      .limit(limit)
      .sort('-count')
      .project('title');
    res.status(200).send({ hashtags });
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

const searchTweets = async (req, res, next) => {};
