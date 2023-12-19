const express = require('express');
const HomepageController = require('../controllers/homepage_controller');
const { protect } = require('../controllers/auth_controller');
const router = new express.Router();

router.get('/following', protect, HomepageController.getFollowingTweets);

router.get('/mention', protect, HomepageController.getMentionTweets);

module.exports = router;
