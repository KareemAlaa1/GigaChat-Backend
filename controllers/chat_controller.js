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

// exports.searchMessage = async (req, res) => {
//   try {
//     currentUser = req.user;
//     const messages = await User.aggregate([
//       {
//         $match: {
//           _id: currentUser._id,
//         },
//       },
//       {
//         $project: {
//           chatList: 1,
//         },
//       },
//       {
//         $lookup: {
//           from: 'chats',
//           localField: 'chatList',
//           foreignField: '_id',
//           as: 'chats',
//         },
//       },
//       {
//         $unwind: '$chats',
//       },
//       {
//         $project: {
//           _id: '$chats.usersList',
//           messagesList: '$chats.messagesList',
//         },
//       },
//       {
//         $addFields: {
//           filteredTweetOwners: {
//             $filter: {
//               input: '$_id', // Assuming 'filteredTweetOwners' is the array field
//               as: 'owner',
//               cond: { $eq: ['$$owner._id', currentUser._id] },
//             },
//           },
//         },
//       },
//     ]);
//     return res.status(200).send({
//       data: messages,
//     });
//   } catch (error) {
//     // Handle and log errors
//     console.log(error);
//     return res.status(500).send({ error: error.message });
//   }
// };
