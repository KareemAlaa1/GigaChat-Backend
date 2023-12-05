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

const message = {
  message: 'hello 1 2 3',
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

const deletedUser = {
  username: 'karreeem222',
  email: 'kareemalaad555@gmail.com',
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
  isDeleted: true,
};

let token;
let testUser0;
let testUser1;
let deletedTestUser1;

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
  } catch (error) {
    console.error('Error during setup:', error);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});

describe('Post /api/user/chat/:userId', () => {
  it('responds with 201 when both users exist', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    testUser1 = await createUser(user1);

    const response = await request(app)
      .post(`/api/user/chat/${testUser1._doc._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(message);

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      status: 'message sent success',
    });
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 400 when both users exist but no media or description', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    testUser1 = await createUser(user1);

    const response = await request(app)
      .post(`/api/user/chat/${testUser1._doc._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({
      status: 'bad request',
      message: 'no media and no message',
    });

    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when both user try message himself', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const response = await request(app)
      .post(`/api/user/chat/${testUser0._doc._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      status: 'This User Doesnt exist',
    });

    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 500 when send invalid value for database', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    testUser1 = await createUser(user1);

    const response = await request(app)
      .post(`/api/user/chat/sadsads5415`)
      .set('Authorization', `Bearer ${token}`)
      .send(message);
    expect(response.status).toBe(500);
    expect(response.body).toStrictEqual({
      error: 'Internal Server Error',
    });

    await Tweet.deleteMany();
    await User.deleteMany();
  });
});

describe('Get /api/user/chat/:userId', () => {
  it('responds with 200 when both users exist', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    testUser1 = await createUser(user1);

    const response = await request(app)
      .get(`/api/user/chat/${testUser1._doc._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when both user try get messages from himself', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const response = await request(app)
      .get(`/api/user/chat/${testUser0._doc._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      status: 'This User Doesnt exist',
    });

    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 500 when send invalid value for database', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    testUser1 = await createUser(user1);

    const response = await request(app)
      .get(`/api/user/chat/sadsads5415`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toStrictEqual({
      error: 'Internal Server Error',
    });

    await Tweet.deleteMany();
    await User.deleteMany();
  });
});
