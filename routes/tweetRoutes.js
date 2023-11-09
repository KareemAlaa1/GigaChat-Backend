const express = require('express');
const tweetController = require('../controllers/tweetController');

const tweetRouter = express.Router();

tweetRouter.post('/', tweetController.addTweet);
tweetRouter.get(':tweetId', tweetController.getTweet);
tweetRouter.delete(':tweetId', tweetController.deleteTweet);
tweetRouter.get('/likers/:tweetId', tweetController.getTweetLikers);

module.exports = tweetRouter;
