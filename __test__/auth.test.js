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

});