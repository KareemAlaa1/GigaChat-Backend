const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/user_model');
const { catchAsync } = require('../utils/app_error');
const { signToken } = require('../controllers/auth_controller');

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
      console.log(newuseruser, 'sadasdasd');
      const response = await request(app).post('/api/user/confirmEmail').send({
        confirmEmailCode: '219589745',
        email: 'test@test.com',
      });
      console.log(response.body);
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
      console.log(response.body);
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

  describe('POST /api/signup', () => {
    it('should return 200 and success message when valid data is provided', async () => {
      const response = await request(app).post('/api/user/signup').send({
        email: 'test@example.com',
        nickname: 'testuser',
        birthDate: '1990-01-01',
      });
      console.log(response.body);
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
      try {
        await existingUser.save();
      } catch (e) {
        console.log(e, 'shetse');
      }
      console.log('hi');
      const response = await request(app).post('/api/user/signup').send({
        email: 'existing@example.com',
        nickname: 'testuser',
        birthDate: '1990-01-01',
      });
      console.log(response.body);
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
      console.log(user);
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

  describe('ExistedEmailORusername endpoint', () => {
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
      await existingUser.deleteOne();
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
          username: 'nonexistentuser',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Email or username  not existed');
    });
  });

  describe('POST /api/user/login', () => {
    // Set up the testing environment

    it('responds with 201 and a token when login is successful', async () => {
      const response = await request(app).post('/api/user/login').send({
        email: testUserData.email,
        password: testUserData.password,
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.data.userId).toBe(testUser._id.toString());
      expect(response.body.data.username).toBe(testUser.username);
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
});
