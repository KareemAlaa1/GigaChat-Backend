const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/user_model');
const Hashtag = require('../models/hashtag_model');
const app = require('../app');
const Tweet = require('../models/tweet_model');
const { expect } = require('@jest/globals');

const user = {
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

const tweet = {
  description: 'tweeeeeeeeeeeet #Gaza #Palestine',
  media: [
    {
      data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
      type: 'jpg',
      _id: '654c193b688f342c88a547e9',
    },
  ],
  views: 0,
  repliesList: ['6550d2f9f9088e88318fd10c'],
  likersList: ['654eed855b0fe11cd47fc7eb', '6550d2f9f9088e88318fd10c'],
  retweetList: [],
  quoteRetweetList: [],
  type: 'tweet',
  referredTweetId: '654c208f3476660250272d80',
  createdAt: '2023-11-30T23:25:51.078Z',
  isDeleted: false,
  __v: 0,
  userId: '654e915d9d2badfa163e3c97',
};

const hashtag = {
  title: '#Gaza',
  count: 1,
  tweet_list: [],
};

const tweetOwner = {
  username: 'malek',
  email: 'malek@gmail.com',
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

let token;
let testUser0;
let testUserWithoutFollowing;
let testUserWithFollowingWithNoTweets;
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

async function createHashtag(hashtagData) {
  let hashtag = await new Hashtag(hashtagData);
  return await hashtag.save();
}

async function deleteHashtag(hashtagData) {
  await Hashtag.deleteOne(hashtagData);
}

async function deleteAllHashtags() {
  await Hashtag.deleteMany();
}

beforeEach(async () => {
  try {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await deleteAllHashtags();
    testTweetOwner = await createUser(tweetOwner);
    tweet.userId = testTweetOwner._id;
    testTweet = await createTweet(tweet);
    hashtag.tweet_list.push(testTweet._id);

    testHashtag = await createHashtag(hashtag);

    testUser = await createUser(user);
    token = jwt.sign({ id: testUser._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  } catch (error) {
    console.error('Error during setup:', error);
  }
});

afterEach(async () => {
  await deleteUser(user);
  await deleteHashtag(hashtag);
  await deleteUser(tweetOwner);
  await deleteTweet(tweet);
  await mongoose.disconnect();
  await mongoose.connection.close();
});

describe('GET /api/trends/all', () => {
  it('responds with 200 and all available trends', async () => {
    console.log(await Hashtag.find());
    const response = await request(app)
      .get('/api/trends/all')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data[0]._id).toBe(testHashtag._id.toString());
  });

  it('responds with 401 when user unAuthorized', async () => {
    const response = await request(app).get('/api/trends/all');
    expect(response.status).toBe(401);
  });

  it('responds with empty data when no hashtag', async () => {
    await deleteAllHashtags();
    const response = await request(app)
      .get('/api/trends/all')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(0);
  });

  it('responds with 500 when internal server error happens', async () => {
    jest
      .spyOn(mongoose.model('Hashtag'), 'aggregate')
      .mockImplementationOnce(
        async () => new Error('Simulated error during save'),
      );

    const response = await request(app)
      .get('/api/trends/all')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
  });
});

describe('GET /api/trends/:trend', () => {
  it('responds with 200 and all tweets found in this trend (valid trend)', async () => {
    const response = await request(app)
      .get('/api/trends/Gaza')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.length).toBe(1);
  });

  it('responds with 401 when user unAuthorized', async () => {
    const response = await request(app).get('/api/trends/all');
    expect(response.status).toBe(401);
  });

  it('responds with 404 empty data when no availabe hashtag with this title', async () => {
    const response = await request(app)
      .get('/api/trends/NotFoundHashtag')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Hashtag Not Found');
  });

  it('responds with 400 when bad request (request number of tweets bigger than found)', async () => {
    jest
      .spyOn(mongoose.model('Hashtag'), 'aggregate')
      .mockImplementation(async () => new Error('Simulated error during save'));
    const response = await request(app)
      .get('/api/trends/Gaza')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, count: 100 });
    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('Invalid page and count value');
  });

  it('responds with 404 when no tweets found for the given hashtag', async () => {
    const dummyHashtag = {
      title: '#HashtagWithoutTweets',
      tweet_list: [],
    };
    const createdHashtag = await createHashtag(dummyHashtag);
    const response = await request(app)
      .get('/api/trends/HashtagWithoutTweets')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, count: 100 });
    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('No Tweets Found For This Hashtag');
    await deleteHashtag(dummyHashtag);
  });
  it('responds with 500 when internal server error happens', async () => {
    jest
      .spyOn(mongoose.model('Hashtag'), 'aggregate')
      .mockImplementationOnce(
        async () => new Error('Simulated error during save'),
      );

    const response = await request(app)
      .get('/api/trends/Gaza')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
  });
});
