const mongoose = require('mongoose');
const Chat = require('../models/chat_model');
const User = require('../models/user_model');

const { paginate } = require('../utils/api_features');

exports.getAllConversations = async (req, res) => {
  try {
    console.log(req.user._id);
    const chats = await Chat.aggregate([
      {
        $match: { usersList: { $in: [req.user._id] } },
      },
    ])
      .unwind('$usersList')
      .match({
        usersList: { $ne: req.user._id },
      })
      .lookup({
        from: 'users',
        localField: 'usersList',
        foreignField: '_id',
        as: 'usersList',
      })
      .unwind('usersList')
      .project({
        chat_members: {
          nickname: '$usersList.nickname',
          username: '$usersList.username',
          profile_image: '$usersList.profileImage',
          id: '$usersList._id',
        },
        lastMessage: { $arrayElemAt: ['$messagesList', -1] },
      })
      .group({
        _id: '$_id',
        chat_members: {
          $push: '$chat_members',
        },
        lastMessage: { $first: '$lastMessage' },
      })
      .lookup({
        from: 'messages',
        localField: 'lastMessage',
        foreignField: '_id',
        as: 'lastMessage',
      })
      .unwind('lastMessage')
      .lookup({
        from: 'users',
        localField: 'lastMessage.sender',
        foreignField: '_id',
        as: 'lastMessage.sender',
      })
      .unwind('lastMessage.sender')
      .project({
        chat_members: 1,
        lastMessage: {
          description: 1,
          sender: '$lastMessage.sender.username',
          seen: 1,
          sendTime: 1,
          isDeleted: 1,
          media: '$lastMessage.media',
        },
        _id: { $arrayElemAt: ['$chat_members', 0] },
      })
      .project({
        chat_members: 1,
        lastMessage: 1,
        _id: '$_id.id',
        isFollowed: { $in: ['$_id.id', req.user.followingUsers] },
        isBlocked: { $in: ['$_id.id', req.user.blockingUsers] },
        isFollowingMe: {
          $in: ['$_id.id', req.user.followersUsers],
        },
      });

    try {
      // send result
      return res.status(200).send({ status: 'success', data: chats });
    } catch (error) {
      console.log(error.message);
      return res.status(404).send({ error: error.message });
    }
  } catch (error) {
    // Handle and log errors
    return res.status(500).send({ error: error.message });
  }
};

exports.searchMessage = async (req, res) => {
  try {
    console.log(req.query.word);
    currentUser = req.user;
    const messages = await User.aggregate([
      {
        $match: {
          _id: currentUser._id,
        },
      },
      {
        $project: {
          chatList: 1,
        },
      },
      {
        $lookup: {
          from: 'chats',
          localField: 'chatList',
          foreignField: '_id',
          as: 'chats',
        },
      },
      {
        $unwind: '$chats',
      },
      {
        $project: {
          _id: '$chats.usersList',
          messagesList: '$chats.messagesList',
        },
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'messagesList',
          foreignField: '_id',
          as: 'messagesList',
        },
      },
      {
        $unwind: '$messagesList',
      },
      {
        $project: {
          usersList: '$_id',
          messagesList: 1,
          _id: 0,
          text: '$messagesList.description',
        },
      },
      {
        $match: {
          text: {
            $regex: new RegExp(req.query.word, 'i'), // 'i' for case-insensitive matching
          },
        },
      },
      {
        $unwind: '$usersList',
      },
      {
        $match: {
          usersList: { $ne: currentUser._id },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'usersList',
          foreignField: '_id',
          as: 'usersList',
        },
      },
      {
        $addFields: {
          chat_id: { $arrayElemAt: ['$usersList', 0] },
        },
      },
      {
        $project: {
          message: '$messagesList',
          chat_id: {
            nickname: '$chat_id.nickname',
            username: '$chat_id.username',
            profile_image: '$chat_id.profileImage',
            id: '$chat_id._id',
          },
          isFollowed: { $in: ['$chat_id._id', currentUser.followingUsers] },
          isBlocked: { $in: ['$chat_id._id', currentUser.blockingUsers] },
          isFollowingMe: {
            $in: ['$chat_id._id', req.user.followersUsers],
          },
          _id: '$chat_id._id',
        },
      },
      {
        $project: {
          message: 1,
          chat_members: ['$chat_id'],
          isFollowed: 1,
          isBlocked: 1,
          isFollowingMe: 1,
          _id: 1,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'message.sender',
          foreignField: '_id',
          as: 'sender',
        },
      },
      {
        $addFields: {
          sender: { $arrayElemAt: ['$sender', 0] },
        },
      },
      {
        $project: {
          message: 1,
          chat_members: 1,
          isFollowed: 1,
          isBlocked: 1,
          isFollowingMe: 1,
          _id: 1,
          sender: '$sender.username',
        },
      },
      {
        $project: {
          lastMessage: {
            description: '$message.description',
            seen: '$message.seen',
            sendTime: '$message.sendTime',
            isDeleted: '$message.isDeleted',
            sender: '$sender',
          },
          chat_members: 1,
          isFollowed: 1,
          isBlocked: 1,
          isFollowingMe: 1,
          _id: 1,
        },
      },
    ]);
    return res.status(200).send({ status: 'success', data: messages });
  } catch (error) {
    // Handle and log errors
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
};
