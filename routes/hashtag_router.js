const express = require('express');
const HashtagController = require('../controllers/hashtag_controller');
const router = new express.Router();

router.get('/trends/all', HashtagController.getAllHashtages);

module.exports = router;
