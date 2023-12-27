// const request = require('supertest');
// const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const { MongoMemoryServer } = require('mongodb-memory-server');
// const { expect, describe } = require('@jest/globals');
// const User = require('../models/user_model');
// const Media = require('../models/media_model');
// const mediaController = require('../controllers/media_controller');
// const app = require('../app');
// const fs = require('fs');

// const userData = {
//   username: 'karreeem_',
//   email: 'kareemalaa555@gmail.com',
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
// let testUser;
// let media;
// let testUrl2;
// let testUrl1;
// async function createUser(userData) {
//   let user = await new User(userData);
//   return await user.save();
// }

// async function deleteUser(userData) {
//   await User.deleteOne(userData);
// }

// beforeAll(async () => {
//   try {
//     const mongoServer = await MongoMemoryServer.create();

//     await mongoose.connect(mongoServer.getUri());
//     testUser = await createUser(userData);
//     media = new Media({
//       url: 'testUrl',
//       cloudStrogePath: '59c02f6c-c589-4b1f-b566-54c59e441524-git.png',
//       type: 'image',
//     });
//     await media.save();

//     token = jwt.sign({ id: testUser._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });
//   } catch (error) {
//     console.error('Error during setup:', error);
//   }
// });

// afterAll(async () => {
//   await deleteUser(userData);
//   await mongoose.disconnect();
//   await media;
//   await mongoose.connection.close();
// });

// describe('add media test', () => {
//   it('should add media ', async () => {
//     const imagePath = `${__dirname}/unit_test_files/linus.jpg`;
//     const imageBuffer = fs.readFileSync(imagePath);

//     const response = await request(app)
//       .post('/api/media')
//       .set('authorization', `Bearer ${token}`)
//       .attach('media', imageBuffer, 'linus.jpg')
//       .attach('media', imageBuffer, 'linus.jpg');

//     testUrl1 = response.body.data.usls[1];
//     testUrl2 = response.body.data.usls[0];
//     expect(response.status).toBe(200);
//     expect(response.body.status).toBe('Files uploaded successfully');
//     expect(response.body.data.usls[0]).toBeDefined();
//   });

//   it('should return 400 as 4 media is maximum ', async () => {
//     const imagePath = `${__dirname}/unit_test_files/linus.jpg`;
//     const imageBuffer = fs.readFileSync(imagePath);

//     const response = await request(app)
//       .post('/api/media')
//       .set('authorization', `Bearer ${token}`)
//       .attach('media', imageBuffer, 'linus.jpg')
//       .attach('media', imageBuffer, 'linus.jpg')
//       .attach('media', imageBuffer, 'linus.jpg')
//       .attach('media', imageBuffer, 'linus.jpg')
//       .attach('media', imageBuffer, 'linus.jpg');

//     expect(response.status).toBe(400);
//     expect(response.body.error).toBe('Bad Request - Maximum 4 files allowed');
//   });

//   it('should return 400 as 0 media is provided', async () => {
//     const response = await request(app)
//       .post('/api/media')
//       .set('authorization', `Bearer ${token}`);

//     expect(response.status).toBe(400);
//     expect(response.body.error).toBe('Bad Request - No files provided');
//   });

//   it('should return 400 as unSupported file (file.zip)', async () => {
//     const imagePath = `${__dirname}/unit_test_files/Team_13_phase1_report.docx`;
//     const imageBuffer = fs.readFileSync(imagePath);

//     const response = await request(app)
//       .post('/api/media')
//       .set('authorization', `Bearer ${token}`)
//       .attach('media', imageBuffer, 'Team_13_phase1_report.docx');

//     expect(response.status).toBe(400);
//     expect(response.body.error).toBe('Bad Request - Unsupported file type');
//   });

//   it('should return 500 as internal server error', async () => {
//     const imagePath = `${__dirname}/unit_test_files/linus.jpg`;
//     const imageBuffer = fs.readFileSync(imagePath);

//     const response = await request(app)
//       .post('/api/media')
//       .set('authorization', `Bearer ${token}`)
//       .attach('kkk', imageBuffer, 'Team_13_phase1_report.docx');

//     expect(response.status).toBe(500);
//   });
// });

// describe('test delete media', () => {
//   it('should delete media succefully', async () => {
//     const result = await mediaController.deleteMedia(testUrl2);

//     expect(result.status).toBe('deleted succefully');
//   });

//   it('test not provide url', async () => {
//     const result = await mediaController.deleteMedia(null);

//     expect(result.error).toBe('no url provided');
//   });

//   it('test not provided url in media', async () => {
//     const result = await mediaController.deleteMedia('null');

//     expect(result.error).toBe('no media');
//   });
// });

// describe('test heckExistingUrl', () => {
//   it('should delete media succefully', async () => {
//     const result = await mediaController.checkExistingUrl([testUrl1]);

//     expect(result.length).toBe(1);
//   });

//   it('test not provided url in media', async () => {
//     const result = await mediaController.checkExistingUrl(['null']);

//     expect(result.length).toBe(0);
//   });
// });
