const mongoose = require('mongoose');
const validator = require('validator');

const chatSchema = new mongoose.Schema({
  usersList: [
    {
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
  messagesList: [
    {
      message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    },
  ],
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
