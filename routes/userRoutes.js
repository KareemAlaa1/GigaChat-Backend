const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const express = require('express');
const userRouter = express.Router();
const UserController = require('../controllers/userController');
const { upload } = require('../utils/firebase');



userRouter.all('/signup', authController.signUp);

userRouter.post('/login', authController.login);

userRouter.patch('/updateMe', authController.protect, userController.updateUsernameOrEmail);

userRouter.delete('/deleteMe', authController.protect, userController.deleteUser);

userRouter.get('/profile/:username', UserController.getProfile);

userRouter.post('/profile', UserController.updateProfile);

userRouter.post('/profile/image', upload.single('profile_image'),UserController.updateProfileImage);

userRouter.post('/profile/banner', upload.single('profile_banner'),UserController.updateProfileBanner);

userRouter.delete('/profile/image', UserController.deleteProfileImage);

userRouter.delete('/profile/banner', UserController.deleteProfileBanner);

module.exports = userRouter; 


const router = express.Router();


