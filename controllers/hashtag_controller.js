const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Hashtag = require('../models/hashtag_model');
const APIFeatures = require('../utils/api_features');
exports.getAllHashtages = catchAsync(
  async (
    req,
    res,
    next = (e) => {
      res.send(400).send(e);
    },
  ) => {
    req.query.sort = '-count';
    req.query.fields = 'title count';
    const apiFeatures = new APIFeatures(Hashtag.find(), req.query)
      .sort()
      .limitFields()
      .paginate();
    res.status(200).send(await apiFeatures.query);
  },
);

exports.getHastagTweets = catchAsync(
  async (
    req,
    res,
    next = (e) => {
      res.send(400).send(e);
    },
  ) => {
    const hashtagId = req.params.trend;
    const hashtag = await Hashtag.findById(hashtagId)
      .lean()
      .populate({
        path: 'tweet_list',
        populate: {
          path: 'user_id',
          model: 'User',
        },
      })
      .exec();
    if (!hashtag) {
      res.status(404).send('HashTag not found');
    } else {
      // filter deleted tweets and anu not tweet type
      hashtag.tweet_list = hashtag.tweet_list.filter(
        (tweet) => tweet.isDeleted !== true && tweet.type === 'tweet',
      );
      // Now, the tweet_list should be populated with actual Tweet documents
      req.query.type = 'array';
      req.query.fields =
        '_id,description,media,type,referredTweetId,createdAt,user_id,';
      const apiFeatures = new APIFeatures(hashtag.tweet_list, req.query)
        .sort()
        .paginate()
        .limitFields();
      hashtag.tweet_list.forEach((tweet) => {
        req.query.type = 'array';
        req.query.fields = '';
        req.query.excludes =
          'location,website,mutedUsers,blockingUsers,likedTweets,notificationList,chatList,mentionList,isDeleted,__v,';
        const apiFeaturesUser = new APIFeatures(
          [tweet.user_id],
          req.query,
        ).excludeFields();
      });
      res.status(200).send(await apiFeatures.query);
    }
  },
);
