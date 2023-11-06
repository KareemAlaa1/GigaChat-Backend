const mongoose = require('mongoose');
const validator = require('validator');

const chatSchema = new mongoose.Schema({
  usersList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  messagesList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  ],
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
