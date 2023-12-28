const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/user_model');
const homepageController = require('../controllers/homepage_controller');
const app = require('../app');
const Tweet = require('../models/tweet_model');
const { default: expect } = require('expect');
const { stringify } = require('json5');

const Message = require('../models/message_model');
const Chat = require('../models/chat_model');

let message1 = {
  description: 'message 1',
  media: {
    link: 'www.link.com',
    type: 'image',
  },
  sendTime: '2023-12-25T13:43:51.142Z',
};

let message2 = {
  description: 'message 2',
  media: {
    link: 'www.link.com',
    type: 'image',
  },
  sendTime: '2023-12-25T13:47:51.142Z',
};

let message3 = {
  description: 'message 3',
  media: {
    link: 'www.link.com',
    type: 'image',
  },
  sendTime: '2023-12-25T13:49:51.142Z',
};

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
};

const user1 = {
  username: 'karreeem_',
  email: 'kareemalaa555@gmail.com',
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

let token0;
let token1;
let testUser0;
let testUser1;
let testMessage0;
let testMessage1;
let testMessage2;

async function createUser(userData) {
  let user = await new User(userData);
  return await user.save();
}

async function createTweet(tweetData) {
  let tweet = await new Tweet(tweetData);
  return await tweet.save();
}

async function createMessage(messageData) {
  let message = await new Message(messageData);
  return await message.save();
}

async function deleteUser(userData) {
  await User.deleteOne(userData);
}

async function deleteTweet(tweetData) {
  await Tweet.deleteOne(tweetData);
}

async function deleteMessage(messageData) {
  await Message.deleteOne(messageData);
}

beforeAll(async () => {
  try {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    testUser0 = await createUser(user0);
    testUser1 = await createUser(user1);
    token0 = jwt.sign(
      { id: testUser0._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
    token1 = jwt.sign(
      { id: testUser1._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    message1.sender = testUser0._id;
    message2.sender = testUser1._id;
    message3.sender = testUser0._id;

    testMessage0 = await createMessage(message1);
    testMessage1 = await createMessage(message2);
    testMessage2 = await createMessage(message3);

    console.log(testMessage0, testMessage1, testMessage2);
    let newChat = await Chat.create({
      usersList: [testUser0._id, testUser1._id],
    });
    newChat.messagesList.push(testMessage0._id);
    newChat.messagesList.push(testMessage1._id);
    newChat.messagesList.push(testMessage2._id);

    testUser0.chatList.push(newChat._id);
    testUser1.chatList.push(newChat._id);

    await testUser0.save();
    await testUser1.save();
    await newChat.save();
  } catch (error) {
    console.log('Error during setup:', error);
  }
});

afterAll(async () => {
  await User.deleteMany();
  await Chat.deleteMany();
  await Message.deleteMany();
  await mongoose.disconnect();
  await mongoose.connection.close();
});

describe('Get /api/user/chat/:userId', () => {
  it('responds with 200 when both users exist', async () => {
    const response = await request(app)
      .get(`/api/user/chat/${testUser1._id}`)
      .set('Authorization', `Bearer ${token0}`);

    const message = await Message.find({ sender: testUser1._id, seen: false });
    console.log(message);

    expect(response.status).toBe(200);
    expect(response._body.data).toEqual([
      {
        id: response._body.data[0].id,
        description: 'message 1',
        media: { link: 'www.link.com', type: 'image' },
        isDeleted: false,
        mine: true,
        seen: false,
        sendTime: response._body.data[0].sendTime,
      },
      {
        id: response._body.data[1].id,
        description: 'message 2',
        media: { link: 'www.link.com', type: 'image' },
        isDeleted: false,
        mine: false,
        seen: false,
        sendTime: response._body.data[1].sendTime,
      },
      {
        id: response._body.data[2].id,
        description: 'message 3',
        media: { link: 'www.link.com', type: 'image' },
        isDeleted: false,
        mine: true,
        seen: false,
        sendTime: response._body.data[2].sendTime,
      },
    ]);
    expect(message.length).toBe(0);
  });

  it('responds with 404 when both user try get messages from himself', async () => {
    const response = await request(app)
      .get(`/api/user/chat/${testUser0._doc._id}`)
      .set('Authorization', `Bearer ${token0}`);
    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      status: 'This User Doesnt exist',
    });
  });

  it('responds with 500 when send invalid value for database', async () => {
    const response = await request(app)
      .get(`/api/user/chat/sadsads5415`)
      .set('Authorization', `Bearer ${token0}`);

    expect(response.status).toBe(500);
    expect(response.body).toStrictEqual({
      error: 'Internal Server Error',
    });
  });
});

describe('Get /api/user/chat/all', () => {
  it('responds with 200 when both users exist', async () => {
    const response = await request(app)
      .get(`/api/user/chat/all`)
      .set('Authorization', `Bearer ${token0}`);
    console.log(response._body.data, response.status, 'loooooooooooooooool');

    expect(response.status).toBe(200);
    expect(response._body.data).toEqual([
      {
        chat_members: [
          {
            nickname: 'Kareem Alaa',
            username: 'karreeem_',
            profile_image:
              'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
            id: testUser1._id.toString(),
          },
        ],
        lastMessage: {
          description: 'message 3',
          seen: true,
          sendTime: response._body.data[0].lastMessage.sendTime,
          isDeleted: false,
          sender: 'sara',
          media: {
            link: 'www.link.com',
            type: 'image',
          },
        },
        _id: testUser1._id.toString(),
        isFollowed: false,
        isBlocked: false,
        isFollowingMe: false,
      },
    ]);
  });

  it('responds with 500 when internal server error', async () => {
    jest.spyOn(Chat, 'aggregate').mockImplementationOnce(async () => {
      return null;
    });

    const response = await request(app)
      .get(`/api/user/chat/all`)
      .set('Authorization', `Bearer ${token0}`);

    expect(response.statusCode).toBe(500);
  });
});

describe('Get /api/user/chat/messagesAfterCertainTime/:userId', () => {
  it('responds with 200 when both users exist', async () => {
    const response = await request(app)
      .get(
        `/api/user/chat/messagesAfterCertainTime/${testUser1._id}?time=2023-12-25T13:47:51.142Z`,
      )
      .set('Authorization', `Bearer ${token0}`);

    const message = await Message.find({ sender: testUser1._id, seen: false });
    console.log(message);

    expect(response.status).toBe(200);
    expect(response._body.data).toEqual([
      {
        id: response._body.data[0].id,
        description: 'message 3',
        media: { link: 'www.link.com', type: 'image' },
        isDeleted: false,
        mine: true,
        seen: false,
        sendTime: response._body.data[0].sendTime,
      },
    ]);
    expect(message.length).toBe(0);
  });

  it('responds with 404 when both user try get messages from himself', async () => {
    const response = await request(app)
      .get(
        `/api/user/chat/messagesAfterCertainTime/${testUser0._id}?time=2023-12-25T13:47:51.142Z`,
      )
      .set('Authorization', `Bearer ${token0}`);
    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      status: 'This User Doesnt exist',
    });
  });

  it('responds with 500 when send invalid value for database', async () => {
    const response = await request(app)
      .get(
        `/api/user/chat/messagesAfterCertainTime/15153?time=2023-12-25T13:47:51.142Z`,
      )
      .set('Authorization', `Bearer ${token0}`);

    expect(response.status).toBe(500);
    expect(response.body).toStrictEqual({
      error: 'Internal Server Error',
    });
  });
});

describe('Get /api/user/chat/messagesBeforeCertainTime/:userId', () => {
  it('responds with 200 when both users exist', async () => {
    const response = await request(app)
      .get(
        `/api/user/chat/messagesBeforeCertainTime/${testUser1._id}?time=2023-12-25T13:47:51.142Z`,
      )
      .set('Authorization', `Bearer ${token0}`);

    const message = await Message.find({ sender: testUser1._id, seen: false });
    console.log(message);

    expect(response.status).toBe(200);
    expect(response._body.data).toEqual([
      {
        id: response._body.data[0].id,
        description: 'message 1',
        media: { link: 'www.link.com', type: 'image' },
        isDeleted: false,
        mine: true,
        seen: false,
        sendTime: response._body.data[0].sendTime,
      },
    ]);
    expect(message.length).toBe(0);
  });

  it('responds with 404 when both user try get messages from himself', async () => {
    const response = await request(app)
      .get(
        `/api/user/chat/messagesBeforeCertainTime/${testUser0._id}?time=2023-12-25T13:47:51.142Z`,
      )
      .set('Authorization', `Bearer ${token0}`);
    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      status: 'This User Doesnt exist',
    });
  });

  it('responds with 500 when send invalid value for database', async () => {
    const response = await request(app)
      .get(
        `/api/user/chat/messagesBeforeCertainTime/15153?time=2023-12-25T13:47:51.142Z`,
      )
      .set('Authorization', `Bearer ${token0}`);

    expect(response.status).toBe(500);
    expect(response.body).toStrictEqual({
      error: 'Internal Server Error',
    });
  });
});

