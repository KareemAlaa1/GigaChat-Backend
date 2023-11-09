const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user_model');

//TODO: add auth middleware in the request
test('should get timeline tweets', async () => {
  const response = await request(app).get('/homepage/following').expect(200);
});

//TODO: uncomment this part after adding authotrization
// test('should not get timeline tweets for unauthorized user', async () => {
//   const response = await request(app).get('/homepage/following').expect(401);
// });

// describe('test need new user', () => {
//   const userOneId = new mongoose.Types.ObjectId();
//   const userOne = {
//     _id: userOneId,
//     name: 'sara',
//     email: 'sara.nousir@gmail.com',
//     password: '34uruwr',
//     tokens: [
//       {
//         token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
//       },
//     ],
//   };

//   beforeEach(async () => {
//     await new User(userOne).save();
//   });
//   beforeEach(async () => {
//     await User.deleteOne(userOne);
//   });

//   //TODO: add auth middleware in the request
//   test('should return empty array of timeline tweets for user that does not have following user', async () => {
//     const response = await request(app).get('/homepage/following').expect(200);
//     expect(response.body).toHaveLength(0);
//   });
// });
