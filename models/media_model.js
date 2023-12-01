
const mongoose = require('mongoose');
const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    // enum: {
    //     values: ['video', 'image', 'gif'],
    //     message: 'media type is either: image, video or gif',
    //   },
    // required: true,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  cloudStrogePath:{
    type: String,
    required: true,
    unique: true,    
  },
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;
