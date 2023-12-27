// const request = require('supertest');
// const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const { MongoMemoryServer } = require('mongodb-memory-server');
// const { expect } = require('@jest/globals');
// const User = require('../models/user_model');
// const Tweet = require('../models/tweet_model');
// const app = require('../app');
// const user0 = {
//   username: 'user0',
//   email: 'user0@gmail.com',
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
//   blockingUsers: [],
//   location: 'cairo',
//   joinedAt: '12-9-2020',
//   active: true,
//   isDeleted: false,
//   tweetList: [],
//   likedTweets: [],
// };

// const user1 = {
//   username: 'user1',
//   email: 'user1@gmail.com',
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
//   blockingUsers: [],
//   tweetList: [],
//   location: 'cairo',
//   joinedAt: '12-9-2020',
//   active: true,
//   isDeleted: false,
// };

// const user2 = {
//   username: 'swe',
//   email: 'swe@gmail.com',
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
//   blockingUsers: [],
//   tweetList: [],
//   location: 'cairo',
//   joinedAt: '12-9-2020',
//   active: true,
//   isDeleted: false,
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
//   repliesList: [],
//   likersList: [],
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

// let token;
// let token2;
// let testUser0;
// let testUser1;
// let testUser2;
// let testTweetOwner;
// let testTweet;

// async function createUser(userData) {
//   let user = await new User(userData);
//   return await user.save();
// }

// async function createTweet(tweetData) {
//   let tweet = await new Tweet(tweetData);
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

//     testTweetOwner = await createUser(tweetOwner);
//     tweet.userId = testTweetOwner._id;
//     testTweet = await createTweet(tweet);
//     testUser0 = await createUser(user0);
//     testUser1 = await createUser(user1);
//     testUser2 = await createUser(user2);

//     token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });
//     token2 = jwt.sign(
//       { id: testUser2._id.toString() },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//       },
//     );
//   } catch (error) {
//     console.error('Error during setup:', error);
//   }
// });

// afterAll(async () => {
//   await deleteUser(user0);
//   await deleteUser(tweetOwner);
//   await deleteTweet(tweet);
//   await mongoose.disconnect();
//   await mongoose.connection.close();
// });

// describe('Follow Endpoint', () => {
//   it('should follow a user successfully', async () => {
//     const res = await request(app)
//       .post(`/api/user/${testUser1.username}/follow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(204);

//     // Verify that the users are now following each other
//     const updatedUser0 = await User.findById(testUser0._id);
//     const updatedUser1 = await User.findById(testUser1._id);

//     expect(updatedUser0.followingUsers[0].toString()).toContain(
//       testUser1._id.toString(),
//     );
//     expect(updatedUser1.followersUsers[0].toString()).toContain(
//       testUser0._id.toString(),
//     );
//   });

//   it('should handle case where the user is already followed', async () => {
//     // Follow the user initially
//     testUser0.followingUsers.push(testUser1._id);
//     testUser1.followersUsers.push(testUser0._id);
//     await Promise.all([testUser1.save(), testUser0.save()]);

//     const res = await request(app)
//       .post(`/api/user/${testUser1.username}/follow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe('Bad request, User already followed');
//   });

//   it('should handle case where the user tries to follow themselves', async () => {
//     const res = await request(app)
//       .post(`/api/user/${testUser0.username}/follow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe("You Can't follow your self");
//   });

//   it('should handle case where the followed user does not exist', async () => {
//     const nonExistentUsername = 'nonexistentuser';

//     const res = await request(app)
//       .post(`/api/user/${nonExistentUsername}/follow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(404);
//     expect(res.body.error).toBe('user not found');
//   });

//   it('should handle internal server error during follow', async () => {
//     jest.spyOn(User, 'findOne').mockImplementationOnce(async () => {
//       throw new Error('Simulated error during save');
//     });

//     const res = await request(app)
//       .post(`/api/user/${testUser1.username}/follow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(500);
//   });

//   it('should handle case where the user tries to follow themselves', async () => {
//     const res = await request(app)
//       .post(`/api/user/${testUser0.username}/follow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe("You Can't follow your self");
//   });

//   it('should handle case where the user tries to follow a blocked user', async () => {
//     testUser2.blockingUsers.push(testUser0._id);
//     await testUser2.save();
//     console.log(testUser2.blockingUsers);
//     const res = await request(app)
//       .post(`/api/user/${testUser0.username}/follow`)
//       .set('authorization', `Bearer ${token2}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe('Bad request, You Blocked This User');
//   });

