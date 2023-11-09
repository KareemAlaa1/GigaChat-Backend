const mongoose = require('mongoose');
const Tweet = require('../models/tweet_model');
const User = require('../models/user_model');
const extractHashtags = require('../utils/extract_hashtags');

const {
  getUserDatabyId,
  getTweetDatabyId,
  getRequiredTweetDatafromTweetObject,
} = require('./tweetHelper');

// handling hashtags and media
exports.addTweet = async (req, res) => {
  try {
    req.body.userId = '65493dfd0e3d2798726f8f5b'; // will be updated according to auth
    const newTweet = await Tweet.create(req.body);
    let retTweet = {};
    retTweet = await getRequiredTweetDatafromTweetObject(newTweet._doc);
    retTweet.tweet_owner = await getUserDatabyId(req.body.userId);
    await User.findByIdAndUpdate(req.body.userId, {
      $push: { tweetList: retTweet.id },
    });

    res.status(201).json({
      status: 'Tweet Add Success',
      data: {
        tweet: retTweet,
      },
    });

    extractHashtags(newTweet);

  } catch (err) {
    res.status(400).json({
      status: 'bad request',
      message: err,
    });
  }
};

exports.getTweet = async (req, res) => {
  try {
    // const tweet = await getTweetDatabyId(req.params.tweetId);
    const tweet = await getTweetDatabyId(req.params.tweetId);
    // console.log(tweet);
    if (tweet === null) {
      res.status(404);
      res.json({
        status: 'Fail',
        message: 'Can not Find This Tweet',
      });
    } else {
      const user = await getUserDatabyId(tweet.userId);
      if (user === null) {
        res.status(404);
        res.json({
          status: 'Fail',
          message: 'Can not Find This Tweet Owner',
        });
      } else {
        tweet.tweet_owner = user;
        res.status(200);
        res.json({
          status: 'Tweet Get Success',
          data: {
            tweet,
          },
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400);
    res.json({
      status: 'bad request',
      message: err,
    });
  }
};

exports.deleteTweet = async (req, res) => {
  try {
    req.body.userId = '65493dfd0e3d2798726f8f5b'; // will be updated according to auth
    const tweet = await getTweetDatabyId(req.params.tweetId);
    if (tweet === null) {
      res.status(404).json({
        status: 'Fail',
        message: 'Can not Find This Tweet',
      });
    } else {
      const user = await getUserDatabyId(tweet.userId);
      if (user === null) {
        res.status(404).json({
          status: 'Fail',
          message: 'Can not Find This Tweet',
        });
      } else {
        if (tweet.userId.toString() === req.body.userId.toString()) {
          const updatedTweet = {};
          updatedTweet.isDeleted = true;
          await Tweet.findByIdAndUpdate(req.params.tweetId, updatedTweet);

          await User.findByIdAndUpdate(req.body.userId, {
            $pull: { tweetList: req.params.tweetId },
          });
          res.status(204).json({
            status: 'Tweet Delete Success',
          });
        } else {
          res.status(401).json({
            status: 'Fail',
            message: 'Can not Delete this Tweet not Authorized',
          });
        }
        return 1;
      }
    }
  } catch (err) {
    res.status(400).json({
      status: 'bad request',
      message: err,
    });
  }
};

exports.getTweetLikers = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.tweetId).select(
      'likersList userId',
    );
    if (tweet === null) {
      res.status(404).json({
        status: 'Fail',
        message: 'Can not Find This Tweet',
      });
    } else {
      const user = await getUserDatabyId(tweet.userId);
      if (user === null) {
        res.status(404).json({
          status: 'Fail',
          message: 'Can not Find This Tweet',
        });
      } else {
        const likersList = await User.aggregate([
          {
            $match: {
              _id: { $in: tweet.likersList },
            },
          },
          {
            $project: {
              _id: 1,
              username: 1,
              nickname: 1,
              bio: 1,
              profileImage: 1,
              followersUsers: {
                $size: '$followersUsers',
              },
              followingUsers: {
                $size: '$followingUsers',
              },
              isDeleted: 1,
            },
          },
        ]);
        console.log(likersList);
        res.status(200).json({
          status: 'Likers List Get Success',
          data: {
            likersList,
          },
        });
        return 1;
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'bad request',
      message: err,
    });
  }
};
