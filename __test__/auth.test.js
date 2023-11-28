const request = require('supertest');
const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/user_model');
const {catchAsync} = require('../utils/app_error');
const {signToken} = require('../controllers/auth_controller');

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
                email:"test@test.com",
                nickname:"testtest",
                birthDate:"2000-01-01",
                confirmEmailCode:"548a2bb0611b27e503ce5cb8b2123bf341a3ae18c3e7ba98620196572a3bab48",
                confirmEmailExpires: "2024-01-01"
            }
            let newuseruser = await createUser(newUser);
            console.log(newuseruser,'sadasdasd')
            const response = await request(app)
                .post('/api/user/confirmEmail')
                .send({
                    confirmEmailCode: '219589745',
                    email: "test@test.com",
                });
            console.log( response.body);
            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.token).toBeDefined();
            expect(response.body.data.suggestedUsername).toBeDefined();
            expect(response.body.data.message).toBe('Confirm done successfully');
            await User.deleteOne({email:"test@test.com"})

        });

        it('responds with 400 when email or confirmEmailCode is missing', async () => {
            const response = await request(app)
                .post('/api/user/confirmEmail')
                .send({
                    email: testUserData.email,
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('email and confirmEmailCode required');
        });

        it('responds with 400 when email format is invalid', async () => {
            const response = await request(app)
                .post('/api/user/confirmEmail')
                .send({
                    confirmEmailCode: 'valid-code',
                    email: 'invalid-email',
                });
            console.log(response.body);
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid email format');
        });

        it('responds with 404 when there is no inactive user with the provided email', async () => {
            const response = await request(app)
                .post('/api/user/confirmEmail')
                .send({
                    confirmEmailCode: 'valid-code',
                    email: 'nonexistent@example.com',
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe(
                'There is no inactive user with  this email address.'
            );
        });


        describe('POST /api/signup', () => {
            it('should return 200 and success message when valid data is provided', async () => {
                const response = await request(app)
                    .post('/api/user/signup')
                    .send({
                        email: 'test@example.com',
                        nickname: 'testuser',
                        birthDate: '1990-01-01',
                    });
                console.log(response.body);
                expect(response.status).toBe(200);
                expect(response.body.status).toBe('success');
                expect(response.body.data.email).toBe('test@example.com');
                expect(response.body.data.message).toBe('Code sent to the email the user provide');

                await User.deleteOne({email:"test@example.com"});
            });

            it('should return 400 when email is missing', async () => {
                const response = await request(app)
                    .post('/api/user/signup')
                    .send({
                        nickname: 'testuser',
                        birthDate: '1990-01-01',
                    });

                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Email is required in the request body');
            });

            it('should return 400 when email format is invalid', async () => {
                const response = await request(app)
                    .post('/api/user/signup')
                    .send({
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
                }
                catch (e)
                {
                    console.log(e,'shetse');
                }
                console.log('hi');
                const response = await request(app)
                    .post('/api/user/signup')
                    .send({
                        email: 'existing@example.com',
                        nickname: 'testuser',
                        birthDate: '1990-01-01',
                    });
                console.log(response.body);
                expect(response.status).toBe(409);
                expect(response.body.error).toBe('Email already exists');
                await  User.deleteOne({ email: 'existing@example.com' });
            });

            it('should return 200 when email already exists but is inactive', async () => {
                const existingUser = new User({
                    email: 'existing@example.com',
                    nickname: 'existinguser',
                    birthDate: '1990-01-01',
                    active: false,
                });
                await existingUser.save();

                const response = await request(app)
                    .post('/api/user/signup')
                    .send({
                        email: 'existing@example.com',
                        nickname: 'testuser',
                        birthDate: '1990-01-01',
                    });

                expect(response.status).toBe(200);
                expect(response.body.status).toBe('success');
                expect(response.body.data.email).toBe('existing@example.com');
                expect(response.body.data.message).toBe('Code sent to the email the user provide');

                await User.deleteOne({ email: 'existing@example.com' });
            });

            it('should return 400 when birthDate is missing', async () => {
                const response = await request(app)
                    .post('/api/user/signup')
                    .send({
                        email: 'test@example.com',
                        nickname: 'testuser',
                    });

                expect(response.status).toBe(400);
                expect(response.body.error).toBe('birthDate is required in the request body');
            });

            it('should return 403 when user is below 13 years old', async () => {
                const response = await request(app)
                    .post('/api/user/signup')
                    .send({
                        email: 'test@example.com',
                        nickname: 'testuser',
                        birthDate: '2021-01-01',
                    });

                expect(response.status).toBe(403);
                expect(response.body.error).toBe('User must be at least 13 years old Or Wrong date Format ');
            });
        });


        // Add more test cases as needed to cover different scenarios
    });
});