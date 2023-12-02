const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/user_profile_controller');
const authController = require('../controllers/auth_controller');

router.get(
  '/tweets',
  authController.protect,
  userProfileController.getUserTweets,
);


router.get(
  '/likes',
  authController.protect,
  userProfileController.getUserLikedTweets,
);


module.exports = router;
