const express = require('express');
const tweetController = require('../controllers/tweetController');
const authController = require('../controllers/authController');

const tweetRouter = express.Router();

tweetRouter.post('/', authController.protect, tweetController.addTweet);
tweetRouter.get(':tweetId', authController.protect, tweetController.getTweet);
tweetRouter.delete(
  ':tweetId',
  authController.protect,
  tweetController.deleteTweet,
);
tweetRouter.get(
  '/likers/:tweetId',
  authController.protect,
  tweetController.getTweetLikers,
);

module.exports = tweetRouter;
