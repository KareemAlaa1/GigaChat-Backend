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
    const hashtag = await Hashtag.findById(hashtagId).populate({
      path: 'tweet_list',
      model: 'Tweet',
    });

    if (!hashtag) {
      res.status(404).send('HashTag not found');
    } else {
      // Now, the tweet_list should be populated with actual Tweet documents
      req.query.type = 'array';
      const apiFeatures = new APIFeatures(hashtag.tweet_list, req.query)
        .sort()
        .paginate();
      res.status(200).send(await apiFeatures.query);
    }
  },
);
