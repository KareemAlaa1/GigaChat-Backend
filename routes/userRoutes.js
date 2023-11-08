
const express = require('express');
const userRouter = express.Router();
const UserController = require('../controllers/userController');


userRouter.get('/profile/:username', UserController.getProfile);

userRouter.post('/profile', UserController.updateProfile);


module.exports = userRouter; 