//   it('should handle case where the user tries to follow user blocked you', async () => {
//     const res = await request(app)
//       .post(`/api/user/${testUser2.username}/follow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe('Bad request, User Blocked You');
//   });

//   it('should handle case where the followed user does not exist', async () => {
//     const nonExistentUsername = 'nonexistentuser';

//     const res = await request(app)
//       .post(`/api/user/${nonExistentUsername}/follow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(404);
//     expect(res.body.error).toBe('user not found');
//   });

//   it('should handle internal server error during follow', async () => {
//     jest.spyOn(User, 'findOne').mockImplementationOnce(async () => {
//       throw new Error('Simulated error during save');
//     });

//     const res = await request(app)
//       .post(`/api/user/${testUser1.username}/follow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(500);
//   });
// });

// describe('Unfollow Endpoint', () => {
//   it('should unfollow a user successfully', async () => {
//     const res = await request(app)
//       .post(`/api/user/${testUser1.username}/unfollow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(204);

//     // Verify that the users are not following each other
//     const updatedUser0 = await User.findById(testUser0._id);
//     const updatedUser1 = await User.findById(testUser1._id);

//     expect(updatedUser0.followingUsers).toHaveLength(0);
//     expect(updatedUser1.followersUsers).toHaveLength(0);
//   });

//   it('should handle case where the user is already unfollowed', async () => {
//     const res = await request(app)
//       .post(`/api/user/${testUser1.username}/unfollow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe('Bad request, User already unfollowed');
//   });

//   it('should handle case where the user tries to unfollow themselves', async () => {
//     const res = await request(app)
//       .post(`/api/user/${testUser0.username}/unfollow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe("You Can't unfollow your self");
//   });

//   it('should handle case where the unfollowed user does not exist', async () => {
//     const nonExistentUsername = 'nonexistentuser';

//     const res = await request(app)
//       .post(`/api/user/${nonExistentUsername}/unfollow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(404);
//     expect(res.body.error).toBe('user not found');
//   });

//   it('should handle internal server error during unfollow', async () => {
//     jest.spyOn(User, 'findOne').mockImplementationOnce(async () => {
//       throw new Error('Simulated error during save');
//     });

//     const res = await request(app)
//       .post(`/api/user/${testUser1.username}/unfollow`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(500);
//   });
// });

// describe('Like Tweet', () => {
//   it('should like a tweet successfully', async () => {
//     const response = await request(app)
//       .post(`/api/tweets/like/${testTweet._id.toString()}`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(204);

//     // Check that the tweet and user were updated correctly in the database
//     const updatedTweet = await Tweet.findById(testTweet._id);
//     const updatedUser = await User.findById(testUser0._id);

//     expect(updatedTweet.likersList[0].toString()).toBe(
//       testUser0._id.toString(),
//     );
//     expect(updatedUser.likedTweets[0].toString()).toBe(
//       testTweet._id.toString(),
//     );
//   });

//   it('should handle case where the user already liked the tweet', async () => {
//     const response = await request(app)
//       .post(`/api/tweets/like/${testTweet._id.toString()}`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(400)
//       .expect((res) => {
//         expect(res.body.error).toBe(
//           'Bad request, User already like this tweet',
//         );
//       });
//   });

//   it('should handle case where the tweet is not found', async () => {
//     const response = await request(app)
//       .post(`/api/tweets/like/654c208f3476660250272d80`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(404)
//       .expect((res) => {
//         expect(res.body.error).toBe('tweet not found');
//       });
//   });

//   it('should handle other errors gracefully', async () => {
//     // Mock the findOne method to reject with an error
//     jest.spyOn(Tweet, 'findById').mockImplementationOnce(() => {
//       throw new Error('Some error');
//     });

//     const response = await request(app)
//       .post(`/api/tweets/like/${testTweet._id.toString()}`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(500)
//       .expect((res) => {
//         expect(res.body.error).toBe('Internal Server Error');
//       });
//   });
// });

// describe('Unlike Tweet', () => {
//   it('should unlike a tweet successfully', async () => {
//     testUser0.likedTweets.push(testTweet._id);
//     testTweet.likersList.push(testUser0._id);
//     await Promise.all([testUser0.save(), testTweet.save()]);

//     // Like the tweet and check the response status code and body properties

