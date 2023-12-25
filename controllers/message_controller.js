const User = require('../models/user_model');
const Media = require('../models/media_model');
const Chat = require('../models/chat_model');
const Message = require('../models/message_model');
const mongoose = require('mongoose');
const { checkToken } = require('./auth_controller');
const notificationController = require('./notifications_controller');

const sockets_users = {};
const users_sockets = {};
exports.handleSocketAuth = async (socket, token) => {
  try {
    const userId = await checkToken(token);

    if (!userId) {
      console.log('Token is not valid');
      socket.emit('token_error', { error: 'Unauthorized token' });
      socket.disconnect();
      return;
    } else {
      console.log('Connection Success Token');
      users_sockets[userId] = socket.id;
      sockets_users[socket.id] = userId;
      return true;
    }
  } catch (error) {
    return false;
  }
};

exports.sendMessage = async (socket, recieverId, messageData) => {
  try {
    // get the senderId
    const senderId = sockets_users[socket.id];

    // get the reciever User
    const recieverUser =
      await User.findById(recieverId).select('_id blockingUsers');
    const senderUser =
      await User.findById(senderId).select('_id blockingUsers username profileImage');

    // user not found check
    if (!recieverUser) {
      return socket.emit('failed_to_send_message', {
        error: 'User Not Found',
        id: messageData.id,
      });
    }

    // user cant talk to him/herself
    if (recieverId === senderId) {
      return socket.emit('failed_to_send_message', {
        error: 'user cant talk to him/herself',
        id: messageData.id,
      });
    }

    // if i am blocked by the other user or i block the other user send failed to send
    if (senderUser.blockingUsers.includes(recieverUser._id)) {
      return socket.emit('failed_to_send_message', {
        error: 'you have blocked this user',
        id: messageData.id,
      });
    }

    if (recieverUser.blockingUsers.includes(senderUser._id)) {
      return socket.emit('failed_to_send_message', {
        error: 'this user has blocked you',
        id: messageData.id,
      });
    }

    // message cant be empty
    const media = messageData.media;
    const description = messageData.text;
    const id = messageData.id;

    if (!description && !media)
      return socket.emit('failed_to_send_message', {
        error: 'message must not be empty',
        id: messageData.id,
      });

    // get the chat id of certain user
    const chatId = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(senderId) },
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
          $in: [new mongoose.Types.ObjectId(recieverId), '$chats.usersList'],
        },
      })
      .project({ id: '$chats._id', exist: '$chats.exist' })
      .match({
        exist: true,
      });

    // Create a new message
    let message;

    if (description && media) {
      message = await Message.create({
        description: description,
        media: {
          link: media.link,
          type: media.type,
        },
        sender: new mongoose.Types.ObjectId(senderId),
        sendTime: Date.now(),
      });
    } else if (description) {
      message = await Message.create({
        description: description,
        sender: new mongoose.Types.ObjectId(senderId),
        sendTime: Date.now(),
      });
    } else {
      message = await Message.create({
        media: {
          link: media.link,
          type: media.type,
        },
        sender: new mongoose.Types.ObjectId(senderId),
        sendTime: Date.now(),
      });
    }
    // if chat exist then send else create new chat and add its id to chatList of the users and send
    if (chatId.length > 0) {
      await Chat.findByIdAndUpdate(chatId[0].id, {
        $push: { messagesList: message._doc._id },
      });
    } else {
      const newChat = await Chat.create({
        usersList: [
          new mongoose.Types.ObjectId(senderId),
          new mongoose.Types.ObjectId(recieverId),
        ],
      });
      await Chat.findByIdAndUpdate(newChat._doc._id, {
        $push: { messagesList: message._doc._id },
      });
      const updatedItems = await User.updateMany(
        {
          _id: {
            $in: [recieverUser._id, new mongoose.Types.ObjectId(senderId)],
          },
        },
        { $push: { chatList: newChat._doc._id } },
      );
    }

    const retMessage = {
      id: message._doc._id,
      description: message._doc.description,
      seen: message._doc.seen,
      sendTime: message._doc.sendTime,
      media: message._doc.media,
      mine: false,
    };

    // finally send the message

    if (users_sockets[recieverId])
      socket.broadcast
        .to(users_sockets[recieverId])
        .emit('receive_message', { message: retMessage, chat_ID: senderId });

    //region Notification
    // Add code for notification here
    try {
      const notification = await notificationController.addMessageNotification(
        senderUser, recieverUser, retMessage.description
      );
    }
    catch (e){

    }
    //endregion


    retMessage.mine = true;
    socket.emit('receive_message', {
      message: retMessage,
      chat_ID: recieverId,
      id: id,
    });
  } catch (error) {
    console.log(error);
    return socket.emit('failed_to_send_message', {
      error: error,
      id: messageData.id,
    });
  }
};

exports.userDisconnected = (socketId) => {
  delete users_sockets[[sockets_users[socketId]]];
  delete sockets_users[socketId];
};
