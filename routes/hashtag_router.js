const express = require('express');
const hashtagController = require('../controllers/hashtag_controller');
const searchController = require('../controllers/search_controller');
const { protect } = require('../controllers/auth_controller');
const router = new express.Router();

router.get('/all', protect, hashtagController.getAllHashtages);
router.get('/search', protect, searchController.search);
router.get('/:trend', protect, hashtagController.getHastagTweets);
module.exports = router;
