const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { expect } = require('@jest/globals');
const User = require('../models/user_model');
const authController = require('../controllers/auth_controller');
const app = require('../app');
const fs = require('fs');
const DEFAULT_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/gigachat-img.appspot.com/o/56931877-1025-4348-a329-663dadd37bba-black.jpg?alt=media&token=fca10f39-2996-4086-90db-0cd492a570f2';
const userData = {
  username: "karreeem_",
  email: "kareemalaa555@gmail.com",
  bio: "we are dead",
  birthDate: "6-4-2002",
  password: "$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS",
  bannerImage: "https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500",
  profileImage: "https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg",
  phone: "01147119716",
  nickname: "Kareem Alaa",
  website: "www.wearedead.com",
  followersUsers: [],
  followingUsers: [],
  location: "cairo",
  joinedAt: "12-9-2020",
  active: true,
  isDeleted: false,
}

let token;
let testUser;

async function createUser(userData) {
  let user = await new User(userData);
  return await user.save();
}

async function deleteUser(userData) {
  await User.deleteOne(userData);
}


beforeAll(async () => {
  try {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
    testUser = await createUser(userData);

    token = authController.signToken(testUser._id.toString());

  } catch (error) {
    console.error('Error during setup:', error);
  }
});

afterAll(async () => {

  await deleteUser(userData);
  await mongoose.disconnect();
  await mongoose.connection.close();
});

describe("GET /api/user/profile", () => {
  it("responds with 200 and user data when user exists", async () => {

    const response = await request(app).get('/api/user/profile/karreeem_');

    response.body.user.joined_date = new Date(response.body.user.joined_date);
    response.body.user.birth_date = new Date(response.body.user.birth_date);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.user).toEqual({
      username: testUser.username,
      nickname: testUser.nickname,
      _id: testUser._id.toString(),
      bio: testUser.bio,
      location: testUser.location,
      website: testUser.website,
      joined_date: testUser.joinedAt,
      birth_date: testUser.birthDate,
      followings_num: testUser.followersUsers.length,
      followers_num: testUser.followingUsers.length,
      profile_image: testUser.profileImage,
      banner_image: testUser.bannerImage
    });
  });

  it('responds with 404 when user does not exist', async () => {
    const response = await request(app).get('/api/user/profile/nonExistingUser');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('user not found');
  });

  // it('responds with 500 and error message when an internal server error occurs', async () => {

  //   jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
  //     throw new Error('Simulated error');
  //   });

  //   const response = await request(app).get('/api/user/profile/testuser');

  //   expect(response.status).toBe(500);
  //   expect(response.body.error).toBe('Internal Server Error');
  // });
});

describe("patch /api/user/profile", () => {

  const sentData = {
    nickname: "malek hossam",
    website: "www.loca.com",
    bio: "we are Batmen",
    birth_date: "3-4-2002",
    location: "giza",
  }

  it('should respond with 204 as valid data is provided', async () => {


    const response = await request(app).patch('/api/user/profile')
      .set('authorization', `Bearer ${token}`)
      .send(sentData);

    const checkChangedUser = await User.findById(testUser._id);

    expect(response.statusCode).toBe(204);
    expect(checkChangedUser.nickname).toBe("malek hossam");
    expect(checkChangedUser.website).toBe("www.loca.com",);
    expect(checkChangedUser.bio).toBe("we are Batmen");
    expect(checkChangedUser.location).toBe("giza");
    expect(checkChangedUser.birthDate).toEqual(new Date("3-4-2002"));
  });

  it('should respond with 400 as inValid data is provided', async () => {


    const response = await request(app).patch('/api/user/profile')
      .set('authorization', `Bearer ${token}`)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Bad Request');
  });

  it('should respond with 500 if an error occurs during profile update', async () => {

    jest.spyOn(User.prototype, 'save').mockImplementationOnce(async () => {
      throw new Error('Simulated error during save');
    });

    const response = await request(app).patch('/api/user/profile')
    .set('authorization', `Bearer ${token}`)
    .send(sentData);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });
});

