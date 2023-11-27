const express = require('express');
const User = require('../models/user_model');
const { bucket, uuidv4 } = require('../utils/firebase');
const catchAsync = require('../utils/catch_async');

const DEFAULT_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/gigachat-img.appspot.com/o/56931877-1025-4348-a329-663dadd37bba-black.jpg?alt=media&token=fca10f39-2996-4086-90db-0cd492a570f2';


exports.checkBirthDate = async (req, res) => {
  const { birthDate } = req.body;
  if (!birthDate) {
    return res
      .status(400)
      .json({ error: 'birthDate is required in the request body' });
  }
  const userAge = calculateAge(birthDate);

  if (userAge >= 13) {
    res.json({ message: 'User is above 13 years old.' });
  } else {
    res.status(403).json({
      error: 'User must be at least 13 years old Or Wrong date Format ',
    });
  }
};

exports.checkAvailableUsername = catchAsync(async (req, res, next) => {
  const { username } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ error: 'Username is required in the request body' });
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  res.status(200).json({ message: 'Username is available' });
});

exports.checkAvailableEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ error: 'Email is required in the request body' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  res.status(200).json({ message: 'Email is available' });
});

exports.checkExistedEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ error: 'Email is required in the request body' });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(200).json({ message: 'Email is existed' });
  }

  res.status(404).json({ error: 'Email is not existed' });
});

exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).send({ error: 'Bad Request' });

    const user = await User.
      findOne({ username: username, active: true, isDeleted: false }).
      select('username nickname _id bio profileImage bannerImage location website birthDate joinedAt followingUsers followersUsers');


    if (!user) return res.status(404).send({ error: 'user not found' });

    const result = {};
    result.status = 'success';
    result.user = {
      username: user.username,
      nickname: user.nickname,
      _id: user._id.toString(),
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
};

exports.updateProfile = async (req, res) => {
  try {
    // get the sent data from the request body
    const { bio, location, website, nickname, birth_date } = req.query;

    if (!bio && !location && !website && !nickname && !birth_date) {
      return res.status(400).send({ error: 'Bad Request' });
    }

    if (bio) req.user.bio = bio;
    if (location) req.user.location = location;
    if (website) req.user.website = website;
    if (nickname) req.user.nickname = nickname;
    if (birth_date) req.user.birthDate = new Date(birth_date);

    await req.user.save();

    return res.status(204).end();
  } catch (error) {
    // Handle and log errors
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {

    if (!req.file) return res.status(400).send({ error: 'Bad Request' });

    const fileName = `${uuidv4()}-${req.file.originalname}`;
    const file = bucket.file(fileName);

    await file.createWriteStream().end(req.file.buffer);

    // Get the download URL with a token
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '12-3-9999', // Set the expiration date to infinity :D
    });

    req.user.profileImage = url;

    await req.user.save();

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
};

exports.updateProfileBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ error: 'Bad Request' });

    const fileName = `${uuidv4()}-${req.file.originalname}`;
    const file = bucket.file(fileName);

    await file.createWriteStream().end(req.file.buffer);

    // Get the download URL with a token
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '12-31-9999', // Set the expiration date to infinity :D
    });

    req.user.profileBanner = url;

    await req.user.save();

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
};

exports.deleteProfileImage = async (req, res) => {
  try {

    req.user.profileImage = DEFAULT_IMAGE_URL;

    await req.user.save();

    const result = {
      status: 'image deleted successfully',
      image_profile_url: DEFAULT_IMAGE_URL,
    };

    res.status(200).send(result);
  } catch (error) {
    // Handle and log errors
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.deleteProfileBanner = async (req, res) => {
  try {

    req.user.profileBanner = DEFAULT_IMAGE_URL;

    await req.user.save();

    const result = {
      status: 'image deleted successfully',
      image_profile_url: DEFAULT_IMAGE_URL,
    };

    res.status(200).send(result);
  } catch (error) {
    // Handle and log errors
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

const filterObj = (obj, ...filter) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    //Object.key(objName) array contian the key names of the object properties
    if (filter.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

function calculateAge(birthDate) {
  const today = new Date();
  const birthDateObj = new Date(birthDate);

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age -= 1;
  }
  return age;
}