//     const response = await request(app)
//       .post(`/api/tweets/unlike/${testTweet._id.toString()}`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(204);

//     // Check that the tweet and user were updated correctly in the database
//     const updatedTweet = await Tweet.findById(testTweet._id);
//     const updatedUser = await User.findById(testUser0._id);

//     expect(updatedTweet.likersList).toHaveLength(0);
//     expect(updatedUser.likedTweets).toHaveLength(0);
//   });

//   it('should handle case where the user already liked the tweet', async () => {
//     testUser0.likedTweets.push(testTweet._id);
//     testTweet.likersList.push(testUser0._id);
//     await Promise.all([testUser0.save(), testTweet.save()]);

//     const response = await request(app)
//       .post(`/api/tweets/like/${testTweet._id.toString()}`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(400)
//       .expect((res) => {
//         expect(res.body.error).toBe(
//           'Bad request, User already like this tweet',
//         );
//       });
//   });

//   it('should handle case where the tweet is not found', async () => {
//     const response = await request(app)
//       .post(`/api/tweets/like/654c208f3476660250272d80`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(404)
//       .expect((res) => {
//         expect(res.body.error).toBe('tweet not found');
//       });
//   });

//   it('should handle other errors gracefully', async () => {
//     // Mock the findOne method to reject with an error
//     jest.spyOn(Tweet, 'findById').mockImplementationOnce(() => {
//       throw new Error('Some error');
//     });

//     const response = await request(app)
//       .post(`/api/tweets/like/${testTweet._id.toString()}`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(500)
//       .expect((res) => {
//         expect(res.body.error).toBe('Internal Server Error');
//       });
//   });
// });

// describe('Get Followers', () => {
//   it('should get followers successfully', async () => {
//     testUser0.followersUsers.push(testUser1._id);
//     testUser1.followingUsers.push(testUser0._id);
//     await Promise.all([testUser1.save(), testUser0.save()]);

//     const response = await request(app)
//       .get(`/api/user/profile/${testUser0.username}/followers`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(200);

//     expect(response.body.status).toBe('success');
//     expect(response.body.users[0]).toEqual({
//       username: testUser1.username,
//       nickname: testUser1.nickname,
//       _id: testUser1._id.toString(),
//       bio: testUser1.bio,
//       followings_num: testUser1.followingUsers.length,
//       followers_num: testUser1.followersUsers.length - 1,
//       profile_image: testUser1.profileImage,
//       is_curr_user: false,
//       isFollowed: false,
//     });
//   });

//   it('should handle case where user is not found', async () => {
//     const response = await request(app)
//       .get(`/api/user/profile/nonExistingUser/followers`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(404);

//     expect(response.body.error).toBe('User Not Found');
//   });

//   it('should handle other errors gracefully', async () => {
//     // Mock the findOne method to reject with an error
//     jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
//       throw new Error('Some error');
//     });

//     testUser0.followersUsers.push(testUser1._id);
//     testUser1.followingUsers.push(testUser0._id);
//     await Promise.all([testUser1.save(), testUser0.save()]);

//     const response = await request(app)
//       .get(`/api/user/profile/${testUser0.username}/followers`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(500);
//   });
// });

// describe('Get Followings', () => {
//   it('should get followings successfully', async () => {
//     testUser0.followingUsers.push(testUser1._id);
//     testUser1.followersUsers.push(testUser0._id);
//     await Promise.all([testUser1.save(), testUser0.save()]);

//     const response = await request(app)
//       .get(`/api/user/profile/${testUser0.username}/followings`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(200);

//     expect(response.body.status).toBe('success');
//     expect(response.body.users[0]).toEqual({
//       username: testUser1.username,
//       nickname: testUser1.nickname,
//       _id: testUser1._id.toString(),
//       bio: testUser1.bio,
//       followings_num: testUser1.followingUsers.length,
//       followers_num: testUser1.followersUsers.length - 1,
//       profile_image: testUser1.profileImage,
//       is_curr_user: false,
//       isFollowed: true,
//     });
//   });

//   it('should handle case where user is not found', async () => {
//     const response = await request(app)
//       .get(`/api/user/profile/nonExistingUser/followings`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(404);

//     expect(response.body.error).toBe('User Not Found');
//   });

//   it('should handle other errors gracefully', async () => {
//     // Mock the findOne method to reject with an error
//     jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
//       throw new Error('Some error');
//     });

