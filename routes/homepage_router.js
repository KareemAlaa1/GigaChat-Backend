const express = require('express');
const HomepageController = require('../controllers/homepage_controller');
const { protect } = require('../controllers/authController');
const router = new express.Router();

router.get('/following', protect, HomepageController.getFollowingTweets);

module.exports = router;
