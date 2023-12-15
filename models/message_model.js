const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seen: {
    type: Boolean,
    required: true,
    default: false,
  },
  sendTime: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