//     testUser0.followersUsers.push(testUser1._id);
//     testUser1.followingUsers.push(testUser0._id);
//     await Promise.all([testUser1.save(), testUser0.save()]);

//     const response = await request(app)
//       .get(`/api/user/profile/${testUser0.username}/followings`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(500);
//   });
// });

// describe('Mute Endpoint', () => {
//   it('should mute a user successfully', async () => {
//     const res = await request(app)
//       .patch(`/api/user/${testUser1.username}/mute`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(204);

//     const updatedUser0 = await User.findById(testUser0._id);

//     expect(updatedUser0.mutedUsers[0].toString()).toContain(
//       testUser1._id.toString(),
//     );
//   });

//   it('should handle case where the user is already muted', async () => {
//     testUser0.mutedUsers.push(testUser1._id);
//     await Promise.all([testUser0.save()]);

//     const res = await request(app)
//       .patch(`/api/user/${testUser1.username}/mute`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe('Bad request, User already muted');
//   });

//   it('should handle case where the user tries to mute themselves', async () => {
//     const res = await request(app)
//       .patch(`/api/user/${testUser0.username}/mute`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe("You Can't mute yourself");
//   });

//   it('should handle case where the muted user does not exist', async () => {
//     const nonExistentUsername = 'nonexistentuser';

//     const res = await request(app)
//       .patch(`/api/user/${nonExistentUsername}/mute`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(404);
//     expect(res.body.error).toBe('user not found');
//   });

//   it('should handle internal server error during mute', async () => {
//     jest.spyOn(User, 'findOne').mockImplementationOnce(async () => {
//       throw new Error('Simulated error during save');
//     });

//     const res = await request(app)
//       .patch(`/api/user/${testUser1.username}/mute`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(500);
//   });
// });

// describe('Unmute Endpoint', () => {
//   it('should unmute a user successfully', async () => {
//     const res = await request(app)
//       .patch(`/api/user/${testUser1.username}/unmute`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(204);

//     const updatedUser0 = await User.findById(testUser0._id);

//     expect(updatedUser0.mutedUsers).toHaveLength(0);
//   });

//   it('should handle case where the user is already unmuted', async () => {
//     const res = await request(app)
//       .patch(`/api/user/${testUser1.username}/unmute`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe('Bad request, User already not muted');
//   });

//   it('should handle case where the user tries to unmute themselves', async () => {
//     const res = await request(app)
//       .patch(`/api/user/${testUser0.username}/unmute`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe("You Can't unmute yourself");
//   });

//   it('should handle case where the unmuted user does not exist', async () => {
//     const nonExistentUsername = 'nonexistentuser';

//     const res = await request(app)
//       .patch(`/api/user/${nonExistentUsername}/unmute`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(404);
//     expect(res.body.error).toBe('user not found');
//   });

//   it('should handle internal server error during unmute', async () => {
//     jest.spyOn(User, 'findOne').mockImplementationOnce(async () => {
//       throw new Error('Simulated error during save');
//     });

//     const res = await request(app)
//       .patch(`/api/user/${testUser1.username}/unmute`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(500);
//   });
// });

// describe('Block Endpoint', () => {
//   it('should block a user successfully and if i follow the user or user follow me remove it', async () => {
//     testUser0.followingUsers.push(testUser1._id);
//     testUser0.followersUsers.push(testUser1._id);

//     testUser1.followingUsers.push(testUser0._id);
//     testUser1.followersUsers.push(testUser0._id);

//     await Promise.all([testUser1.save(), testUser0.save()]);

//     const res = await request(app)
//       .patch(`/api/user/${testUser1.username}/block`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(204);

//     const updatedUser0 = await User.findById(testUser0._id);
//     const updatedUser1 = await User.findById(testUser1._id);

//     expect(updatedUser0.followingUsers).toHaveLength(0);
//     expect(updatedUser0.followersUsers).toHaveLength(0);

//     expect(updatedUser1.followingUsers).toHaveLength(0);
//     expect(updatedUser1.followersUsers).toHaveLength(0);

//     expect(updatedUser0.blockingUsers[0].toString()).toContain(
//       testUser1._id.toString(),
//     );
//   });

//   it('should handle case where the user is already blocked', async () => {
//     testUser0.blockingUsers.push(testUser1._id);
//     await Promise.all([testUser0.save()]);

//     const res = await request(app)
//       .patch(`/api/user/${testUser1.username}/block`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe('Bad request, User already blocked');
//   });

