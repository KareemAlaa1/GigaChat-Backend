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

const validTweet = {
  description: 'test add tweet 1 2 3 4 test',
  media: [
    {
      data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
      type: 'jpg',
      _id: '654c193b688f342c88a547e9',
    },
  ],
  type: 'tweet',
};

const validReply = {
  description: 'test add reply 1 2 3 4 test',
  media: [
    {
      data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
      type: 'jpg',
      _id: '654c193b688f342c88a547e9',
    },
  ],
  type: 'reply',
};

const inValidReply = {
  description: 'test add reply 1 2 3 4 test',
  media: [
    {
      data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
      type: 'jpg',
      _id: '654c193b688f342c88a547e9',
    },
  ],
  type: 'reply',
};

const inValidTweet = {
  type: 'tweet',
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

describe('Post /api/tweets/', () => {
  it('responds with 201 when user exists with valid tweet', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    addedTweet.media[0]._id = addedTweet.media[0]._id.toString();
    const temp = response._body.data.creation_time;
    delete response._body.data.creation_time;
    response._body.data.creation_time = stringify(temp);

    expect(response.status).toBe(201);
    expect(response._body).toEqual({
      status: 'Tweet Add Success',
      data: {
        id: addedTweet._id.toString(),
        userId: addedTweet.userId.toString(),
        description: addedTweet.description,
        viewsNum: addedTweet.views,
        likesNum: addedTweet.likersList.length,
        repliesNum: addedTweet.repliesList.length,
        repostsNum: addedTweet.retweetList.length,
        media: [
          {
            data: addedTweet.media[0].data,
            type: addedTweet.media[0].type,
            _id: addedTweet.media[0]._id.toString(),
          },
        ],
        type: addedTweet.type,
        creation_time: stringify(addedTweet.createdAt),
        tweet_owner: {
          id: testUser0._id.toString(),
          username: testUser0.username,
          nickname: testUser0.nickname,
          bio: testUser0.bio,
          profile_image: testUser0.profileImage,
          followers_num: testUser0.followersUsers.length,
          following_num: testUser0.followingUsers.length,
        },
      },
    });
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 401 when user unAuthorized', async () => {
    const response = await request(app).post('/api/tweets/').send(validTweet);
    const addedTweet = (await Tweet.find())[0];
    expect(response.status).toBe(401);
    expect(addedTweet).toBe(undefined);
  });

  it('responds with 400 when invalid tweet no media and no description', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(inValidTweet);
    const addedTweet = (await Tweet.find())[0];

    expect(response.status).toBe(400);
    expect(response._body).toEqual({
      status: 'bad request',
      message: 'no media and no description',
    });
    expect(addedTweet).toBe(undefined);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 500 when send invalid value for database', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'test',
        type: 'twet',
      });
    const addedTweet = (await Tweet.find())[0];

    expect(response.status).toBe(500);
    expect(addedTweet).toBe(undefined);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 500 when internal server error happens', async () => {
    jest
      .spyOn(mongoose.model('Tweet'), 'create')
      .mockImplementationOnce(
        async () => new Error('Simulated error during save'),
      );
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);
    const addedTweet = (await Tweet.find())[0];

    expect(response.status).toBe(500);
    expect(addedTweet).toBe(undefined);
    await Tweet.deleteMany();
    await User.deleteMany();
  });
});

