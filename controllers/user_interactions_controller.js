const express = require('express');
const User = require('../models/user_model');
const Tweet = require('../models/tweet_model');
const mongoose = require('mongoose');
const notificationController = require('./notifications_controller');

exports.follow = async (req, res) => {
  try {
    const username = req.params.username;
    const currUser = req.user;

    if (!username)
      return res.status(400).send({ error: 'Bad request, send username' });

    const followedUser = await User.findOne({
      username: username,
      isDeleted: false,
      active: true,
    });

    if (!followedUser) return res.status(404).send({ error: 'user not found' });

    if (currUser._id.toString() === followedUser._id.toString())
      return res.status(400).send({ error: "You Can't follow your self" });

    if (followedUser.followersUsers.includes(currUser._id))
      return res
        .status(400)
        .send({ error: 'Bad request, User already followed' });
    if (currUser.followingUsers.includes(followedUser._id))
      return res
        .status(400)
        .send({ error: 'Bad request, User already followed' });

    followedUser.followersUsers.push(currUser._id);
    currUser.followingUsers.push(followedUser._id);

    await followedUser.save();
    await currUser.save();
    //region addFollowNotification
    const notification = await notificationController.addFollowNotification(
      currUser,
      followedUser,
    );
    console.log(notification);
    return res.status(204).end();
    //endregion
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: error });
  }
};

exports.unfollow = async (req, res) => {
  try {
    const username = req.params.username;
    const currUser = req.user;

    if (!username) return res.status(400).send({ error: 'Bad request' });

    const followedUser = await User.findOne({
      username: username,
      isDeleted: false,
      active: true,
    });

    if (!followedUser) return res.status(404).send({ error: 'user not found' });

    if (currUser._id.toString() === followedUser._id.toString())
      return res.status(400).send({ error: "You Can't unfollow your self" });

    if (!followedUser.followersUsers.includes(currUser._id))
      return res
        .status(400)
        .send({ error: 'Bad request, User already unfollowed' });
    if (!currUser.followingUsers.includes(followedUser._id))
      return res
        .status(400)
        .send({ error: 'Bad request, User already unfollowed' });

    followedUser.followersUsers = followedUser.followersUsers.filter(
      (_id) => _id.toString() !== currUser._id.toString(),
    );
    currUser.followingUsers = currUser.followingUsers.filter(
      (_id) => _id.toString() !== followedUser._id.toString(),
    );

    await followedUser.save();
    await currUser.save();

    return res.status(204).end();
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: error });
  }
};

