
const express = require('express');
const userRouter = express.Router();
const UserController = require('../controllers/userController');


userRouter.post('/profile', UserController.update_profile);



module.exports = userRouter; 



