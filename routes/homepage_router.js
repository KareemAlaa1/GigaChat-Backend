const express = require('express');
const HomepageController = require('../controllers/homepage_controller');
const router = new express.Router();

router.get('/following', HomepageController.getFollowingTweets);

module.exports = router;
