const express = require('express');
const HashtagController = require('../controllers/hashtag_controller');
const router = new express.Router();

router.get('/all', HashtagController.getAllHashtages);
router.get('/:trend', HashtagController.getHastagTweets);

module.exports = router;
