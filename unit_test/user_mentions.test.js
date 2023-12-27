// const request = require('supertest');
// const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose');
// const { MongoMemoryServer } = require('mongodb-memory-server');
// const User = require('../models/user_model');
// const Tweet = require('../models/tweet_model');
// const app = require('../app');
// const { expect } = require('@jest/globals');

// const user0 = {
//   username: 'sara',
//   email: 'sara@gmail.com',
//   bio: 'we are dead',
//   birthDate: '6-4-2002',
//   password: '$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS',
//   bannerImage:
//     'https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500',
//   profileImage:
//     'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
//   phone: '01147119716',
//   nickname: 'Kareem Alaa',
//   website: 'www.wearedead.com',
//   followersUsers: [],
//   followingUsers: [],
//   location: 'cairo',
//   joinedAt: '12-9-2020',
//   active: true,
//   isDeleted: false,
//   mentionList: [],
//   likedTweets: [],
// };

// const tweet = {
//   description: 'tweeeeeeeeeeeet #Gaza #Palestine',
//   media: [
//     {
//       data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
//       type: 'jpg',
//       _id: '654c193b688f342c88a547e9',
//     },
//   ],
//   views: 0,
//   repliesList: ['6550d2f9f9088e88318fd10c'],
//   likersList: ['654eed855b0fe11cd47fc7eb', '6550d2f9f9088e88318fd10c'],
//   retweetList: [],
//   quoteRetweetList: [],
//   type: 'tweet',
//   referredTweetId: '654c208f3476660250272d80',
//   createdAt: '2023-11-30T23:25:51.078Z',
//   isDeleted: false,
//   __v: 0,
//   userId: '654e915d9d2badfa163e3c97',
// };

// const tweetOwner = {
//   username: 'malek',
//   email: 'malek@gmail.com',
//   bio: 'we are dead',
//   birthDate: '6-4-2002',
//   password: '$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS',
//   bannerImage:
//     'https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500',
//   profileImage:
//     'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
//   phone: '01147119716',
//   nickname: 'Kareem Alaa',
//   website: 'www.wearedead.com',
//   followersUsers: [],
//   followingUsers: [],
//   location: 'cairo',
//   joinedAt: '12-9-2020',
//   active: true,
//   isDeleted: false,
// };

// const user1 = {
//   username: 'Ahmed',
//   email: 'Ahmed@gmail.com',
//   bio: 'we are dead',
//   birthDate: '6-4-2002',
//   password: '$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS',
//   bannerImage:
//     'https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500',
//   profileImage:
//     'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
//   phone: '01147119716',
//   nickname: 'Kareem Alaa',
//   website: 'www.wearedead.com',
//   followersUsers: [],
//   followingUsers: [],
//   tweetList: [],
//   mentionList: [],
//   location: 'cairo',
//   joinedAt: '12-9-2020',
//   active: true,
//   isDeleted: false,
// };

// let token;
// let testUser0;
// let testUser1;
// let testTweetOwner;
// let testTweet;

// async function createUser(userData) {
//   let user = new User(userData);
//   return await user.save();
// }

// async function createTweet(tweetData) {
//   let tweet = new Tweet(tweetData);
//   return await tweet.save();
// }

// async function deleteUser(userData) {
//   await User.deleteOne(userData);
// }

// async function deleteTweet(tweetData) {
//   await Tweet.deleteOne(tweetData);
// }

// beforeAll(async () => {
//   try {
//     const mongoServer = await MongoMemoryServer.create();
//     await mongoose.connect(mongoServer.getUri());

//     testUser1 = await createUser(user1);

//     testTweetOwner = await createUser(tweetOwner);
//     tweet.userId = testTweetOwner._id;
//     testTweet = await createTweet(tweet);
//     user0.mentionList.push(testTweet._id);
//     testUser0 = await createUser(user0);
//   } catch (error) {
//     console.error('Error during setup:', error);
//   }
// });

// afterAll(async () => {
//   await deleteUser(user0);
//   await deleteUser(tweetOwner);
//   await deleteTweet(tweet);
//   await deleteUser(user1);
//   await mongoose.disconnect();
//   await mongoose.connection.close();
// });

// describe.only('GET /api/homepage/mention', () => {
//   it('responds with 200 and user tweets when user exists', async () => {
//     token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });
//     const response = await request(app)
//       .get('/api/homepage/mention')
//       .set('Authorization', `Bearer ${token}`);
//     expect(response.status).toBe(200);
//     expect(response.body.status).toBe('success');
//     expect(response.body.tweetList.length).toBe(1);
//   });

//   it('responds with error when user wasnot mentioned in tweets ', async () => {
//     token = jwt.sign(
//       { id: testTweetOwner._id.toString() },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//       },
//     );
//     const response = await request(app)
//       .get('/api/homepage/mention')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(404);

//     expect(response.body.error).toBe('This user wasnot mentioned in any tweet');
//   });
// });
