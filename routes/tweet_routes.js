const express = require('express');
const tweetController = require('../controllers/tweet_controller');
const authController = require('../controllers/auth_controller');

const tweetRouter = express.Router();

tweetRouter.post('/', authController.protect, tweetController.addTweet);
tweetRouter.get('/:tweetId', authController.protect, tweetController.getTweet);
tweetRouter.delete(
  '/:tweetId',
  authController.protect,
  tweetController.deleteTweet,
);
tweetRouter.get(
  '/likers/:tweetId',
  authController.protect,
  tweetController.getTweetLikers,
);

tweetRouter.patch(
  '/retweet/:tweetId',
  authController.protect,
  tweetController.retweetTweet,
);

tweetRouter.get(
  '/replies/:tweetId',
  authController.protect,
  tweetController.getTweetReplies,
);

module.exports = tweetRouter;
