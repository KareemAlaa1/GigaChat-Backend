const express = require('express');
const tweetController = require('../controllers/tweetController');

const router = express.Router();

// router.param('id', tourController.checkID);

router.route('/').post(tweetController.addTweet);
router
  .route('/:tweetId')
  .get(tweetController.getTweet)
  .delete(tweetController.deleteTweet);

router.route('/likers/:tweetId').get(tweetController.getTweetLikers);
module.exports = router;
