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

        // Add more test cases as needed to cover different scenarios
    });
});