const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user_model');
const Chat = require('../models/chat_model');
const Hashtag = require('../models/hashtag_model');
const Message = require('../models/message_model');
const Tweet = require('../models/tweet_model');
const Notification = require('../models/notification_model');
const Media = require('../models/media_model');

dotenv.config({ path: '../config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

// READ JSON FILE
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const chats = JSON.parse(fs.readFileSync(`${__dirname}/chats.json`, 'utf-8'));
const hashtags = JSON.parse(
  fs.readFileSync(`${__dirname}/hashtags.json`, 'utf-8'),
);
const messages = JSON.parse(
  fs.readFileSync(`${__dirname}/messages.json`, 'utf-8'),
);
const tweets = JSON.parse(fs.readFileSync(`${__dirname}/tweets.json`, 'utf-8'));
const notifications = JSON.parse(
  fs.readFileSync(`${__dirname}/notifications.json`, 'utf-8'),
);

const media = JSON.parse(fs.readFileSync(`${__dirname}/media.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    const usersPromise = await User.create(users);
    const chatsPromise = await Chat.create(chats);
    const hashtagsPromise = await Hashtag.create(hashtags);
    const messagesPromise = await Message.create(messages);
    const tweetsPromise = await Tweet.create(tweets);
    const notificationsPromise = await Notification.create(notifications);
    const mediaPromise = await Media.create(media);

    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    const usersPromise = await User.deleteMany();
    const chatsPromise = await Chat.deleteMany();
    const hashtagsPromise = await Hashtag.deleteMany();
    const messagesPromise = await Message.deleteMany();
    const tweetsPromise = await Tweet.deleteMany();
    const notificationsPromise = await Notification.deleteMany();
    const mediaPromise = await Media.deleteMany();

    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// if (process.argv[2] === '--import') {
//   importData();
// } else if (process.argv[2] === '--delete') {
//   deleteData();
// }

importData();
