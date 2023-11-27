const express = require('express');
const HashtagController = require('../controllers/hashtag_controller');
const { protect } = require('../controllers/auth_controller');
const router = new express.Router();

router.get('/all', protect, HashtagController.getAllHashtages);
router.get('/:trend', protect, HashtagController.getHastagTweets);

module.exports = router;
