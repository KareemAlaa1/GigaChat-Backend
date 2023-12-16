const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  description: {
    type: String,
  },
  media: {
    link: {
      type: String,
    },
    type: {
      type: String, // jpg , mp4 , gif
    },
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seen: {
    type: Boolean,
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
