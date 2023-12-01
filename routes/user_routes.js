
const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/user_controller');
const authController = require('../controllers/auth_controller');
const { upload } = require('../utils/firebase');

//  Micro endPoints router
userRouter.post('/checkBirthDate', userController.checkBirthDate); // stage 1

userRouter.post('/checkAvailableUsername', userController.checkAvailableUsername);

userRouter.post('/checkAvailableEmail', userController.checkAvailableEmail); // stage 1

userRouter.post('/checkExistedEmail', userController.checkExistedEmail);

userRouter.post('/signup', authController.signUp); // stage 1

userRouter.post('/confirmEmail', authController.confirmEmail);

userRouter.post('/resendConfirmEmail', authController.resendConfirmEmail);

userRouter.patch('/AssignUsername', authController.AssignUsername);

userRouter.patch('/AssignPassword', authController.AssignPassword);

userRouter.post('/login', authController.login);

userRouter.get('/profile/:username', authController.protect ,userController.getProfile);

userRouter.patch('/profile', authController.protect, userController.updateProfile);

userRouter.patch('/profile/image', [authController.protect, upload.single('profile_image')], userController.updateProfileImage);

userRouter.patch('/profile/banner', [authController.protect, upload.single('profile_banner')],userController.updateProfileBanner);

userRouter.delete('/profile/image', authController.protect,userController.deleteProfileImage);

userRouter.delete('/profile/banner', authController.protect, userController.deleteProfileBanner);

module.exports = userRouter; 