describe('Get /api/user/search/:userId', () => {
  it('responds with 200 if there is word in the query', async () => {
    const response = await request(app)
      .get(`/api/user/chat/search/?word=message 2`)
      .set('Authorization', `Bearer ${token0}`);

    const message = await Message.find({ sender: testUser1._id, seen: false });
    console.log(message);

    expect(response.status).toBe(200);
    expect(response._body.data).toEqual([
      {
        chat_members: [
          {
            nickname: 'Kareem Alaa',
            username: 'karreeem_',
            profile_image:
              'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
            id: testUser1._id.toString(),
          },
        ],
        lastMessage: {
          description: 'message 2',
          seen: true,
          sendTime: response._body.data[0].lastMessage.sendTime,
          isDeleted: false,
          media: {
            link: 'www.link.com',
            type: 'image',
          },
          sender: 'karreeem_',
        },
        _id: testUser1._id.toString(),
        isFollowed: false,
        isBlocked: false,
        isFollowingMe: false,
      },
    ]);
    expect(message.length).toBe(0);
  });

  it('responds with 500 when internal server error', async () => {
    jest.spyOn(User, 'aggregate').mockImplementationOnce(async () => {
      return null;
    });

    const response = await request(app)
      .get(`/api/user/chat/search/?word=message 2`)
      .set('Authorization', `Bearer ${token0}`);

    expect(response.statusCode).toBe(500);
  });
});
