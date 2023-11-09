const express = require('express');
const HashtagController = require('../controllers/hashtag_controller');
const router = new express.Router();

router.get('/trends/all', HashtagController.getAllHashtages);
router.get('/trends/:trend', HashtagController.getHastagTweets);

module.exports = router;
