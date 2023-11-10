
const express = require('express');
const userRouter = express.Router();
const UserController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { upload } = require('../utils/firebase');

//  Micro endPoints router
userRouter.post('/checkBirthDate', UserController.checkBirthDate); // stage 1

userRouter.post('/checkAvailableUsername', UserController.checkAvailableUsername);

userRouter.post('/checkAvailableEmail', UserController.checkAvailableEmail); // stage 1

userRouter.post('/checkExistedEmail', UserController.checkExistedEmail);

userRouter.post('/signup', authController.signUp); // stage 1

userRouter.post('/confirmEmail', authController.confirmEmail);

userRouter.post('/resendConfirmEmail', authController.resendConfirmEmail);

userRouter.patch('/AssignUsername', authController.AssignUsername);

userRouter.patch('/AssignPassword', authController.AssignPassword);

userRouter.post('/login', authController.login);

userRouter.get('/profile/:username', UserController.getProfile);

userRouter.post('/profile', UserController.updateProfile);

userRouter.post('/profile/image', [authController.protect, upload.single('profile_image')], UserController.updateProfileImage);

userRouter.post('/profile/banner', [authController.protect, upload.single('profile_banner')],UserController.updateProfileBanner);

userRouter.delete('/profile/image', authController.protect,UserController.deleteProfileImage);

userRouter.delete('/profile/banner', authController.protect, UserController.deleteProfileBanner);

module.exports = userRouter; 


