
const express = require('express');
const userRouter = express.Router();
const UserController = require('../controllers/userController');
const { upload } = require('../utils/firebase');


userRouter.get('/profile/:username', UserController.getProfile);

userRouter.post('/profile', UserController.updateProfile);

userRouter.post('/profile/image', upload.single('profile_image'),UserController.updateProfileImage);

userRouter.post('/profile/banner', upload.single('profile_banner'),UserController.updateProfileBanner);

userRouter.delete('/profile/image', upload.single('profile_image'),UserController.deleteProfileImage);

userRouter.delete('/profile/banner', upload.single('profile_banner'),UserController.deleteProfileBanner);

module.exports = userRouter; 



