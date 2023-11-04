var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const validator = require('validator');

var chatSchema = new Schema({
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

const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat
