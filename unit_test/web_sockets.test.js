const io = require('socket.io-client');
const app = require('../app'); // Update with the correct path
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { expect } = require('@jest/globals');
const User = require('../models/user_model');
const Tweet = require('../models/tweet_model');
const fs = require('fs');
const Notification = require('../models/notification_model');
const Chat = require('../models/chat_model');
const Message = require('../models/message_model');
const { stringify } = require('querystring');
const { userDisconnected } = require('../controllers/message_controller');
require('../app_server');
const user0 = {
  username: 'sara',
  email: 'sara@gmail.com',
  bio: 'we are dead',
  birthDate: '6-4-2002',
  password: '$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS',
  bannerImage:
    'https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500',
  profileImage:
    'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
  phone: '01147119716',
  nickname: 'Kareem Alaa',
  website: 'www.wearedead.com',
  followersUsers: [],
  followingUsers: [],
  location: 'cairo',
  joinedAt: '12-9-2020',
  active: true,
  isDeleted: false,
  tweetList: [],
  likedTweets: [],
};

const user1 = {
  username: 'Ahmed',
  email: 'Ahmed@gmail.com',
  bio: 'we are dead',
  birthDate: '6-4-2002',
  password: '$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS',
  bannerImage:
    'https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500',
  profileImage:
    'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
  phone: '01147119716',
  nickname: 'Kareem Alaa',
  website: 'www.wearedead.com',
  followersUsers: [],
  followingUsers: [],
  tweetList: [],
  location: 'cairo',
  joinedAt: '12-9-2020',
  active: true,
  isDeleted: false,
};

const user2 = {
  username: 'saraaa',
  email: 'saraaa@gmail.com',
  bio: 'we are dead',
  birthDate: '6-4-2002',
  password: '$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS',
  bannerImage:
    'https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500',
  profileImage:
    'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
  phone: '01144119716',
  nickname: 'Kareem Alaa',
  website: 'www.wearedead.com',
  followersUsers: [],
  followingUsers: [],
  location: 'cairo',
  joinedAt: '12-9-2020',
  active: true,
  isDeleted: false,
  tweetList: [],
  likedTweets: [],
};

const user3 = {
  username: 'Ahmeddd',
  email: 'Ahmeddd@gmail.com',
  bio: 'we are dead',
  birthDate: '6-4-2002',
  password: '$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS',
  bannerImage:
    'https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500',
  profileImage:
    'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
  phone: '01145119716',
  nickname: 'Kareem Alaa',
  website: 'www.wearedead.com',
  followersUsers: [],
  followingUsers: [],
  tweetList: [],
  location: 'cairo',
  joinedAt: '12-9-2020',
  active: true,
  isDeleted: false,
};

let socket;
let token;
let token2;
let token3;

let testUser0;
let testUser1;
let testUser2;
let testUser3;
async function createUser(userData) {
  let user = await new User(userData);
  return await user.save();
}

async function createTweet(tweetData) {
  let tweet = await new Tweet(tweetData);
  return await tweet.save();
}

async function deleteUser(userData) {
  await User.deleteOne(userData);
}

async function deleteTweet(tweetData) {
  await Tweet.deleteOne(tweetData);
}

beforeAll(async () => {
  try {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    testUser0 = await createUser(user0);
    testUser1 = await createUser(user1);
    testUser2 = await createUser(user2);
    testUser3 = await createUser(user3);

    testUser2.blockingUsers.push(testUser3._id);
    await Promise.all([testUser2.save()]);
    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    token2 = jwt.sign(
      { id: testUser2._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
    token3 = jwt.sign(
      { id: testUser3._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
  } catch (error) {
    console.log('Error during setup:', error);
  }
});

afterAll(async () => {
  await deleteUser(user0);
  await deleteTweet(user1);
  await mongoose.disconnect();
  await mongoose.connection.close();

  if (socket.connected) {
    socket.disconnect();
    userDisconnected();
  }
});
describe('WebSocket server', () => {
  it('should handle if send wrong token', (done) => {
    socket = io('http://localhost:3002', {
      extraHeaders: {
        token: 'wrong token', // Provide a test token
      },
    });
    socket.on('token_error', (response) => {
      expect(response).toStrictEqual({ error: 'Unauthorized token' });
      done();
    });
  });

  it('should handle if send right token without recieverId', (done) => {
    socket = io('http://localhost:3002', {
      extraHeaders: {
        token: token, // Provide a test token
      },
    });
    socket.emit('send_message', { data: { id: '1548451848' } });
    socket.on('failed_to_send_message', (response) => {
      expect(response).toStrictEqual({
        error: 'User Not Found',
        id: '1548451848',
      });
      done();
    });
  });

  it('should handle if user tried talking to himself', (done) => {
    socket = io('http://localhost:3002', {
      extraHeaders: {
        token: token, // Provide a test token
      },
    });
    socket.emit('send_message', {
      reciever_ID: testUser0._id,
      data: { id: '1548451848' },
    });
    socket.on('failed_to_send_message', (response) => {
      expect(response).toStrictEqual({
        error: 'user cant talk to him/herself',
        id: '1548451848',
      });
      done();
    });
  });

  it('should handle if user tried talking to another user has been blocked by', (done) => {
    socket = io('http://localhost:3002', {
      extraHeaders: {
        token: token3, // Provide a test token
      },
    });
    socket.emit('send_message', {
      reciever_ID: testUser2._id,
      data: { id: '1548451848' },
    });
    socket.on('failed_to_send_message', (response) => {
      console.log(response);
      expect(response).toStrictEqual({
        error: 'this user has blocked you',
        id: '1548451848',
      });
      done();
    });
  });

  it('should handle if user tried talking to another user you have blocked', (done) => {
    socket = io('http://localhost:3002', {
      extraHeaders: {
        token: token2, // Provide a test token
      },
    });
    socket.on('connect', () => {});
    socket.emit('send_message', {
      reciever_ID: testUser3._id,
      data: { id: '1548451848' },
    });
    socket.on('failed_to_send_message', (response) => {
      expect(response).toStrictEqual({
        error: 'you have blocked this user',
        id: '1548451848',
      });
      done();
    });
  });

  it('should handle if user send empty message', (done) => {
    socket = io('http://localhost:3002', {
      extraHeaders: {
        token: token, // Provide a test token
      },
    });
    socket.on('connect', () => {});
    socket.emit('send_message', {
      reciever_ID: testUser1._id,
      data: { id: '1548451848' },
    });
    socket.on('failed_to_send_message', (response) => {
      expect(response).toStrictEqual({
        error: 'message must not be empty',
        id: '1548451848',
      });
      done();
    });
  });

  it('should handle if user send text only message', (done) => {
    socket = io('http://localhost:3002', {
      extraHeaders: {
        token: token, // Provide a test token
      },
    });
    socket.on('connect', () => {});
    socket.emit('send_message', {
      reciever_ID: testUser1._id,
      data: { id: '1548451848', text: 'test message' },
    });
    socket.on('receive_message', (response) => {
      expect(response).toStrictEqual({
        message: {
          id: response.message.id,
          description: 'test message',
          seen: false,
          sendTime: response.message.sendTime,
          media: {},
          mine: true,
        },
        chat_ID: response.chat_ID,
        id: '1548451848',
      });
      done();
    });
  });

  it('should handle if user send media only message', (done) => {
    socket = io('http://localhost:3002', {
      extraHeaders: {
        token: token, // Provide a test token
      },
    });
    socket.on('connect', () => {});
    socket.emit('send_message', {
      reciever_ID: testUser1._id,
      data: {
        id: '1548451848',
        media: {
          link: 'www.link.com',
          type: 'image',
        },
      },
    });
    socket.on('receive_message', (response) => {
      expect(response).toStrictEqual({
        message: {
          id: response.message.id,
          seen: false,
          sendTime: response.message.sendTime,
          media: { link: 'www.link.com', type: 'image' },
          mine: true,
        },
        chat_ID: response.chat_ID,
        id: '1548451848',
      });
      done();
    });
  });

  it('should handle if user send text and media', (done) => {
    socket = io('http://localhost:3002', {
      extraHeaders: {
        token: token, // Provide a test token
      },
    });
    socket.on('connect', () => {});
    socket.emit('send_message', {
      reciever_ID: testUser1._id,
      data: {
        id: '1548451848',
        text: 'test message',
        media: {
          link: 'www.link.com',
          type: 'image',
        },
      },
    });
    socket.on('receive_message', (response) => {
      expect(response).toStrictEqual({
        message: {
          id: response.message.id,
          seen: false,
          sendTime: response.message.sendTime,
          description: 'test message',
          media: { link: 'www.link.com', type: 'image' },
          mine: true,
        },
        chat_ID: response.chat_ID,
        id: '1548451848',
      });
      done();
    });
  });

  it('test all results', async () => {
    const chats = await Chat.find();
    const notifications = await Notification.find();
    const messages = await Message.find();

    expect(chats[0].usersList).toStrictEqual([testUser0._id, testUser1._id]);
    expect(chats[0].messagesList).toStrictEqual([
      messages[0]._id,
      messages[1]._id,
      messages[2]._id,
    ]);
    expect(chats.length).toBe(1);

    expect(notifications[0].type).toStrictEqual('message');
    expect(notifications[0].description).toStrictEqual(
      'sara sent you a message',
    );
    expect(notifications[0].notifier).toStrictEqual(testUser0._id);
    expect(notifications[0].notified).toStrictEqual(testUser1._id);

    expect(notifications[1].type).toStrictEqual('message');
    expect(notifications[1].description).toStrictEqual(
      'sara sent you a message',
    );
    expect(notifications[1].notifier).toStrictEqual(testUser0._id);
    expect(notifications[1].notified).toStrictEqual(testUser1._id);

    expect(notifications[2].type).toStrictEqual('message');
    expect(notifications[2].description).toStrictEqual(
      'sara sent you a message',
    );
    expect(notifications[2].notifier).toStrictEqual(testUser0._id);
    expect(notifications[2].notified).toStrictEqual(testUser1._id);

    expect(notifications.length).toBe(3);

    expect(messages[0].description).toStrictEqual('test message');
    expect(messages[0].sender).toStrictEqual(testUser0._id);

    expect(messages[1].media).toEqual({ link: 'www.link.com', type: 'image' });
    expect(messages[1].sender).toStrictEqual(testUser0._id);

    expect(messages[2].description).toStrictEqual('test message');
    expect(messages[2].media).toEqual({ link: 'www.link.com', type: 'image' });

    expect(messages[2].sender).toStrictEqual(testUser0._id);

    expect(messages.length).toBe(3);
  });
});
