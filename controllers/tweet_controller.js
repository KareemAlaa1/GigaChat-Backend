const mongoose = require('mongoose');
const Tweet = require('../models/tweet_model');
const User = require('../models/user_model');
const extractHashtags = require('../utils/extract_hashtags');

const {
  getUserDatabyId,
  getTweetDatabyId,
  getRequiredTweetDatafromTweetObject,
} = require('./tweet_helper');

// handling hashtags and media
const TweetController = {
  addTweet: async (req, res) => {
    try {
      // req.body.userId = '65493dfd0e3d2798726f8f5b'; // will be updated according to auth
      req.body.userId = req.user._id;
      if (req.body.media == undefined && req.body.description == undefined) {
        res.status(400);
        res.json({
          status: 'bad request',
          message: 'no media and no description',
        });
      } else {
        const newTweet = await Tweet.create(req.body);
        let retTweet = {};
        retTweet = await getRequiredTweetDatafromTweetObject(newTweet._doc);
        retTweet.tweet_owner = await getUserDatabyId(req.body.userId);
        await User.findByIdAndUpdate(req.body.userId, {
          $push: { tweetList: { tweetId: retTweet.id, type: req.body.type } },
        });
        const data = retTweet;
        res.status(201);
        res.json({
          status: 'Tweet Add Success',
          data,
        });
        if (req.body.description) extractHashtags(newTweet);
      }
    } catch (err) {
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  retweetTweet: async (req, res) => {
    try {
      const tweet = await getTweetDatabyId(req.params.tweetId);
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
          await Tweet.findByIdAndUpdate(tweet.id, {
            $push: { retweetList: req.user._id },
          });
          await User.findByIdAndUpdate(req.user._id, {
            $push: { tweetList: { tweetId: tweet.id, type: 'retweet' } },
          });
          res.status(204);
          res.json({
            status: 'Retweet Success',
          });
        }
      }
    } catch (err) {
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  getTweet: async (req, res) => {
    try {
      const tweet = await getTweetDatabyId(req.params.tweetId);
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
          const like = await User.findOne({
            _id: req.user._id,
            likedTweets: { $in: [tweet.id] },
          });
          if (like) {
            tweet.isLiked = true;
          } else {
            tweet.isLiked = false;
          }

          const retweet = await User.aggregate([
            {
              $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
                tweetList: {
                  $elemMatch: {
                    tweetId: tweet.id,
                    type: 'retweet',
                  },
                },
              },
            },
            {
              $project: {
                _id: 1,
              },
            },
          ]);
          if (retweet.length > 0) {
            tweet.isRetweeted = true;
          } else {
            tweet.isRetweeted = false;
          }
          delete tweet.userId;
          tweet.media.forEach((el) => {
            delete el._id;
          });
          res.status(200);
          res.json({
            status: 'Tweet Get Success',
            data: tweet,
          });
        }
      }
    } catch (err) {
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  deleteTweet: async (req, res) => {
    try {
      // req.body.userId = '65493dfd0e3d2798726f8f5b'; // will be updated according to auth
      req.body.userId = req.user._id;
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

            const users = await Tweet.findById(req.params.tweetId).select(
              'retweetList likersList',
            );

            await User.updateMany(
              { _id: { $in: users.retweetList } },
              {
                $pull: { tweetList: { tweetId: req.params.tweetId } },
              },
            );

            await User.updateMany(
              { _id: { $in: users.likersList } },
              {
                $pull: { likedTweets: req.params.tweetId },
              },
            );

            await User.findByIdAndUpdate(req.body.userId, {
              $pull: { tweetList: { tweetId: req.params.tweetId } },
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
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  getTweetLikers: async (req, res) => {
    try {
      const tweet = await Tweet.findById(req.params.tweetId).select(
        'likersList userId isDeleted',
      );
      if (tweet === null || tweet.isDeleted === true) {
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
            message: 'Can not Find This Tweet',
          });
        } else {
          const size = parseInt(req.body.count, 10) || 10;

          const skip = ((req.body.page || 1) - 1) * size;
          const likersList = await User.aggregate([
            {
              $match: {
                _id: { $in: tweet.likersList },
              },
            },
            {
              $project: {
                id: '$_id',
                username: 1,
                nickname: 1,
                bio: 1,
                profile_image: '$profileImage',
                followers_num: {
                  $size: '$followersUsers',
                },
                following_num: {
                  $size: '$followingUsers',
                },
                isDeleted: 1,
                isFollowed: { $in: [req.user._id, '$followersUsers'] },
              },
            },
            {
              $facet: {
                paginatedResults: [{ $skip: skip }, { $limit: size }],
                totalCount: [{ $group: { _id: null, count: { $sum: 1 } } }],
              },
            },
          ]);
          const data = likersList[0].paginatedResults;
          const totalCount =
            likersList[0].totalCount.length > 0
              ? likersList[0].totalCount[0].count
              : 0;

          // console.log(data);
          res.status(200);
          res.json({
            status: 'Success',
            message: 'Tweet Likers Get Success',
            data,
          });
          return 1;
        }
      }
    } catch (err) {
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  getTweetRetweeters: async (req, res) => {
    try {
      const tweet = await Tweet.findById(req.params.tweetId).select(
        'retweetList userId isDeleted',
      );
      if (tweet === null || tweet.isDeleted === true) {
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
            message: 'Can not Find This Tweet',
          });
        } else {
          const size = parseInt(req.body.count, 10) || 10;

          const skip = ((req.body.page || 1) - 1) * size;
          const retweetersList = await User.aggregate([
            {
              $match: {
                _id: { $in: tweet.retweetList },
              },
            },
            {
              $project: {
                id: '$_id',
                username: 1,
                nickname: 1,
                bio: 1,
                profile_image: '$profileImage',
                followers_num: {
                  $size: '$followersUsers',
                },
                following_num: {
                  $size: '$followingUsers',
                },
                isDeleted: 1,
                isFollowed: { $in: [req.user._id, '$followersUsers'] },
              },
            },
            {
              $facet: {
                paginatedResults: [{ $skip: skip }, { $limit: size }],
                totalCount: [{ $group: { _id: null, count: { $sum: 1 } } }],
              },
            },
          ]);
          const data = retweetersList[0].paginatedResults;
          const totalCount =
            retweetersList[0].totalCount.length > 0
              ? retweetersList[0].totalCount[0].count
              : 0;

          // console.log(data);
          res.status(200);
          res.json({
            status: 'Success',
            message: 'Tweet Retweeters Get Success',
            data,
          });
          return 1;
        }
      }
    } catch (err) {
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  getTweetReplies: async (req, res) => {
    try {
      const tweet = await Tweet.findById(req.params.tweetId).select(
        'userId isDeleted',
      );
      if (tweet === null || tweet.isDeleted) {
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
            message: 'Can not Find This Tweet',
          });
        } else {
          const size = parseInt(req.body.count, 10) || 10;

          const skip = ((req.body.page || 1) - 1) * size;
          const repliesList = await Tweet.aggregate([
            {
              $match: {
                type: 'reply',
                referredTweetId: new mongoose.Types.ObjectId(
                  req.params.tweetId,
                ),
              },
            },
            {
              $project: {
                _id: 0,
                referredTweetId: 1,
                description: 1,
                id: '$_id',
                userId: 1,
                media: 1,
                type: 1,
                creation_time: '$createdAt',
                viewsNum: '$views',
                repliesNum: { $size: '$repliesList' },
                repostsNum: { $size: '$retweetList' },
                likesNum: { $size: '$likersList' },
                likersList: 1,
                retweetList: 1,
              },
            },
            {
              $addFields: {
                isLiked: {
                  $in: [req.user._id, '$likersList'],
                },
                isRetweeted: {
                  $in: [req.user._id, '$retweetList'],
                },
              },
            },
            {
              $project: {
                likersList: 0,
                retweetList: 0,
              },
            },
            {
              $lookup: {
                from: 'users',
                let: { userId: '$userId' }, // Define a variable to store the value of the userId field
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$userId'] }, // Match documents where _id equals the userId variable
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      id: '$_id',
                      username: 1,
                      nickname: 1,
                      bio: 1,
                      profile_image: '$profileImage',
                      followers_num: { $size: '$followersUsers' },
                      following_num: { $size: '$followingUsers' },
                      isFollowed: { $in: [req.user._id, '$followersUsers'] },
                    },
                  },
                ],
                as: 'tweet_owner',
              },
            },
            {
              $facet: {
                paginatedResults: [{ $skip: skip }, { $limit: size }],
                totalCount: [{ $group: { _id: null, count: { $sum: 1 } } }],
              },
            },
          ]);
          const data = repliesList[0].paginatedResults;
          const totalCount =
            repliesList[0].totalCount.length > 0
              ? repliesList[0].totalCount[0].count
              : 0;

          res.status(200);
          res.json({
            status: 'Success',
            message: 'Tweet Replies Get Success',
            data,
          });
          return 1;
        }
      }
    } catch (err) {
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },
};

module.exports = TweetController;
