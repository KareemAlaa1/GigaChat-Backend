const mongoose = require('mongoose');
const Chat = require('../models/chat_model');
const Message = require('../models/message_model');
const User = require('../models/user_model');

const { paginate } = require('../utils/api_features');

exports.getAllConversations = async (req, res) => {
  try {
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
      .addFields({
        lastMessage: {
          seen: {
            $cond: {
              if: { $eq: ['$lastMessage.sender', req.user.username] },
              then: true,
              else: '$lastMessage.seen',
            },
          },
        },
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
    const size = parseInt(req.query.count, 10) || 100;

    const skip = ((req.query.page || 1) - 1) * size;
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
          media: '$messagesList.media',
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
            media: '$message.media',
          },
          chat_members: 1,
          isFollowed: 1,
          isBlocked: 1,
          isFollowingMe: 1,
          _id: 1,
        },
      },
    ])
      .skip(skip)
      .limit(size);
    return res.status(200).send({ status: 'success', data: messages });
  } catch (error) {
    // Handle and log errors
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
};

exports.getMessagesAfterCertainTime = async (req, res) => {
  try {
    const recieverUser = await User.findById(req.params.userId).select('_id');
    // user cant talk to him/herself

    if (
      recieverUser &&
      recieverUser._id.toString() !== req.user._id.toString()
    ) {
      // get the chat id of certain user

      const chatId = await User.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
        },
        {
          $project: { chatList: 1 },
        },
      ])
        .lookup({
          from: 'chats',
          localField: 'chatList',
          foreignField: '_id',
          as: 'chats',
        })
        .unwind('chats')
        .project({ chats: 1, _id: 0 })
        .addFields({
          'chats.exist': {
            $in: [
              new mongoose.Types.ObjectId(req.params.userId),
              '$chats.usersList',
            ],
          },
        })
        .project({ id: '$chats._id', exist: '$chats.exist' })
        .match({
          exist: true,
        });
      // if chat id exist get the messages in it else send empty array
      // and also specify if the message is mine or not in the response
      if (chatId.length > 0) {
        const size = parseInt(req.query.count, 10) || 10;
        const time = req.query.time;

        const skip = ((req.query.page || 1) - 1) * size;
        const messages = await Chat.aggregate([
          {
            $match: { _id: chatId[0].id },
          },
          {
            $project: { messagesList: 1, _id: 0 },
          },
        ])
          .lookup({
            from: 'messages',
            localField: 'messagesList',
            foreignField: '_id',
            as: 'message',
          })
          .unwind('message')
          .project({ message: 1 })
          .addFields({
            'message.mine': {
              $eq: [
                new mongoose.Types.ObjectId(req.user._id),
                '$message.sender',
              ],
            },
          })
          .project({
            id: '$message._id',
            description: '$message.description',
            media: '$message.media',
            isDeleted: '$message.isDeleted',
            mine: '$message.mine',
            seen: '$message.seen',
            sendTime: '$message.sendTime',
            compareTime: { $toLong: '$message.sendTime' },
          })
          .match({
            compareTime: { $gt: new Date(time).getTime() },
          })
          .project({
            compareTime: 0,
          })
          .sort({ id: -1 })
          .skip(skip)
          .limit(size)
          .sort({ id: 1 });

        const updatedMessages = await Message.updateMany(
          {
            sendTime: { $gte: new Date(time).getTime() },
            sender: req.params.userId,
            seen: false,
          },
          { seen: true },
        );

        res.status(200).json({
          status: 'messages get success',
          data: messages,
        });
      } else {
        const messages = [];
        res.status(200).json({
          status: 'messages get success',
          data: messages,
        });
      }
    } else {
      res.status(404).json({
        status: 'This User Doesnt exist',
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.getMessagesBeforeCertainTime = async (req, res) => {
  try {
    const recieverUser = await User.findById(req.params.userId).select('_id');
    // user cant talk to him/herself

    if (
      recieverUser &&
      recieverUser._id.toString() !== req.user._id.toString()
    ) {
      // get the chat id of certain user

      const chatId = await User.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
        },
        {
          $project: { chatList: 1 },
        },
      ])
        .lookup({
          from: 'chats',
          localField: 'chatList',
          foreignField: '_id',
          as: 'chats',
        })
        .unwind('chats')
        .project({ chats: 1, _id: 0 })
        .addFields({
          'chats.exist': {
            $in: [
              new mongoose.Types.ObjectId(req.params.userId),
              '$chats.usersList',
            ],
          },
        })
        .project({ id: '$chats._id', exist: '$chats.exist' })
        .match({
          exist: true,
        });
      // if chat id exist get the messages in it else send empty array
      // and also specify if the message is mine or not in the response
      if (chatId.length > 0) {
        const size = parseInt(req.query.count, 10) || 10;
        const time = req.query.time;

    

        const skip = ((req.query.page || 1) - 1) * size;
        const messages = await Chat.aggregate([
          {
            $match: { _id: chatId[0].id },
          },
          {
            $project: { messagesList: 1, _id: 0 },
          },
        ])
          .lookup({
            from: 'messages',
            localField: 'messagesList',
            foreignField: '_id',
            as: 'message',
          })
          .unwind('message')
          .project({ message: 1 })
          .addFields({
            'message.mine': {
              $eq: [
                new mongoose.Types.ObjectId(req.user._id),
                '$message.sender',
              ],
            },
          })
          .project({
            id: '$message._id',
            description: '$message.description',
            media: '$message.media',
            isDeleted: '$message.isDeleted',
            mine: '$message.mine',
            seen: '$message.seen',
            sendTime: '$message.sendTime',
            compareTime: { $toLong: '$message.sendTime' },
          })
          .match({
            compareTime: { $lt: new Date(time).getTime() },
          })
          .project({
            compareTime: 0,
          })
          .sort({ id: -1 })
          .skip(skip)
          .limit(size)
          .sort({ id: 1 });
        const updatedMessages = await Message.updateMany(
          {
            sendTime: { $lte: new Date(time).getTime() },
            sender: req.params.userId,
            seen: false,
          },
          { seen: true },
        );
        res.status(200).json({
          status: 'messages get success',
          data: messages,
        });
      } else {
        const messages = [];
        res.status(200).json({
          status: 'messages get success',
          data: messages,
        });
      }
    } else {
      res.status(404).json({
        status: 'This User Doesnt exist',
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};
