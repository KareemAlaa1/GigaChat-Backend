const mongoose = require('mongoose');
const Tweet = require('../models/hashtag_model');
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