exports.like = async (req, res) => {
  try {
    const tweetId = req.params.tweetId;
    const currUser = req.user;

    if (!tweetId)
      return res.status(400).send({ error: 'Bad request, send ID' });

    const likedTweet = await Tweet.findById(tweetId);

    if (!likedTweet || likedTweet.isDeleted)
      return res.status(404).send({ error: 'tweet not found' });

    if (likedTweet.likersList.includes(currUser._id))
      return res
        .status(400)
        .send({ error: 'Bad request, User already like this tweet' });
    if (currUser.likedTweets.includes(likedTweet._id))
      return res
        .status(400)
        .send({ error: 'Bad request, User already like this tweet' });

    likedTweet.likersList.push(currUser._id);
    currUser.likedTweets.push(likedTweet._id);

    await likedTweet.save();
    await currUser.save();
    //region addLikeNotification
    const notification = await notificationController.addLikeNotification(
      currUser, likedTweet
    )
    //endregion
    return res.status(204).end();
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.unlike = async (req, res) => {
  try {
    const tweetId = req.params.tweetId;
    const currUser = req.user;

    if (!tweetId)
      return res.status(400).send({ error: 'Bad request, send ID' });

    const likedTweet = await Tweet.findById(tweetId);

    if (!likedTweet && likedTweet.isDeleted)
      return res.status(404).send({ error: 'tweet not found' });

    if (!likedTweet.likersList.includes(currUser._id))
      return res
        .status(400)
        .send({ error: "Bad request, User already doesn't like this tweet1" });
    if (!currUser.likedTweets.includes(likedTweet._id))
      return res
        .status(400)
        .send({ error: "Bad request, User already doesn't like this tweet2" });

    likedTweet.likersList = likedTweet.likersList.filter(
      (_id) => _id.toString() !== currUser._id.toString(),
    );
    currUser.likedTweets = currUser.likedTweets.filter(
      (_id) => _id.toString() !== likedTweet._id.toString(),
    );

    await likedTweet.save();
    await currUser.save();

    return res.status(204).end();
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const username = req.params.username;
    const currUser = req.user;
    const page = req.query.page * 1 || 1;
    const limit = req.query.count * 1 || 1;
    const skip = (page - 1) * limit;

    if (!username)
      return res.status(400).send({ error: 'Bad request, send username' });

    const targetUser = await User.findOne({ username: username, isDeleted: false, active: true });

    if (!targetUser) return res.status(404).send({ error: 'User Not Found' });

    if (
      !targetUser.followersUsers ||
      targetUser.followersUsers === undefined ||
      targetUser.followersUsers.length == 0
    )
      return res.status(200).send({
        status: 'success',
        users: [],
      });

    const user = await User.aggregate([
      {
        $match: { username: username, isDeleted: false, active: true },
      },
    ])
      .lookup({
        from: 'users',
        localField: 'followersUsers',
        foreignField: '_id',
        as: 'followersUsers',
      })
      .project({
        followersUsers: 1,
      })
      .unwind('followersUsers')
      .addFields({
        'followersUsers.isFollowed': {
          $in: [currUser._id, '$followersUsers.followersUsers'],
        },
        'followersUsers.followers_num': {
          $size: '$followersUsers.followersUsers',
        },
        'followersUsers.followings_num': {
          $size: '$followersUsers.followingUsers',
        },
        'followersUsers.is_curr_user': {
          $eq: [currUser._id, '$followersUsers._id'],
        },
        'followersUsers.profile_image': '$followersUsers.profileImage',
      })
      .match({
        'followersUsers.blockingUsers': { $nin: [currUser._id] },
        _id : { $nin: targetUser.blockingUsers }
      })
      .project({
        _id: 0,
        _id: '$followersUsers._id',
        isFollowed: '$followersUsers.isFollowed',
        bio: '$followersUsers.bio',
        username: '$followersUsers.username',
        profile_image: '$followersUsers.profile_image',
        nickname: '$followersUsers.nickname',
        followers_num: '$followersUsers.followers_num',
        followings_num: '$followersUsers.followings_num',
        is_curr_user: '$followersUsers.is_curr_user',
      })
      .skip(skip)
      .limit(limit);

    return res.status(200).send({
      status: 'success',
      users: user
    });
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.getFollowings = async (req, res) => {
  try {
    const username = req.params.username;
    const currUser = req.user;
    const page = req.query.page * 1 || 1;
    const limit = req.query.count * 1 || 1;
    const skip = (page - 1) * limit;

    if (!username)
      return res.status(400).send({ error: 'Bad request, send username' });

    const targetUser = await User.findOne({ username });

    if (!targetUser) return res.status(404).send({ error: 'User Not Found' });
    if (!targetUser.followingUsers ||
      targetUser.followingUsers === undefined ||
      targetUser.followingUsers.length == 0)
      return res.status(200).send({
        status: 'success',
        users: [],
      });

    const user = await User.aggregate([
      {
        $match: { username: username, isDeleted: false, active: true },
      },
    ])
      .lookup({
        from: 'users',
        localField: 'followingUsers',
        foreignField: '_id',
        as: 'followingUsers',
      })
      .project({
        followingUsers: 1,
      })
      .unwind('followingUsers')
      .addFields({
        'followingUsers.isFollowed': {
          $in: [currUser._id, '$followingUsers.followersUsers'],
        },
        'followingUsers.followers_num': {
          $size: '$followingUsers.followersUsers',
        },
        'followingUsers.followings_num': {
          $size: '$followingUsers.followingUsers',
        },
        'followingUsers.is_curr_user': {
          $eq: [currUser._id, '$followingUsers._id'],
        },
        'followingUsers.profile_image': '$followingUsers.profileImage',
      })
      .match({
        'followingUsers.blockingUsers': { $nin: [currUser._id] },
        _id : { $nin: currUser.blockingUsers }
      })
      .project({
        _id: 0,
        _id: '$followingUsers._id',
        isFollowed: '$followingUsers.isFollowed',
        bio: '$followingUsers.bio',
        username: '$followingUsers.username',
        profile_image: '$followingUsers.profile_image',
        nickname: '$followingUsers.nickname',
        followers_num: '$followingUsers.followers_num',
        followings_num: '$followingUsers.followings_num',
        is_curr_user: '$followingUsers.is_curr_user',
      })
      .skip(skip)
      .limit(limit);

    return res.status(200).send({
      status: 'success',
      users: user
    });
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};


exports.mute = async (req, res) => {
  try {
    const username = req.params.username;
    const currUser = req.user;

    if (!username)
      return res.status(400).send({ error: 'Bad request, send username' });

    const mutedUser = await User.findOne({
      username: username,
      isDeleted: false,
      active: true,
    });

    if (!mutedUser) return res.status(404).send({ error: 'user not found' });

    if (currUser._id.toString() === mutedUser._id.toString())
      return res.status(400).send({ error: "You Can't mute yourself" });

    if (currUser.mutedUsers.includes(mutedUser._id))
      return res.status(400).send({ error: 'Bad request, User already muted' });

    currUser.mutedUsers.push(mutedUser._id);

    await currUser.save();

    return res.status(204).end();
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.unmute = async (req, res) => {
  try {
    const username = req.params.username;
    const currUser = req.user;

    if (!username)
      return res.status(400).send({ error: 'Bad request, send username' });

    const mutedUser = await User.findOne({
      username: username,
      isDeleted: false,
      active: true,
    });

    if (!mutedUser) return res.status(404).send({ error: 'user not found' });

    if (currUser._id.toString() === mutedUser._id.toString())
      return res.status(400).send({ error: "You Can't unmute yourself" });

    if (!currUser.mutedUsers.includes(mutedUser._id))
      return res
        .status(400)
        .send({ error: 'Bad request, User already not muted' });

    currUser.mutedUsers = currUser.mutedUsers.filter(
      (_id) => _id.toString() !== mutedUser._id.toString(),
    );
    await currUser.save();

    return res.status(204).end();
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.block = async (req, res) => {
  try {
    const username = req.params.username;
    const currUser = req.user;

    if (!username)
      return res.status(400).send({ error: 'Bad request, send username' });

    const blockedUser = await User.findOne({
      username: username,
      isDeleted: false,
      active: true,
    });

    if (!blockedUser) return res.status(404).send({ error: 'user not found' });

    if (currUser._id.toString() === blockedUser._id.toString())
      return res.status(400).send({ error: "You Can't block yourself" });

    if (currUser.blockingUsers.includes(blockedUser._id))
      return res
        .status(400)
        .send({ error: 'Bad request, User already blocked' });

    currUser.blockingUsers.push(blockedUser._id);

    currUser.followersUsers = currUser.followersUsers.filter(
      (_id) => _id.toString() !== blockedUser._id.toString(),
    );
    currUser.followingUsers = currUser.followingUsers.filter(
      (_id) => _id.toString() !== blockedUser._id.toString(),
    );

    blockedUser.followersUsers = blockedUser.followersUsers.filter(
      (_id) => _id.toString() !== currUser._id.toString(),
    );
    blockedUser.followingUsers = blockedUser.followingUsers.filter(
      (_id) => _id.toString() !== currUser._id.toString(),
    );

    await blockedUser.save();
    await currUser.save();

    return res.status(204).end();
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.unblock = async (req, res) => {
  try {
    const username = req.params.username;
    const currUser = req.user;

    if (!username)
      return res.status(400).send({ error: 'Bad request, send username' });

    const blockedUser = await User.findOne({
      username: username,
      isDeleted: false,
      active: true,
    });

    if (!blockedUser) return res.status(404).send({ error: 'user not found' });

    if (currUser._id.toString() === blockedUser._id.toString())
      return res.status(400).send({ error: "You Can't unblock yourself" });

    if (!currUser.blockingUsers.includes(blockedUser._id))
      return res
        .status(400)
        .send({ error: 'Bad request, User already not blocked' });

    currUser.blockingUsers = currUser.blockingUsers.filter(
      (_id) => _id.toString() !== blockedUser._id.toString(),
    );
    await currUser.save();

    return res.status(204).end();
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.getBlockList = async (req, res) => {
  try {
    const currUser = req.user;

    const page = req.query.page * 1 || 1;
    const limit = req.query.count * 1 || 1;
    const skip = (page - 1) * limit;

    const blockList = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(currUser._id) },
      },
    ])
      .lookup({
        from: 'users',
        localField: 'blockingUsers',
        foreignField: '_id',
        as: 'blockedUsers',
      })
      .unwind('blockedUsers')
      .project({
        blockedUsers: 1,
      })
      .project({
        _id: 0,
        id: '$blockedUsers._id',
        username: '$blockedUsers.username',
        nickname: '$blockedUsers.nickname',
        bio: '$blockedUsers.bio',
        profile_image: '$blockedUsers.profileImage',
        followers_num: { $size: '$blockedUsers.followersUsers' },
        following_num: { $size: '$blockedUsers.followingUsers' },
        isMuted: { $in: ['$blockedUsers._id', currUser.mutedUsers] },
      })
      .skip(skip)
      .limit(limit);
    res.status(200).json({
      status: 'Blocked Users Get Success',
      data: blockList,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.getMuteList = async (req, res) => {
  try {
    const currUser = req.user;

    const page = req.query.page * 1 || 1;
    const limit = req.query.count * 1 || 1;
    const skip = (page - 1) * limit;

    const muteList = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(currUser._id) },
      },
    ])
      .lookup({
        from: 'users',
        localField: 'mutedUsers',
        foreignField: '_id',
        as: 'mutedUsers',
      })
      .unwind('mutedUsers')
      .project({
        mutedUsers: 1,
      })
      .project({
        _id: 0,
        id: '$mutedUsers._id',
        username: '$mutedUsers.username',
        nickname: '$mutedUsers.nickname',
        bio: '$mutedUsers.bio',
        profile_image: '$mutedUsers.profileImage',
        followers_num: { $size: '$mutedUsers.followersUsers' },
        following_num: { $size: '$mutedUsers.followingUsers' },
        isFollowed: { $in: [currUser._id, '$mutedUsers.followersUsers'] },
        isBlocked: { $in: ['$mutedUsers._id', currUser.blockingUsers] },
      })
      .skip(skip)
      .limit(limit);
    res.status(200).json({
      status: 'Muted Users Get Success',
      data: muteList,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};
