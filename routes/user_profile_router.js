const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/user_profile_controller');
const authController = require('../controllers/auth_controller');

router.get(
  '/tweets',
  authController.protect,
  userProfileController.getUserTweets,
);

module.exports = router;
