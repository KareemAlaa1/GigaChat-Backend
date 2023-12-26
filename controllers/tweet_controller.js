const mongoose = require('mongoose');
const Tweet = require('../models/tweet_model');
const User = require('../models/user_model');
const extractHashtags = require('../utils/extract_hashtags');
const deleteHashtags = require('../utils/delete_hashtags');

const extractMentions = require('../utils/extract_mentions');
const deleteMentions = require('../utils/delete_mentions');

const notificationController = require('./notifications_controller');

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
        let newTweet;
        req.body.createdAt = Date.now();
        if (req.body.type == 'tweet') {
          newTweet = await Tweet.create(req.body);
          let retTweet = {};
          retTweet = await getRequiredTweetDatafromTweetObject(newTweet._doc);
          retTweet.tweet_owner = await getUserDatabyId(req.body.userId);
          await User.findByIdAndUpdate(req.body.userId, {
            $push: {
              tweetList: {
                tweetId: retTweet.id,
                type: req.body.type,
                createdAt: Date.now(),
              },
            },
          });
          let data = retTweet;
          await notificationController.addMentionNotification(req.user, data);
          if (req.body.description) {
            await extractHashtags(newTweet);
            await extractMentions(newTweet);
          }
          res.status(201);
          res.json({
            status: 'Tweet Add Success',
            data,
          });
        } else {
          const referredTweet = await getTweetDatabyId(
            req.body.referredTweetId,
          );
          if (referredTweet) {
            const updatedTweet = {};
            updatedTweet.repliesCount = referredTweet.repliesNum + 1;
            await Tweet.findByIdAndUpdate(referredTweet.id, updatedTweet);

            if (referredTweet.type == 'tweet') {
              newTweet = await Tweet.create({
                userId: req.body.userId,
                description: req.body.description,
                media: req.body.media,
                type: req.body.type,
                referredTweetId: referredTweet.id,
                referredReplyId: referredTweet.id,
                createdAt: Date.now(),
              });
            } else {
              newTweet = await Tweet.create({
                userId: req.body.userId,
                description: req.body.description,
                media: req.body.media,
                type: req.body.type,
                referredTweetId: referredTweet.referredTweetId,
                referredReplyId: referredTweet.id,
                createdAt: Date.now(),
              });
            }

            let retTweet = {};
            retTweet = await getRequiredTweetDatafromTweetObject(newTweet._doc);
            retTweet.tweet_owner = await getUserDatabyId(req.body.userId);
            await User.findByIdAndUpdate(req.body.userId, {
              $push: {
                tweetList: {
                  tweetId: retTweet.id,
                  type: req.body.type,
                  createdAt: Date.now(),
                },
              },
            });
            let data = retTweet;
            let notification;
            //region addNotification
            if (data.type != 'tweet') {
              if (data.type == 'reply') {
                notification =
                  await notificationController.addReplyNotification(
                    req.user,
                    referredTweet.userId,
                    data.referredReplyId,
                  );
              } else if (data.type == 'quote') {
                console.log(req.user);

                notification =
                  await notificationController.addQuoteNotification(
                    req.user,
                    referredTweet.userId,
                    data.referredReplyId,
                  );
              }
            }
            await notificationController.addMentionNotification(req.user, data);
            //endregion
            if (req.body.description) {
              await extractHashtags(newTweet);
              await extractMentions(newTweet);
            }
            res.status(201);
            res.json({
              status: 'Tweet Add Success',
              data,
            });
          } else {
            res.status(400);
            res.json({
              status: 'bad request',
              message: 'no referred Tweet Id',
            });
          }
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  retweetTweet: async (req, res) => {
    try {
      const currUser = req.user;
      const tweet = await Tweet.findById(req.params.tweetId);
      if (!tweet || tweet.isDeleted) {
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
          if (tweet.retweetList.includes(currUser._id)) {
            res.status(400);
            res.json({
              status: 'Bad request, User already retweeted this tweet',
            });
          } else {
            await Tweet.findByIdAndUpdate(tweet._id, {
              $push: { retweetList: req.user._id },
            });
            await User.findByIdAndUpdate(req.user._id, {
              $push: {
                tweetList: {
                  tweetId: tweet._id,
                  type: 'retweet',
                  createdAt: Date.now(),
                },
              },
            });
            //region addRetweetNotification
            const notification =
              await notificationController.addRetweetNotification(
                currUser,
                tweet,
              );
            //endregion
            res.status(204);
            res.json({
              status: 'Retweet Success',
            });
          }
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  undoRetweetTweet: async (req, res) => {
    try {
      const currUser = req.user;
      const tweet = await Tweet.findById(req.params.tweetId);
      if (!tweet || tweet.isDeleted) {
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
          if (!tweet.retweetList.includes(currUser._id)) {
            res.status(400);
            res.json({
              status: 'Bad request, you have not retweeted this tweet',
            });
          } else {
            await Tweet.findByIdAndUpdate(tweet._id, {
              $pull: { retweetList: req.user._id },
            });
            await User.findByIdAndUpdate(req.user._id, {
              $pull: { tweetList: { tweetId: tweet._id, type: 'retweet' } },
            });
            res.status(204);
            res.json({
              status: 'Retweet Success',
            });
          }
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

            if (tweet.description) {
              await deleteHashtags(tweet);
              await deleteMentions(tweet);
            }

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
      console.log(err);
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
              $match: {
                _id: { $nin: req.user.blockingUsers },
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
                isFollowingMe: { $in: [req.user._id, '$followingUsers'] },
                blockingUsers: 1,
              },
            },
            {
              $match: {
                blockingUsers: { $nin: [req.user._id] },
              },
            },
            {
              $project: {
                blockingUsers: 0,
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
              $match: {
                _id: { $nin: req.user.blockingUsers },
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
                isFollowingMe: { $in: [req.user._id, '$followingUsers'] },
                blockingUsers: 1,
              },
            },
            {
              $match: {
                blockingUsers: { $nin: [req.user._id] },
              },
            },
            {
              $project: {
                blockingUsers: 0,
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
          W;
          res.status(404);
          res.json({
            status: 'Fail',
            message: 'Can not Find This Tweet',
          });
        } else {
          const page = req.query.page * 1 || 1;
          const size = req.query.count * 1 || 1;
          const skip = (page - 1) * size;
          const repliesList = await Tweet.aggregate([
            {
              $match: {
                type: 'reply',
                referredReplyId: new mongoose.Types.ObjectId(
                  req.params.tweetId,
                ),
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 0,
                referredTweetId: '$referredReplyId',
                description: 1,
                id: '$_id',
                userId: 1,
                media: 1,
                type: 1,
                creation_time: '$createdAt',
                viewsNum: '$views',
                repliesNum: '$repliesCount',
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
                      isFollowingMe: { $in: [req.user._id, '$followingUsers'] },
                      blockingUsers: 1,
                    },
                  },
                ],
                as: 'tweet_owner_list',
              },
            },
            {
              $addFields: {
                tweet_owner: { $arrayElemAt: ['$tweet_owner_list', 0] },
              },
            },
            {
              $project: {
                tweet_owner_list: 0,
              },
            },
            {
              $match: {
                userId: { $nin: req.user.blockingUsers },
              },
            },
            {
              $addFields: {
                blockingUsers: '$tweet_owner.blockingUsers',
              },
            },
            {
              $match: {
                blockingUsers: { $nin: [req.user._id] },
              },
            },
            {
              $project: {
                blockingUsers: 0,
              },
            },
            {
              $facet: {
                paginatedResults: [{ $skip: skip }, { $limit: size }],
                totalCount: [{ $group: { _id: null, count: { $sum: 1 } } }],
              },
            },
          ]);
          let data = repliesList[0].paginatedResults;
          const totalCount =
            repliesList[0].totalCount.length > 0
              ? repliesList[0].totalCount[0].count
              : 0;

          data = await Promise.all(
            data.map(async (el) => {
              const replyOfReply = await Tweet.aggregate([
                {
                  $match: {
                    type: 'reply',
                    referredReplyId: new mongoose.Types.ObjectId(el.id),
                    isDeleted: false,
                  },
                },
                {
                  $project: {
                    _id: 0,
                    referredTweetId: '$referredReplyId',
                    description: 1,
                    id: '$_id',
                    userId: 1,
                    media: 1,
                    type: 1,
                    creation_time: '$createdAt',
                    viewsNum: '$views',
                    repliesNum: '$repliesCount',
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
                          isFollowed: {
                            $in: [req.user._id, '$followersUsers'],
                          },
                          isFollowingMe: {
                            $in: [req.user._id, '$followingUsers'],
                          },
                        },
                      },
                    ],
                    as: 'tweet_owner_list',
                  },
                },
                {
                  $addFields: {
                    tweet_owner: { $arrayElemAt: ['$tweet_owner_list', 0] },
                  },
                },
                {
                  $project: {
                    tweet_owner_list: 0,
                  },
                },
                {
                  $sort: {
                    likesNum: -1, // 1 for ascending, -1 for descending
                  },
                },
                {
                  $limit: 1,
                },
              ]);
              el.reply = replyOfReply.length > 0 ? replyOfReply[0] : {};
              return el;
            }),
          );
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
      console.log(err);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  getTweetOwner: async (req, res) => {
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
          const tweet_owner = user.username;
          res.status(200);
          res.json({
            status: 'Tweet Owner Get Success',
            data: { tweet_owner },
          });
        }
      }
    } catch (err) {
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },
};

module.exports = TweetController;
