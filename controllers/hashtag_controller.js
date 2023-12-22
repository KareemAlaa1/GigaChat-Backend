const mongoose = require('mongoose');
const Hashtag = require('../models/hashtag_model');
const { paginate } = require('../utils/api_features');
const User = require('../models/user_model');

exports.getAllHashtages = async (req, res) => {
  try {
    const hashtags = await Hashtag.aggregate()
      .sort('-count')
      .project('title count');
    console.log(hashtags);

    if (!hashtags)
      return res.status(404).json({
        message: 'No Hashtags Found',
      });
    try {
      if (hashtags.length == 0)
        return res.status(404).send({ error: 'There is no hashtags' });
      const paginatedHashtags = paginate(hashtags, req);

      // send result
      return res
        .status(200)
        .send({ status: 'success', data: paginatedHashtags });
    } catch (error) {
      console.log(error.message);
      return res.status(404).send({ error: error.message });
    }
  } catch (error) {
    // Handle and log errors
    return res.status(500).send({ error: error.message });
  }
};

exports.getHastagTweets = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);

    const hashtagTitle = '#' + req.params.trend;

    const found = await Hashtag.findOne({ title: hashtagTitle });

    if (!found)
      return res.status(404).json({
        status: 'fail',
        message: 'Hashtag Not Found',
      });
    if (
      found.tweet_list === undefined ||
      found.tweet_list === null ||
      found.tweet_list.length == 0
    )
      return res.status(404).json({
        status: 'fail',
        message: 'No Tweets Found For This Hashtag',
      });

    const hashtag = await Hashtag.aggregate([
      { $match: { title: hashtagTitle } },
    ])
      .lookup({
        from: 'tweets',
        localField: 'tweet_list',
        foreignField: '_id',
        as: 'tweet_list',
      })
      .unwind('$tweet_list')
      .match({
        $expr: {
          $not: { $in: ['$tweet_list.userId', me.blockingUsers] },
        },
      })
      .addFields({
        'tweet_list.likesNum': {
          $size: '$tweet_list.likersList',
        },
        'tweet_list.repliesNum': '$tweet_list.repliesCount',
        'tweet_list.repostsNum': {
          $size: '$tweet_list.retweetList',
        },
      })
      .match({
        'tweet_list.isDeleted': false,
        $or: [{ 'tweet_list.type': 'tweet' }, { 'tweet_list.type': 'retweet' }],
      })
      .lookup({
        from: 'users',
        localField: 'tweet_list.userId',
        foreignField: '_id',
        as: 'tweet_list.tweet_owner',
      })
      .unwind('$tweet_list.tweet_owner')
      .match({
        $expr: {
          $not: {
            $in: [req.user._id, '$tweet_list.tweet_owner.blockingUsers'],
          },
        },
      })
      .addFields({
        'tweet_list.isFollowed': {
          $in: [req.user._id, '$tweet_list.tweet_owner.followersUsers'],
        },
        'tweet_list.isFollowingMe': {
          $in: [req.user._id, '$tweet_list.tweet_owner.followingUsers'],
        },
        'tweet_list.isLiked': {
          $in: [req.user._id, '$tweet_list.likersList'],
        },
        'tweet_list.isRtweeted': {
          $in: [req.user._id, '$tweet_list.retweetList'],
        },
      })
      .project({
        tweet_list: {
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
            profile_image: '$tweet_list.tweet_owner.profileImage',
            followers_num: {
              $size: ['$tweet_list.tweet_owner.followersUsers'],
            },
            following_num: {
              $size: ['$tweet_list.tweet_owner.followingUsers'],
            },
          },
        },
        'tweet_list.isFollowed': 1,
        'tweet_list.isFollowingMe': 1,
        'tweet_list.isLiked': 1,
        'tweet_list.isRtweeted': 1,
      })
      .group({
        _id: '$_id',
        title: { $first: '$title' },
        count: { $first: '$count' },
        tweet_list: { $push: '$tweet_list' },
      });
    try {
      if (
        hashtag.length == 0 ||
        hashtag[0].tweet_list == undefined ||
        hashtag[0].tweet_list.length == 0
      )
        return res
          .status(404)
          .send({ error: 'There is no tweets for this hashtag' });
      const paginatedTweets = paginate(hashtag[0].tweet_list, req);

      // send result
      return res.status(200).send({ status: 'success', data: paginatedTweets });
    } catch (error) {
      console.log(error.message);
      return res.status(404).send({ error: error.message });
    }
    // res.send({ status: 'success', data: hashtag[0].tweet_list }).status(200);
  } catch (error) {
    // Handle and log errors
    return res.status(500).send({ error: error.message });
  }
};