describe('Patch /api/tweets/retweet/:tweetId', () => {
  it('responds with 204 when user exists and tweet exists', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .patch(`/api/tweets/retweet/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(204);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when user exists and tweet doesnt', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .patch(`/api/tweets/retweet/654c193b688f342c88a547e8`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(404);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when user exists and tweet exists but deleted', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const updatedTweet = {};
    updatedTweet.isDeleted = true;
    await Tweet.findByIdAndUpdate(addedTweet._id, updatedTweet);
    const response2 = await request(app)
      .patch(`/api/tweets/retweet/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(404);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 401 when user unAuthorized', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app).patch(
      `/api/tweets/retweet/${addedTweet._id}`,
    );

    expect(response2.status).toBe(401);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 401 when user exists but deleted and tweet exists', async () => {
    deletedTestUser1 = await createUser(deletedUser);
    token1 = jwt.sign(
      { id: deletedTestUser1._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
    testUser0 = await createUser(user0);

    token2 = jwt.sign(
      { id: testUser0._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token2}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .patch(`/api/tweets/retweet/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(response2.status).toBe(401);
    await Tweet.deleteMany();
    await User.deleteMany();
  });
});

describe('Get /api/tweets/:tweetId', () => {
  it('responds with 200 when user exists and tweet exists', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .get(`/api/tweets/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    // console.log(response2._body);
    expect(response2.status).toBe(200);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when user exists and tweet doesnt', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .get(`/api/tweets/654c193b688f342c88a547e8`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(404);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when user exists and tweet exists but deleted', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const updatedTweet = {};
    updatedTweet.isDeleted = true;
    await Tweet.findByIdAndUpdate(addedTweet._id, updatedTweet);
    const response2 = await request(app)
      .get(`/api/tweets/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(404);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 401 when user doesnt exist or deleted and tweet exists', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];

    const updatedUser = {};
    updatedUser.isDeleted = true;
    await User.findByIdAndUpdate(testUser0._id, updatedUser);
    const response2 = await request(app)
      .get(`/api/tweets/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(401);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 401 when user unAuthorized', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app).get(`/api/tweets/${addedTweet._id}`);

    expect(response2.status).toBe(401);
    await Tweet.deleteMany();
    await User.deleteMany();
  });
});

describe('Get /api/tweets/likers/:tweetId', () => {
  it('responds with 200 when user exists and tweet exists', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .get(`/api/tweets/likers/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(200);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when user exists and tweet doesnt', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .get(`/api/tweets/likers/654c193b688f342c88a547e8`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(404);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when user exists and tweet exists but deleted', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const updatedTweet = {};
    updatedTweet.isDeleted = true;

    await Tweet.findByIdAndUpdate(addedTweet._id, updatedTweet);

    const response2 = await request(app)
      .get(`/api/tweets/likers/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(404);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 401 when user unAuthorized', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app).get(
      `/api/tweets/likers/${addedTweet._id}`,
    );

    expect(response2.status).toBe(401);
    await Tweet.deleteMany();
    await User.deleteMany();
  });
});

describe('Get /api/tweets/replies/:tweetId', () => {
  it('responds with 200 when user exists and tweet exists', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .get(`/api/tweets/replies/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(200);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when user exists and tweet doesnt', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .get(`/api/tweets/replies/654c193b688f342c88a547e8`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(404);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when user exists and tweet exists but deleted', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const updatedTweet = {};
    updatedTweet.isDeleted = true;

    await Tweet.findByIdAndUpdate(addedTweet._id, updatedTweet);

    const response2 = await request(app)
      .get(`/api/tweets/replies/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(404);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 401 when user unAuthorized', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app).get(
      `/api/tweets/replies/${addedTweet._id}`,
    );

    expect(response2.status).toBe(401);
    await Tweet.deleteMany();
    await User.deleteMany();
  });
});

describe('Delete /api/tweets/:tweetId', () => {
  it('responds with 204 when user exists and tweet exists and user is the owner of the tweet', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .delete(`/api/tweets/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    // console.log(response2._body);
    expect(response2.status).toBe(204);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 401 when user exists and tweet exists and user is not the owner of the tweet', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    testUser1 = await createUser(user1);

    token = jwt.sign({ id: testUser1._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .delete(`/api/tweets/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(401);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when user exists and tweet exists but deleted', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const updatedTweet = {};
    updatedTweet.isDeleted = true;
    await Tweet.findByIdAndUpdate(addedTweet._id, updatedTweet);
    const response2 = await request(app)
      .delete(`/api/tweets/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(404);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when user exists and tweet doesnt', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .delete(`/api/tweets/654c193b688f342c88a547e8`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(404);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 401 when user unAuthorized', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app).delete(
      `/api/tweets/${addedTweet._id}`,
    );

    expect(response2.status).toBe(401);
    await Tweet.deleteMany();
    await User.deleteMany();
  });
});

describe('Get /api/tweets/retweeters/:tweetId', () => {
  it('responds with 200 when user exists and tweet exists', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .get(`/api/tweets/retweeters/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(200);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 401 when user unAuthorized', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app).get(
      `/api/tweets/retweeters/${addedTweet._id}`,
    );

    expect(response2.status).toBe(401);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when tweet does not exist', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const response = await request(app)
      .get('/api/tweets/retweeters/654c193b688f342c88a547e8')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    await User.deleteMany();
  });
});

describe('Patch /api/tweets/unretweet/:tweetId', () => {
  it('responds with 204 when user exists and tweet exists and have retweeted', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];

    const response2 = await request(app)
      .patch(`/api/tweets/retweet/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);
    const response3 = await request(app)
      .patch(`/api/tweets/unretweet/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response3.status).toBe(204);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 400 when user exists and tweet exists and have not retweeted', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];

    const response2 = await request(app)
      .patch(`/api/tweets/unretweet/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(400);
    await Tweet.deleteMany();
    await User.deleteMany();
  });
  it('responds with 404 when user exists and tweet doesnt', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .patch(`/api/tweets/unretweet/654c193b688f342c88a547e8`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(404);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 404 when user exists and tweet exists but deleted', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const updatedTweet = {};
    updatedTweet.isDeleted = true;
    await Tweet.findByIdAndUpdate(addedTweet._id, updatedTweet);
    const response2 = await request(app)
      .patch(`/api/tweets/unretweet/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(404);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 401 when user unAuthorized', async () => {
    testUser0 = await createUser(user0);

    token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app).patch(
      `/api/tweets/unretweet/${addedTweet._id}`,
    );

    expect(response2.status).toBe(401);
    await Tweet.deleteMany();
    await User.deleteMany();
  });

  it('responds with 401 when user exists but deleted and tweet exists', async () => {
    deletedTestUser1 = await createUser(deletedUser);
    token1 = jwt.sign(
      { id: deletedTestUser1._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
    testUser0 = await createUser(user0);

    token2 = jwt.sign(
      { id: testUser0._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
    const response1 = await request(app)
      .post('/api/tweets/')
      .set('Authorization', `Bearer ${token2}`)
      .send(validTweet);

    const addedTweet = (await Tweet.find())[0];
    const response2 = await request(app)
      .patch(`/api/tweets/unretweet/${addedTweet._id}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(response2.status).toBe(401);
    await Tweet.deleteMany();
    await User.deleteMany();
  });
});