describe("patch /api/user/profile/image", () => {
    it('should update user profile image', async () => {

      const imagePath = '/home/malek/Pictures/Screenshots/test.png';
      const imageBuffer = fs.readFileSync(imagePath);

      const response = await request(app)
        .patch('/api/user/profile/image')
        .set('authorization', `Bearer ${token}`)
        .attach('profile_image', imageBuffer, 'test.png');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('image uploaded successfully');
      expect(response.body.image_profile_url).toBeDefined();
  });

  it('should respond with 400 as inValid data is provided', async () => {

    const response = await request(app)
      .patch('/api/user/profile/image')
      .set('authorization', `Bearer ${token}`)

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Bad Request');
  });

  it('should respond with 500 if an error occurs during profile image update', async () => {

    jest.spyOn(User.prototype, 'save').mockImplementationOnce(async () => {
      throw new Error('Simulated error during save');
    });

    const imagePath = '/home/malek/Pictures/Screenshots/test.png';
    const imageBuffer = fs.readFileSync(imagePath);


    const response = await request(app).patch('/api/user/profile/image')
      .set('authorization', `Bearer ${token}`)
      .attach('profile_image', imageBuffer, 'test.png');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });
});

describe("patch /api/user/profile/banner", () => {
  it('should update user profile banner', async () => {

    const imagePath = '/home/malek/Pictures/Screenshots/test.png';
    const imageBuffer = fs.readFileSync(imagePath);

    const response = await request(app)
      .patch('/api/user/profile/banner')
      .set('authorization', `Bearer ${token}`)
      .attach('profile_banner', imageBuffer, 'test.png');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('image uploaded successfully');
    expect(response.body.image_profile_url).toBeDefined();
});

it('should respond with 400 as inValid data is provided', async () => {

  const response = await request(app)
    .patch('/api/user/profile/banner')
    .set('authorization', `Bearer ${token}`)

  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Bad Request');
});

it('should respond with 500 if an error occurs during profile banner update', async () => {

  jest.spyOn(User.prototype, 'save').mockImplementationOnce(async () => {
    throw new Error('Simulated error during save');
  });

  const imagePath = '/home/malek/Pictures/Screenshots/test.png';
  const imageBuffer = fs.readFileSync(imagePath);


  const response = await request(app).patch('/api/user/profile/banner')
    .set('authorization', `Bearer ${token}`)
    .attach('profile_banner', imageBuffer, 'test.png');

  expect(response.status).toBe(500);
  expect(response.body.error).toBe('Internal Server Error');
});
});

describe("DELETE /api/user/profile/image", () => {

  let consoleErrorSpy;

  beforeAll(() => {
    // Spy on console.error before running any test in this describe block
    consoleErrorSpy = jest.spyOn(console, 'error');
  });

  afterAll(() => {
    // Restore the original console.error implementation after all tests
    consoleErrorSpy.mockRestore();
  });

  it('should return a success message with the default image URL', async () => {
    const response = await request(app)
      .delete('/api/user/profile/image')
      .set('authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'image deleted successfully',
      image_profile_url: DEFAULT_IMAGE_URL,  // Replace with the expected default image URL
    });
  });

  it('should handle errors and return a 500 status with an error message', async () => {

    jest.spyOn(User.prototype, 'save').mockImplementationOnce(async () => {
      throw new Error('Simulated error during save');
    });
    
    const response = await request(app)
      .delete('/api/user/profile/image')
      .set('authorization', `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Internal Server Error',
    });

    // Restore the original console.error implementation
    console.error.mockRestore();
  });
});

describe("DELETE /api/user/profile/banner", () => {

  let consoleErrorSpy;

  beforeAll(() => {
    // Spy on console.error before running any test in this describe block
    consoleErrorSpy = jest.spyOn(console, 'error');
  });

  afterAll(() => {
    // Restore the original console.error implementation after all tests
    consoleErrorSpy.mockRestore();
  });

  it('should return a success message with the default image URL', async () => {
    const response = await request(app)
      .delete('/api/user/profile/banner')
      .set('authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'image deleted successfully',
      image_profile_url: DEFAULT_IMAGE_URL,  // Replace with the expected default image URL
    });
  });

  it('should handle errors and return a 500 status with an error message', async () => {

    jest.spyOn(User.prototype, 'save').mockImplementationOnce(async () => {
      throw new Error('Simulated error during save');
    });
    
    const response = await request(app)
      .delete('/api/user/profile/banner')
      .set('authorization', `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Internal Server Error',
    });

    // Restore the original console.error implementation
    console.error.mockRestore();
  });
});