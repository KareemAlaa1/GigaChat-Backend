const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Hashtag = require('../models/hashtag_model');

exports.getAllHashtages = catchAsync(
  async (
    req,
    res,
    next = (e) => {
      res.send(400).send(e);
    },
  ) => {
    const hashtags = await Hashtag.find({}, 'title count');
    res.status(200).send(hashtags);
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
      res.status(200).send(hashtag.tweet_list);
    }
  },
);
