const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/user_model');
const { catchAsync } = require('../utils/app_error');
const { signToken } = require('../controllers/auth_controller');
const dotenv = require('dotenv');
const crypto = require('crypto');
dotenv.config({ path: './config/dev.env' });

// Define a utility function to create a test user
async function createUser(userData) {
  const user = await new User(userData);
  return await user.save();
}

// Define a utility function to delete the test user
async function deleteUser(user) {
  await user.deleteOne();
}

// Set up a mock user for testing
const testUserData = {
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'testpassword',
};

let testUser;

describe('auth', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    testUser = await createUser(testUserData);
  });

  // Clean up after testing
  afterAll(async () => {
    await deleteUser(testUser);
    await mongoose.disconnect();
  });

  //###################### confirmEmail ######################
  describe('POST /api/user/confirmEmail', () => {
    it('responds with 201 and a token when email confirmation is successful', async () => {
      let newUser = {
        email: 'test@test.com',
        nickname: 'testtest',
        birthDate: '2000-01-01',
        confirmEmailCode:
          '548a2bb0611b27e503ce5cb8b2123bf341a3ae18c3e7ba98620196572a3bab48',
        confirmEmailExpires: '2024-01-01',
      };
      let newuseruser = await createUser(newUser);
      const response = await request(app).post('/api/user/confirmEmail').send({
        confirmEmailCode: '219589745',
        email: 'test@test.com',
      });
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.data.suggestedUsername).toBeDefined();
      expect(response.body.data.message).toBe('Confirm done successfully');
      await User.deleteOne({ email: 'test@test.com' });
    });

    it('responds with 400 when email or confirmEmailCode is missing', async () => {
      const response = await request(app).post('/api/user/confirmEmail').send({
        email: testUserData.email,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('email and confirmEmailCode required');
    });

    it('responds with 400 when email format is invalid', async () => {
      const response = await request(app).post('/api/user/confirmEmail').send({
        confirmEmailCode: 'valid-code',
        email: 'invalid-email',
      });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
    });

    it('responds with 404 when there is no inactive user with the provided email', async () => {
      const response = await request(app).post('/api/user/confirmEmail').send({
        confirmEmailCode: 'valid-code',
        email: 'nonexistent@example.com',
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        'There is no inactive user with  this email address.',
      );
    });
  });

  //###################### signup ######################
  describe('POST /api/signup', () => {
    it('should return 200 and success message when valid data is provided', async () => {
      const response = await request(app).post('/api/user/signup').send({
        email: 'test@example.com',
        nickname: 'testuser',
        birthDate: '1990-01-01',
      });
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.message).toBe(
        'Code sent to the email the user provide',
      );

      await User.deleteOne({ email: 'test@example.com' });
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app).post('/api/user/signup').send({
        nickname: 'testuser',
        birthDate: '1990-01-01',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email is required in the request body');
    });

    it('should return 400 when email format is invalid', async () => {
      const response = await request(app).post('/api/user/signup').send({
        email: 'invalid-email',
        nickname: 'testuser',
        birthDate: '1990-01-01',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
    });

    it('should return 409 when email already exists and is active', async () => {
      const existingUser = new User({
        email: 'existing@example.com',
        nickname: 'existinguser',
        birthDate: '1990-01-01',
        active: true,
      });
      await existingUser.save();
      const response = await request(app).post('/api/user/signup').send({
        email: 'existing@example.com',
        nickname: 'testuser',
        birthDate: '1990-01-01',
      });
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already exists');
      await User.deleteOne({ email: 'existing@example.com' });
    });

    it('should return 200 when email already exists but is inactive', async () => {
      const existingUser = new User({
        email: 'existing@example.com',
        nickname: 'existinguser',
        birthDate: '1990-01-01',
        active: false,
      });
      await existingUser.save();

      const response = await request(app).post('/api/user/signup').send({
        email: 'existing@example.com',
        nickname: 'testuser',
        birthDate: '1990-01-01',
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.email).toBe('existing@example.com');
      expect(response.body.data.message).toBe(
        'Code sent to the email the user provide',
      );

      await User.deleteOne({ email: 'existing@example.com' });
    });

    it('should return 400 when birthDate is missing', async () => {
      const response = await request(app).post('/api/user/signup').send({
        email: 'test@example.com',
        nickname: 'testuser',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'birthDate is required in the request body',
      );
    });

    it('should return 403 when user is below 13 years old', async () => {
      const response = await request(app).post('/api/user/signup').send({
        email: 'test@example.com',
        nickname: 'testuser',
        birthDate: '2021-01-01',
      });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe(
        'User must be at least 13 years old Or Wrong date Format ',
      );
    });
  });

  //###################### AssignPassword ######################
  describe('POST /api/user/AssignPassword', () => {
    let user;
    let token;

    beforeEach(async () => {
      // Create a user and generate a token for authentication
      user = new User({
        username: 'oldusername',
        email: 'test@abc.com',
      });
      await user.save();

      // Generate a token for the user
      token = signToken(user._id).toString();
    });

    afterEach(async () => {
      // Remove the user from the database
      await user.deleteOne();
    });

    it('should return 200 and success message when valid data is provided', async () => {
      const response = await request(app)
        .patch('/api/user/AssignPassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          password: 'password123',
        });
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.message).toBe(
        ' user assign password correctly ',
      );

      // Check if the password was updated and the user is active in the database
      // const updatedUser = await User.findById(user._id);
      // expect(updatedUser.password).toBe('password123');
      // expect(updatedUser.active).toBe(true);
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .patch('/api/user/AssignPassword')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(' password is required');
    });

    it('should return 401 when password length is less than 8', async () => {
      const response = await request(app)
        .patch('/api/user/AssignPassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          password: 'pass',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'the password should be 8 litters or more.',
      );
    });

    it('should return 401 when token is missing', async () => {
      const response = await request(app)
        .patch('/api/user/AssignPassword')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'You have not confirmed your email Please confirm to get access.',
      );
    });

    it('should return 500 when the token is invalid', async () => {
      const response = await request(app)
        .patch('/api/user/AssignPassword')
        .set('Authorization', 'Bearer invalidtoken')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('jwt malformed');
    });

    it('should return 401 when the user already has a password', async () => {
      user.password = 'oldpassword';
      await user.save();

      const response = await request(app)
        .patch('/api/user/AssignPassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'The user belonging to this token already have password.',
      );
    });
  });

  //###################### Check Username ######################
  describe('POST /api/user/checkAvailableUsername', () => {
    let user;
    beforeEach(async () => {
      // Create a user and generate a token for authentication
      user = new User({
        username: 'existing_user',
        email: 'test@abc.com',
        password: 'password',
      });
      await user.save();
    });

    afterEach(async () => {
      // Remove the user from the database
      await user.deleteOne();
    });

    it('should return 200 and message when username is available', async () => {
      const response = await request(app)
        .post('/api/user/checkAvailableUsername')
        .send({
          username: 'new_user',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Username is available');
    });

    it('should return 409 when username already exists', async () => {
      // Assuming you have a pre-existing user with the username 'existing_user'
      const response = await request(app)
        .post('/api/user/checkAvailableUsername')
        .send({
          username: 'existing_user',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Username already exists');
    });

    it('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/user/checkAvailableUsername')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Username is required in the request body',
      );
    });
  });
  //###################### Check Existed Email ######################
  describe('existedEmailORusername endpoint', () => {
    it('should respond with 200 and message if email exists', async () => {
      // Create a user with a specific email to simulate an existing user
      const existingUser = await User.create({
        email: 'existinguser@example.com',
        username: 'existingusername',
        active: true,
      });

      const response = await request(app)
        .post('/api/user/ExistedEmailORusername')
        .send({ email: existingUser.email });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Email is existed');

      // Clean up: Remove the created user from the database
      await User.deleteOne({ _id: existingUser._id });
    });

    it('should respond with 200 and message if username exists', async () => {
      // Create a user with a specific username to simulate an existing user
      const existingUser = await User.create({
        username: 'existingusername',
        email: 'temp@email.com',
        active: true,
      });
      const response = await request(app)
        .post('/api/user/ExistedEmailORusername')
        .send({ username: existingUser.username });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('username is existed');

      // Clean up: Remove the created user from the database
      await User.deleteOne({ _id: existingUser._id });
    });

    it('should respond with 400 if neither email nor username is provided', async () => {
      const response = await request(app)
        .post('/api/user/ExistedEmailORusername')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Email or username is required in the request body',
      );
    });

    it('should respond with 404 if email and username do not exist', async () => {
      const response = await request(app)
        .post('/api/user/ExistedEmailORusername')
        .send({
          email: 'nonexistent@example.com',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Email or username  not existed');
    });
  });

  //###################### login ######################
  describe('POST /api/user/login', () => {
    // Set up the testing environment

    it('responds with 201 and a token when login is successful', async () => {
      const response = await request(app).post('/api/user/login').send({
        email: testUserData.email,
        password: testUserData.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });

    it('responds with 400 when email format is invalid', async () => {
      const response = await request(app).post('/api/user/login').send({
        email: 'invalid-email',
        password: testUserData.password,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
    });

    it('responds with 401 when incorrect email or password is provided', async () => {
      const response = await request(app).post('/api/user/login').send({
        email: testUserData.email,
        password: 'incorrect-password',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Incorrect email or password');
    });

    it('responds with 400 when neither email nor username is provided', async () => {
      const response = await request(app).post('/api/user/login').send({
        password: testUserData.password,
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Please provide email or username and password!',
      );
    });
  });

  //###################### resendConfirmEmail ######################
  describe('POST /api/user/resendConfirmEmail', () => {
    it('responds with 200 and a success message when email confirmation code is resent successfully', async () => {
      const response = await request(app)
        .post('/api/user/resendConfirmEmail')
        .send({
          email: testUserData.email,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.email).toBe(testUserData.email);
      expect(response.body.data.message).toBe(
        'Code sent to the email the user provided',
      );
    });

    it('responds with 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/user/resendConfirmEmail')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('email is required');
    });

    it('responds with 400 when email format is invalid', async () => {
      const response = await request(app)
        .post('/api/user/resendConfirmEmail')
        .send({
          email: 'invalid-email',
        });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
    });

    it('responds with 404 when there is no inactive user with the provided email', async () => {
      const response = await request(app)
        .post('/api/user/resendConfirmEmail')
        .send({
          email: 'nonexistent@example.com',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        'There is no inactive user with  this email address.',
      );
    });

    // Add more test cases as needed to cover different scenarios
  });

  //###################### AssignUsername ######################
  describe('PATCH /api/user/AssignUsername', () => {
    let user;
    let token;

    beforeEach(async () => {
      // Create a user and generate a token for authentication
      user = new User({
        username: 'oldusername',
        email: 'test@abc.com',
        password: 'password',
      });
      await user.save();

      // Generate a token for the user
      token = signToken(user._id).toString();
    });

    afterEach(async () => {
      // Remove the user from the database
      await user.deleteOne();
    });

    it('should return 200 and success message when valid data is provided', async () => {
      const response = await request(app)
        .patch('/api/user/AssignUsername')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'newusername',
        });
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.message).toBe('username updated successfully');

      // Check if the username was updated in the database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.username).toBe('newusername');
    });

    it('should return 400 when username is missing', async () => {
      const response = await request(app)
        .patch('/api/user/AssignUsername')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(' Username is required');
    });

    it('should return 401 when token is missing', async () => {
      const response = await request(app)
        .patch('/api/user/AssignUsername')
        .send({
          username: 'newusername',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'You have not confirmed your email Please confirm to get access.',
      );
    });

    it('should return 500 when the token is invalid', async () => {
      const response = await request(app)
        .patch('/api/user/AssignUsername')
        .set('Authorization', 'Bearer invalidtoken')
        .send({
          username: 'newusername',
        });
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('jwt malformed');
    });

    it('should return 400 when the new username is already taken', async () => {
      const existingUser = new User({
        username: 'existingxusername',
        email: 'another@example.com',
      });
      await existingUser.save();

      const response = await request(app)
        .patch('/api/user/AssignUsername')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'existingxusername',
        });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('The username is already taken.');

      await User.deleteOne({ _id: existingUser._id });
    });

    it('should return 200 when the new username is the same as the old one', async () => {
      const response = await request(app)
        .patch('/api/user/AssignUsername')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'oldusername',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.message).toBe('username updated successfully');

      // Check if the username was updated in the database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.username).toBe('oldusername');
    });
  });

  //###################### Check Birthdate ######################
  describe('POST /api/user/checkBirthDate', () => {
    it('should return 200 and message when user age is above 13', async () => {
      const response = await request(app)
        .post('/api/user/checkBirthDate')
        .send({
          birthDate: '1990-01-01',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User is above 13 years old.');
    });

    it('should return 403 when user age is below 13', async () => {
      const response = await request(app)
        .post('/api/user/checkBirthDate')
        .send({
          birthDate: '2012-01-01',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe(
        'User must be at least 13 years old Or Wrong date Format ',
      );
    });

    it('should return 400 when birthDate is missing', async () => {
      const response = await request(app)
        .post('/api/user/checkBirthDate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'birthDate is required in the request body',
      );
    });
  });

  //###################### checkAvailableUsername ######################
  describe('POST /api/user/checkAvailableUsername', () => {
    let user;
    beforeEach(async () => {
      // Create a user and generate a token for authentication
      user = new User({
        username: 'existing_user',
        email: 'test@abc.com',
        password: 'password',
      });
      await user.save();
    });

    afterEach(async () => {
      // Remove the user from the database
      await user.deleteOne();
    });

    it('should return 200 and message when username is available', async () => {
      const response = await request(app)
        .post('/api/user/checkAvailableUsername')
        .send({
          username: 'new_user',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Username is available');
    });

    it('should return 409 when username already exists', async () => {
      // Assuming you have a pre-existing user with the username 'existing_user'
      const response = await request(app)
        .post('/api/user/checkAvailableUsername')
        .send({
          username: 'existing_user',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Username already exists');
    });

    it('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/user/checkAvailableUsername')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Username is required in the request body',
      );
    });
  });

  //###################### checkAvailableEmail ######################
  describe('POST /api/user/checkAvailableEmail', () => {
    let user;
    beforeEach(async () => {
      // Create a user and generate a token for authentication
      user = new User({
        username: 'test_username',
        email: 'existing_user@example.com',
        password: 'password',
        active: true,
      });
      await user.save();
    });

    afterEach(async () => {
      // Remove the user from the database
      await user.deleteOne();
    });

    it('should return 200 and message when email is available', async () => {
      const response = await request(app)
        .post('/api/user/checkAvailableEmail')
        .send({
          email: 'new_user@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Email is available');
    });

    it('should return 409 when email already exists', async () => {
      // Assuming you have a pre-existing user with the email 'existing_user@example.com'
      const response = await request(app)
        .post('/api/user/checkAvailableEmail')
        .send({
          email: 'existing_user@example.com',
        });
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already exists');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/user/checkAvailableEmail')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email is required in the request body');
    });

    it('should return 400 when email has an invalid format', async () => {
      const response = await request(app)
        .post('/api/user/checkAvailableEmail')
        .send({
          email: 'invalid_email',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
    });
  });

  //###################### confirmPassword ######################

  describe('confirmPassword endpoint', () => {
    let user;

    beforeEach(async () => {
      // Create a user with a specific password
      user = new User({
        username: 'test_username',
        email: 'testcon@example.com',
        password: 'password123',
        active: true,
      });
      await user.save();
    });

    afterEach(async () => {
      // Clean up: Remove the user from the database
      await User.deleteOne({ _id: user._id });
    });

    it('should respond with 200 and message if password is correct', async () => {
      const response = await request(app)
        .post('/api/user/confirmPassword')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ password: 'password123' });
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(200);
      expect(response.body.data.message).toBe('password is correct');
    });

    it('should respond with 401 if password is incorrect', async () => {
      const response = await request(app)
        .post('/api/user/confirmPassword')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ password: 'incorrectpassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('password is not correct');
    });
  });

  //###################### updateUsername ######################
  describe('updateUsername endpoint', () => {
    let user;

    beforeEach(async () => {
      // Create a user with a specific username
      user = new User({
        email: 'testup@example.com',
        username: 'oldusername',
        active: true,
      });
      await user.save();
    });

    afterEach(async () => {
      // Clean up: Remove the user from the database
      await User.deleteOne({ _id: user._id });
    });

    it('should respond with 200 and message if username is updated successfully', async () => {
      const response = await request(app)
        .patch('/api/user/updateUsername')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ newUsername: 'newusername' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.message).toBe('username updated successfully');
    });

    it('should respond with 400 if newUsername is not provided', async () => {
      const response = await request(app)
        .patch('/api/user/updateUsername')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('request should have newUsername');
    });

    it('should respond with 400 if newUsername is the same as the old one', async () => {
      const response = await request(app)
        .patch('/api/user/updateUsername')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ newUsername: 'oldusername' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'the newUsername should not be the same as the old one',
      );
    });

    it('should respond with 400 if newUsername is already taken', async () => {
      // Create another user with the newUsername
      await User.create({
        email: 'another@example.com',
        username: 'newusername',
      });

      const response = await request(app)
        .patch('/api/user/updateUsername')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ newUsername: 'newusername' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('The username is already taken.');
    });
  });
  //###################### updatePassword ######################
  describe('updatePassword endpoint', () => {
    let user;

    beforeEach(async () => {
      // Create a user with a specific password
      user = await new User({
        username: 'testup_username',
        email: 'testup@example.com',
        password: 'oldpassword123',
        active: true,
      });
      await user.save();
    });

    afterEach(async () => {
      // Clean up: Remove the user from the database
      await User.deleteOne({ _id: user._id });
    });

    it('should respond with 200 and message if password is updated successfully', async () => {
      const response = await request(app)
        .patch('/api/user/updatePassword')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ oldPassword: 'oldpassword123', newPassword: 'newpassword123' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.message).toBe('user update password correctly');
      expect(response.body.token).toBeDefined();
    });

    it('should respond with 400 if oldPassword or newPassword is not provided', async () => {
      const response = await request(app)
        .patch('/api/user/updatePassword')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'request should have both, oldPassword and newPassword',
      );
    });

    it('should respond with 400 if newPassword is the same as the old one', async () => {
      const response = await request(app)
        .patch('/api/user/updatePassword')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ oldPassword: 'oldpassword123', newPassword: 'oldpassword123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'the newPassword should not be the same as old one',
      );
    });

    it('should respond with 400 if newPassword is less than 8 characters', async () => {
      const response = await request(app)
        .patch('/api/user/updatePassword')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ oldPassword: 'oldpassword123', newPassword: 'pass' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'the newPassword should be at least 8 characters',
      );
    });

    it('should respond with 401 if oldPassword is incorrect', async () => {
      const response = await request(app)
        .patch('/api/user/updatePassword')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({
          oldPassword: 'incorrectpassword',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'the oldPassword provided is not correct',
      );
    });
  });

  //###################### userEmail ######################
  describe('userEmail endpoint', () => {
    let user;

    beforeEach(async () => {
      // Create a user with a specific email
      user = new User({
        email: 'testuE@example.com',
        username: 'test_username',
        active: true,
      });
      await user.save();
    });

    afterEach(async () => {
      // Clean up: Remove the user from the database
      await User.deleteOne({ _id: user._id });
    });

    it('should respond with 200 and the user email', async () => {
      const response = await request(app)
        .get('/api/user/useremail')
        .set('Authorization', `Bearer ${signToken(user._id)}`);
      console.log(response.body);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.email).toBe('testuE@example.com');
    });
  });

  //###################### updateEmail ######################
  describe('updateEmail endpoint', () => {
    let user;

    beforeEach(async () => {
      // Create a user with a specific email
      user = new User({
        email: 'testuEm@example.com',
        username: 'test__username',
        active: true,
      });
      await user.save();
    });

    afterEach(async () => {
      // Clean up: Remove the user from the database
      await User.deleteOne({ _id: user._id });
    });

    it('should respond with 200 and message if email is updated successfully', async () => {
      const response = await request(app)
        .post('/api/user/updateEmail')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ email: 'newemail@example.com' });
      console.log(response.body, 'tess');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.message).toBe(
        'Code sent to the email the user provided',
      );
    });

    it('should respond with 400 if email is not provided', async () => {
      const response = await request(app)
        .post('/api/user/updateEmail')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('email is required');
    });

    it('should respond with 400 if email is the same as the old one', async () => {
      const response = await request(app)
        .post('/api/user/updateEmail')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ email: 'testuEm@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('email is the same as the old one');
    });

    it('should respond with 400 if email format is invalid', async () => {
      const response = await request(app)
        .post('/api/user/updateEmail')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ email: 'invalidemail' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
    });

    it('should respond with 404 if there is an active user with the provided email', async () => {
      // Create another user with the same email
      await User.create({
        email: 'newemail@example.com',
        username: 'new_x_username',
        active: true,
      });

      const response = await request(app)
        .post('/api/user/updateEmail')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ email: 'newemail@example.com' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        'There is active user with  this email address.',
      );
    });
  });

  //###################### verifyEmail ######################
  describe('verifyEmail endpoint', () => {
    let user;

    beforeEach(async () => {
      // Create a user with a specific email and confirmEmailCode
      user = new User({
        email: 'testvE@example.com',
        username: 'test_username',
        confirmEmailCode: '123145',
        active: true,
      });
      await user.save();
    });

    afterEach(async () => {
      // Clean up: Remove the user from the database
      await User.deleteOne({ _id: user._id });
    });

    it('should respond with 200 and message if email is verified successfully', async () => {
      const response = await request(app)
        .post('/api/user/verifyEmail')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({
          email: 'newemailvE@example.com',
          verifyEmailCode: process.env.ADMIN_CONFIRM_PASS,
        });
      console.log(response.body, 'test1118');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.message).toBe('Verify done successfully');

      // Check if the user's email has been updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.email).toBe('newemailvE@example.com');
    });

    it('should respond with 400 if email or verifyEmailCode is not provided', async () => {
      const response = await request(app)
        .post('/api/user/verifyEmail')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('email and verifyEmailCode required');
    });

    it('should respond with 400 if email format is invalid', async () => {
      const response = await request(app)
        .post('/api/user/verifyEmail')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ email: 'invalidemail', verifyEmailCode: '123456' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
    });

    it('should respond with 404 if there is no new updateEmail request recieved.', async () => {
      // Clear the confirmEmailCode for the user
      user.confirmEmailCode = undefined;
      await user.save();

      const response = await request(app)
        .post('/api/user/verifyEmail')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({ email: 'newemail@example.com', verifyEmailCode: '123456' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        'There is no new updateEmail request recieved .',
      );
    });

    it('should respond with 401 if the verification code is invalid or expired', async () => {
      const response = await request(app)
        .post('/api/user/verifyEmail')
        .set('Authorization', `Bearer ${signToken(user._id)}`)
        .send({
          email: 'newemail@example.com',
          verifyEmailCode: 'invalidcode',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('The Code is Invalid or Expired ');
    });
  });

  //###################### forgotPassword ######################
  describe('forgotPassword endpoint', () => {
    let user;

    beforeEach(async () => {
      // Create a user with a specific email and username
      user = new User({
        email: 'testfP@example.com',
        username: 'test_username',
        active: true,
      });
      await user.save();
    });

    afterEach(async () => {
      // Clean up: Remove the user from the database
      await User.deleteOne({ _id: user._id });
    });

    it('should respond with 200 and message if resetToken is sent successfully', async () => {
      const response = await request(app)
        .post('/api/user/forgotPassword')
        .send({ query: 'testfP@example.com' });
      console.log('fp', response.body);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe(
        'resetToken sent to user email address!',
      );
    });

    it('should respond with 400 if email or username is not provided', async () => {
      const response = await request(app)
        .post('/api/user/forgotPassword')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email or username is required');
    });

    it('should respond with 404 if no user with the provided email address exists', async () => {
      const response = await request(app)
        .post('/api/user/forgotPassword')
        .send({ query: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        'There is no user with this email address',
      );
    });

    it('should respond with 404 if no user with the provided username exists', async () => {
      const response = await request(app)
        .post('/api/user/forgotPassword')
        .send({ query: 'nonexistent_username' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('There is no user with this username');
    });
  });

  //###################### resetPassword ######################

  describe('resetPassword endpoint', () => {
    let user;
    let resetToken;

    beforeEach(async () => {
      // Create a user with a password reset token
      resetToken = crypto.createHash('sha256').update('123456').digest('hex');

      user = new User({
        email: 'testrP@example.com',
        username: 'test_username',
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 3600000), // Reset token expires in 1 hour
      });
      await user.save();
    });

    afterEach(async () => {
      // Clean up: Remove the user from the database
      await User.deleteOne({ _id: user._id });
    });

    it('should respond with 200 and login the user if reset password is successful', async () => {
      const response = await request(app)
        .patch('/api/user/resetPassword')
        .send({ password: 'newpassword', passwordResetToken: '123456' });
      console.log('RP', response.body);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();

      // Check if the user's password has been updated
      const updatedUser = await User.findById(user._id).select('+password');
      const passwordMatches = await updatedUser.correctPassword(
        'newpassword',
        updatedUser.password,
      );
      expect(passwordMatches).toBe(true);
    });

    it('should respond with 400 if password or passwordResetToken is not provided', async () => {
      const response = await request(app)
        .patch('/api/user/resetPassword')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'the user should provide both, password and passwordResetToken',
      );
    });

    it('should respond with 400 if password is less than 8 characters', async () => {
      const response = await request(app)
        .patch('/api/user/resetPassword')
        .send({ password: 'short', passwordResetToken: resetToken });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'password should be at least 8 characters',
      );
    });

    it('should respond with 400 if passwordResetToken is invalid or expired', async () => {
      const response = await request(app)
        .patch('/api/user/resetPassword')
        .send({ password: 'newpassword', passwordResetToken: 'invalidtoken' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'passwordResetToken is invalid or has expired',
      );
    });
  });
});
