const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  discription: {
    type: String,
    required: true,
  },
  media: {
    photo: {
      type: String,
    },
    vedio: {
      type: String,
    },
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seen: {
    type: Boolean,
    required: true,
  },
  sendTime: {
    type: Date,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
