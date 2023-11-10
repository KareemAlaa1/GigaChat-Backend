const express = require('express');
const User = require('../models/user_model');
const { bucket, uuidv4 } = require('../utils/firebase');
const catchAsync = require('../utils/catchAsync');

const DEFAULT_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/gigachat-img.appspot.com/o/56931877-1025-4348-a329-663dadd37bba-black.jpg?alt=media&token=fca10f39-2996-4086-90db-0cd492a570f2';

const UserController = {

  updateUsernameOrEmail: catchAsync(async (req, res, next) => {
    // 1) Create Error if user Posted password data
    // i dont think it is even good idea -> i wont do it
  
    // 2) filter unwanted fields {banned fields}
    const filteredBody = filterObj(req.body, 'username', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    }); // { is the option obj} will run the validator again to check the email and new: true to return the new user data
  
    // 3) sent the responce
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  }),

  deleteUser: catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }),

  getProfile: async (req, res) => {
    try {
      const { username } = req.params.username;
      if (!username) return res.status(400).send({ error: 'Bad Request' });

      const user = await User.findOne({ username: username }).select(
        'username nickname _id bio profileImage bannerImage location website birthDate joinedAt followingUsers followersUsers',
      );

      if (!user) return res.status(404).send({ error: 'user not found' });

      const result = {};
      result.status = 'success';
      result.user = {
        username: user.username,
        nickname: user.nickname,
        _id: user._id,
        bio: user.bio,
        profile_image: user.profileImage,
        banner_image: user.bannerImage,
        location: user.location,
        website: user.website,
        birth_date: user.birthDate,
        joined_date: user.joinedAt,
        followings_num: user.followersUsers.length,
        followers_num: user.followingUsers.length,
      };

      return res.status(200).send(result);
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      // get the sent data
      const updatedProfileData = {};
      if (req.query.bio) updatedProfileData.bio = req.query.bio;
      if (req.query.location) updatedProfileData.location = req.query.location;
      if (req.query.website) updatedProfileData.website = req.query.website;
      if (req.query.nickname) updatedProfileData.nickname = req.query.nickname;
      if (req.query.birthDate) updatedProfileData.birthDate = req.query.birthDate;

      if (Object.keys(updatedProfileData).length === 0)
        return res.status(400).send('Bad Request');
      // update tha user
      const user = await User.findByIdAndUpdate(
        req.user._id,
        updatedProfileData,
        { new: true },
      );

      // check if the user doesn't exist
      if (!user) return res.status(404).send('user not Found');

      return res.status(204).end();
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  updateProfileImage: async (req, res) => {
    try {
      if (!req.file) return res.status(400).send('Bad Request');

      const fileName = `${uuidv4()}-${req.file.originalname}`;
      const file = bucket.file(fileName);

      await file.createWriteStream().end(req.file.buffer);

      // Get the download URL with a token
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '12-31-9999', // Set the expiration date to infinity :D
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileImage: url },
        { new: true },
      ).select('profileImage');

      if (!user) return res.status(404).send('user not Found');

      const result = {
        status: 'image uploaded successfully',
        image_profile_url: url,
      };
      res.status(200).send(result);
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  updateProfileBanner: async (req, res) => {
    try {
      if (!req.file) return res.status(400).send('Bad Request');

      const fileName = `${uuidv4()}-${req.file.originalname}`;
      const file = bucket.file(fileName);

      await file.createWriteStream().end(req.file.buffer);

      // Get the download URL with a token
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '12-31-9999', // Set the expiration date to infinity :D
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileBanner: url },
        { new: true },
      ).select('profileBanner');

      if (!user) return res.status(404).send('user not Found');

      const result = {
        status: 'image uploaded successfully',
        image_profile_url: url,
      };
      res.status(200).send(result);
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  deleteProfileImage: async (req, res) => {
    try {

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileImage: DEFAULT_IMAGE_URL },
        { new: true },
      ).select('profileImage');
      if (!user) return res.status(404).send('user not Found');

      const result = {
        status: 'image uploaded successfully',
        image_profile_url: DEFAULT_IMAGE_URL,
      };

      res.status(200).send(result);
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  deleteProfileBanner: async (req, res) => {
    try {

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileBanner: DEFAULT_IMAGE_URL },
        { new: true },
      ).select('profileBanner');
      if (!user) return res.status(404).send('user not Found');

      const result = {
        status: 'image uploaded successfully',
        image_profile_url: DEFAULT_IMAGE_URL,
      };

      res.status(200).send(result);
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },
};

const filterObj = (obj, ...filter) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    //Object.key(objName) array contian the key names of the object properties
    if (filter.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

module.exports = UserController;