//   it('should handle case where the user tries to block themselves', async () => {
//     const res = await request(app)
//       .patch(`/api/user/${testUser0.username}/block`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe("You Can't block yourself");
//   });

//   it('should handle case where the blocked user does not exist', async () => {
//     const nonExistentUsername = 'nonexistentuser';

//     const res = await request(app)
//       .patch(`/api/user/${nonExistentUsername}/block`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(404);
//     expect(res.body.error).toBe('user not found');
//   });

//   it('should handle internal server error during block', async () => {
//     jest.spyOn(User, 'findOne').mockImplementationOnce(async () => {
//       throw new Error('Simulated error during save');
//     });

//     const res = await request(app)
//       .patch(`/api/user/${testUser1.username}/block`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(500);
//   });
// });

// describe('Unblock Endpoint', () => {
//   it('should unblock a user successfully', async () => {
//     const res = await request(app)
//       .patch(`/api/user/${testUser1.username}/unblock`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(204);

//     const updatedUser0 = await User.findById(testUser0._id);

//     expect(updatedUser0.blockingUsers).toHaveLength(0);
//   });

//   it('should handle case where the user is already unblocked', async () => {
//     const res = await request(app)
//       .patch(`/api/user/${testUser1.username}/unblock`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe('Bad request, User already not blocked');
//   });

//   it('should handle case where the user tries to unblock themselves', async () => {
//     const res = await request(app)
//       .patch(`/api/user/${testUser0.username}/unblock`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toBe("You Can't unblock yourself");
//   });

//   it('should handle case where the unblocked user does not exist', async () => {
//     const nonExistentUsername = 'nonexistentuser';

//     const res = await request(app)
//       .patch(`/api/user/${nonExistentUsername}/unblock`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(404);
//     expect(res.body.error).toBe('user not found');
//   });

//   it('should handle internal server error during unblock', async () => {
//     jest.spyOn(User, 'findOne').mockImplementationOnce(async () => {
//       throw new Error('Simulated error during save');
//     });

//     const res = await request(app)
//       .patch(`/api/user/${testUser1.username}/unblock`)
//       .set('authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(500);
//   });
// });

// describe('Get Muted Users List', () => {
//   it('should get muted users successfully', async () => {
//     testUser0.mutedUsers.push(testUser1._id);
//     await Promise.all([testUser0.save()]);

//     const response = await request(app)
//       .get(`/api/user/mutedList`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(200);

//     expect(response.body.status).toBe('Muted Users Get Success');
//     expect(response.body.data[0]).toEqual({
//       id: response.body.data[0].id,
//       username: 'user1',
//       nickname: 'Kareem Alaa',
//       bio: 'we are dead',
//       profile_image:
//         'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
//       followers_num: 0,
//       following_num: 0,
//       isFollowed: false,
//       isBlocked: false,
//     });
//   });

//   it('should handle other errors gracefully', async () => {
//     jest.spyOn(User, 'aggregate').mockImplementationOnce(() => {
//       throw new Error('Some error');
//     });

//     testUser0.mutedUsers.push(testUser1._id);
//     await Promise.all([testUser0.save()]);

//     const response = await request(app)
//       .get(`/api/user/mutedList`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(500);
//   });
// });

// describe('Get Blocked Users List', () => {
//   it('should get blocked users successfully', async () => {
//     testUser0.blockingUsers.push(testUser1._id);
//     await Promise.all([testUser0.save()]);

//     const response = await request(app)
//       .get(`/api/user/blockList`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(200);

//     expect(response.body.status).toBe('Blocked Users Get Success');
//     expect(response.body.data[0]).toEqual({
//       id: response.body.data[0].id,
//       username: 'user1',
//       nickname: 'Kareem Alaa',
//       bio: 'we are dead',
//       profile_image:
//         'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
//       followers_num: 0,
//       following_num: 0,
//       isMuted: true,
//     });
//   });

//   it('should handle other errors gracefully', async () => {
//     jest.spyOn(User, 'aggregate').mockImplementationOnce(() => {
//       throw new Error('Some error');
//     });

//     testUser0.mutedUsers.push(testUser1._id);
//     await Promise.all([testUser0.save()]);

//     const response = await request(app)
//       .get(`/api/user/blockList`)
//       .set('Authorization', `Bearer ${token}`)
//       .expect(500);
//   });
// });
