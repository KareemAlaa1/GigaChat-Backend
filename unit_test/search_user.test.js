// const request = require('supertest');
// const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose');
// const { MongoMemoryServer } = require('mongodb-memory-server');
// const User = require('../models/user_model');
// const homepageController = require('../controllers/homepage_controller');
// const app = require('../app');
// const Tweet = require('../models/tweet_model');

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
// };

// const user1 = {
//   username: 'ahmed',
//   email: 'ahmed@gmail.com',
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

// let token;
// let testUser0;
// let testUser1;

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

//     testUser0 = await createUser(user0);
//     user1.blockingUsers.push(testUser0._id);
//     testUser1 = await createUser(user1);
//   } catch (error) {
//     console.error('Error during setup:', error);
//   }
// });

// afterAll(async () => {
//   await deleteUser(user0);
//   await deleteUser(user1);
//   await mongoose.disconnect();
//   await mongoose.connection.close();
// });

// describe('GET /api/user/search', () => {
//   it('responds with 200 and users matched search word', async () => {
//     token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });
//     const response = await request(app)
//       .get('/api/user/search?type=user&word=sara')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.body.results.length).toBe(1);
//   });
//   it('responds with 200 and no user found for this word', async () => {
//     token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });
//     const response = await request(app)
//       .get('/api/user/search?type=user&word=notfunduser')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.body.error).toBe('There is no result for this search word');
//   });
//   it('responds with 200 and no user found for this user because he was blocked', async () => {
//     token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });
//     const response = await request(app)
//       .get('/api/user/search?type=user&word=ahmed')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.body.error).toBe('There is no result for this search word');
//   });
//   it('responds with 500 when internal server error happens', async () => {
//     jest
//       .spyOn(mongoose.model('User'), 'aggregate')
//       .mockImplementation(async () => new Error('Simulated error during save'));

//     token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });
//     const response = await request(app)
//       .get('/api/user/search?type=user&word=notfundhashtag')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(500);
//   });
//   it('responds with 400 when search word is missed', async () => {
//     token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });

//     const response = await request(app)
//       .get('/api/user/search?type=user')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(400);
//     expect(response.body.error).toBe(
//       'Search request must have a search word in query',
//     );
//   });
//   it('responds with 400 when type of search is missed', async () => {
//     token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });

//     const response = await request(app)
//       .get('/api/user/search?word=dfd')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(400);
//     expect(response.body.error).toBe(
//       'Search request must have a type in query one of these values [ user , tweet , hashtag ] ',
//     );
//   });
//   it('responds with 400 when type of search is unvalid', async () => {
//     token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });

//     const response = await request(app)
//       .get('/api/user/search?word=dfd&type=sd')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(400);
//     expect(response.body.error).toBe(
//       'Only these values [ user , tweet , hashtag ] are allowed in type of search request',
//     );
//   });
// });
