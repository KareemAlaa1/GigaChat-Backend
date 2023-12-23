const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uniqueSlug = require('unique-slug');
const { promisify } = require('util'); //util.promisify
const AppError = require('../utils/app_error');
const User = require('../models/user_model');
const userController = require('../controllers/user_controller');
const catchAsync = require('../utils/catch_async');
const sendEmail = require('../utils/email');
const validator = require('validator');

const dotenv = require('dotenv');
const { querystring } = require('@firebase/util');
dotenv.config({ path: './config/dev.env' });

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const defaultImage =
  'https://cdn.discordapp.com/attachments/972107703973457930/1184983163399852032/image.png?ex=658df492&is=657b7f92&hm=d17faa50f2cfb592762e714603e9ba875676855e2be97902ad752306dbc24a42&';

const generateUserName = async (nickname) => {
  // Generate a unique username based o/api/user/resendConfirmEmailn the nickname
  const baseUsername = nickname.toLowerCase();
  const generatedUsername = uniqueSlug(baseUsername);

  // Check the uniqueness of the generated username
  const isUsernameTaken = await User.exists({ username: generatedUsername });
  // if some shit happen
  const finalUsername = isUsernameTaken
    ? `${generatedUsername}-${Math.floor(Math.random() * 1000)}`
    : generatedUsername;

  return finalUsername;
};

exports.checkToken = async (token) => {
  try {
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // this function {jwt.verify(token,secret,callback fun)} takes 3 argument -> the callback once the verification happen but here we promisifying it and await it
    // docoded -> is the docoded payload from jwta
    //console.log(decode);//take alook at the shape of it

    // 3) Check if user still exists
    // if the user deleted or active we no more need to send data
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || !currentUser.active || currentUser.isDeleted) {
      return false;
    }

    // 4) Check if user changed password after the token was issued
    // users usually change their passwork if somone steal his token
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      //decoded.iat -> issued at
      return false;
    }
    return currentUser._id;
  } catch (error) {
    return false;
  }
};

exports.signUp = catchAsync(async (req, res, next) => {
  // 1) Check data recieved
  const { email, nickname, birthDate } = req.body;

  // 1.1) check email
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

  if (existingUser && existingUser.active) {
    return res.status(409).json({ error: 'Email already exists' });
  } else if (existingUser && !existingUser.active) {
    // if the user is not active we will delete the user to avoid duplicate in db
    await User.deleteOne({ email });
  }

  // 1.2) check birthDate
  if (!birthDate) {
    return res
      .status(400)
      .json({ error: 'birthDate is required in the request body' });
  }
  const userAge = userController.calculateAge(birthDate);
  if (userAge < 13) {
    res.status(403).json({
      error: 'User must be at least 13 years old Or Wrong date Format ',
    });
  }

  // 1.3) check nickName
  if (!nickname) {
    return res
      .status(400)
      .json({ error: 'nickName is required in the request body' });
  }
  const generatedUsername = await generateUserName(req.body.nickname);
  const newUser = await User.create({
    email: req.body.email,
    username: generatedUsername,
    nickname: req.body.nickname,
    birthDate: req.body.birthDate,
    joinedAt: Date.now(),
    profileImage: defaultImage,
  });
  // 2) Generate random code
  const confirmCode = newUser.createConfirmCode();
  await newUser.save({ validateBeforeSave: false });

  const message = `Your confirm Code is ${confirmCode}`;
  // 3) Sending email
  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your Confirm Code (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      data: {
        email: req.body.email,
        message: 'Code sent to the email the user provide',
      },
    });
  } catch (err) {
    newUser.confirmEmailCode = undefined;
    newUser.confirmEmailExpires = undefined;
    await newUser.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    );
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { query, password, push_token } = req.body;

  // 1) Check if email and password exist
  if (!password || !query) {
    return next(
      new AppError('Please provide email or username and password!', 400),
    );
  }

  // 2) Check if user exists && password is correct
  let user;
  if (validator.isEmail(query)) {
    // Check email format
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(email)) {
    //   return res.status(400).json({ error: 'Invalid email format' });
    // }

    user = await User.findOne({ email: query }).select('+password');
  } else {
    user = await User.findOne({ username: query }).select('+password');
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  const token = signToken(user._id);
  user.set('push_token', push_token);
  await user.save();
  res.status(200).json({
    token,
    status: 'success',
    data: {
      user: {
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        push_token: user.push_token,
        _id: user._id.toString(),
        bio: user.bio,
        profileImage: user.profileImage,
        bannerImage: user.bannerImage,
        location: user.location,
        website: user.website,
        birthDate: user.birthDate,
        joinedAt: user.joinedAt,
        followings_num: user.followingUsers.length,
        followers_num: user.followersUsers.length,
        numOfPosts: user.tweetList.length,
        numOfLikes: user.likedTweets.length,
      },
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  // in postman in headers we set key to Authorization and value to "Barer tokenValue"
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // after splite take the second element
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // this function {jwt.verify(token,secret,callback fun)} takes 3 argument -> the callback once the verification happen but here we promisifying it and await it
  // docoded -> is the docoded payload from jwta
  //console.log(decode);//take alook at the shape of it

  // 3) Check if user still exists
  // if the user deleted or active we no more need to send data
  const currentUser = await User.findById(decoded.id);
  if (!currentUser || !currentUser.active || currentUser.isDeleted) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  // 4) Check if user changed password after the token was issued
  // users usually change their passwork if somone steal his token
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    //decoded.iat -> issued at
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser; // will be usefull later
  next();
});

exports.confirmEmail = catchAsync(async (req, res, next) => {
  const { confirmEmailCode, email } = req.body;
  if (!email || !confirmEmailCode) {
    return next(new AppError('email and confirmEmailCode required', 400));
  }
  //const user = await User.findOne({ email,_bypassMiddleware:true }); //NOT WORKING YET to prevent the inacitve filter

  // Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const user = await User.findOne({ email });
  if (!user || user.active) {
    return next(
      new AppError('There is no inactive user with  this email address.', 404),
    );
  }

  if (!user.confirmEmailCode) {
    return next(
      new AppError('There is no new confirmEmail request recieved .', 404),
    );
  }
  if (confirmEmailCode !== process.env.ADMIN_CONFIRM_PASS) {
    const waitConfirm = await user.correctConfirmCode(
      confirmEmailCode,
      user.confirmEmailCode,
    );
    if (!waitConfirm) {
      return next(new AppError('The Code is Invalid or Expired ', 401));
    }
  }

  user.confirmEmailExpires = undefined;
  user.confirmEmailCode = undefined;
  // const generatedUsername = await generateUserName(user.nickname);
  // user.username = generatedUsername;
  await user.save();
  const token = signToken(user._id);
  res.status(201).json({
    token,
    status: 'success',
    data: {
      suggestedUsername: user.username,
      message: 'Confirm done successfully',
    },
  });
});

exports.resendConfirmEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('email is required', 400));
  }
  // Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  const user = await User.findOne({ email });
  if (!user || !user.active) {
    return next(
      new AppError('There is no inactive user with  this email address.', 404),
    );
  }

  const confirmCode = user.createConfirmCode();
  await user.save({ validateBeforeSave: false });

  const message = `Your confirm Code is ${confirmCode}`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your Confirm Code (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      data: {
        email: req.body.email,
        message: 'Code sent to the email the user provided',
      },
    });
  } catch (err) {
    user.confirmEmailCode = undefined;
    user.confirmEmailExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    );
  }
});

exports.AssignUsername = catchAsync(async (req, res, next) => {
  const { username } = req.body;
  if (!username) {
    return next(new AppError(' Username is required', 400));
  }
  //15 max characters
  if (username.length > 15) {
    return next(new AppError('Username must not exceed 15 characters', 400));
  }
  // Verification token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // after splite take the second element
  }

  if (!token) {
    return next(
      new AppError(
        'You have not confirmed your email Please confirm to get access.',
        401,
      ),
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }
  // Check if the user name is the same as the old one
  if (username !== currentUser.username) {
    // Check if the new username is unique
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return next(new AppError('The username is already taken.', 400));
    }
  }

  // Assign UserName
  currentUser.username = username;
  await currentUser.save();

  res.status(200).json({
    status: 'success',
    data: {
      message: 'username updated successfully',
    },
  });
});

exports.AssignPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  if (!password) {
    return next(new AppError(' password is required', 400));
  }
  // Check the password size
  if (password.length < 8) {
    return next(new AppError('the password should be 8 litters or more.', 401));
  }
  // Verification token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // after splite take the second element
  }

  if (!token) {
    return next(
      new AppError(
        'You have not confirmed your email Please confirm to get access.',
        401,
      ),
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id).select('+password');
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  if (currentUser.password) {
    return next(
      new AppError(
        'The user belonging to this token already have password.',
        401,
      ),
    );
  }

  // Assign password
  currentUser.password = password;

  // Activate the User
  await currentUser.save();
  currentUser.active = true;
  await currentUser.save();

  res.status(200).json({
    status: 'success',
    data: {
      message: ' user assign password correctly ',
    },
  });
});
exports.updateUsername = catchAsync(async (req, res, next) => {
  // 1) check data validity
  const { newUsername } = req.body;
  if (!newUsername) {
    return next(new AppError('request should have newUsername', 400));
  }
  //max 15 characters
  if (newUsername.length > 15) {
    return next(
      new AppError('newUsername must not exceed 15 characters', 400),
    );
  }
  // 2) different from the oldUsername
  if (req.user.username === newUsername) {
    return next(
      new AppError(
        'the newUsername should not be the same as the old one',
        400,
      ),
    ); // CHECK THE STATUS CODE
  }

  // 3) check available username
  const existingUser = await User.findOne({ username: newUsername });
  if (existingUser) {
    return next(new AppError('The username is already taken.', 400));
  }

  // 4) update Username and save it
  await User.findOneAndUpdate({ _id: req.user.id }, { username: newUsername });

  res.status(200).json({
    status: 'success',
    data: {
      message: 'username updated successfully',
    },
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) check data validity
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return next(
      new AppError(
        'request should have both, oldPassword and newPassword',
        400,
      ),
    );
  }

  // 2) different from the oldPassword
  if (oldPassword === newPassword) {
    return next(
      new AppError('the newPassword should not be the same as old one', 400),
    ); // CHECK THE STATUS CODE
  }

  // 3) check if password larger than 7 char.
  if (newPassword.length < 8) {
    return next(
      new AppError('the newPassword should be at least 8 characters', 400),
    ); // CHECK THE STATUS CODE
  }
  // 3) check the old password is correct
  const currentUser = await User.findById(req.user.id).select('+password');

  if (!(await currentUser.correctPassword(oldPassword, currentUser.password))) {
    return next(new AppError('the oldPassword provided is not correct', 401));
  }

  // 4) update password and save it
  currentUser.password = newPassword;
  await currentUser.save(); // presave hook will encrypt the password and assign passwordChangedAt too

  // 5) create and send new token
  const token = signToken(currentUser._id);
  res.status(200).json({
    token,
    status: 'success',
    data: {
      message: 'user update password correctly',
    },
  });
});

exports.userEmail = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      email: req.user.email,
    },
  });
});

exports.updateEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const currentUser = req.user;

  // 1) check data validity
  if (!email) {
    return next(new AppError('email is required', 400));
  }
  if (email === currentUser.email) {
    return next(new AppError('email is the same as the old one', 400));
  }
  // Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  // available email
  const user = await User.findOne({ email });
  if (user && user.active) {
    return next(
      new AppError('There is active user with  this email address.', 404),
    );
  }

  // 2) create verify code  && message
  const confirmCode = req.user.createConfirmCode();
  await currentUser.save({ validateBeforeSave: false });

  const message = `Your verify Code is ${confirmCode}`;

  // 3) sending the message
  try {
    await sendEmail({
      email: email,
      subject: 'Your verify Code (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Code sent to the email the user provided',
      },
    });
  } catch (err) {
    currentUser.confirmEmailCode = undefined;
    currentUser.confirmEmailExpires = undefined;
    await currentUser.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    );
  }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { verifyEmailCode, email } = req.body;
  const currentUser = req.user;

  if (!email || !verifyEmailCode) {
    return next(new AppError('email and verifyEmailCode required', 400));
  }

  // Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!currentUser.confirmEmailCode) {
    return next(
      new AppError('There is no new updateEmail request recieved .', 404),
    );
  }

  if (verifyEmailCode !== process.env.ADMIN_CONFIRM_PASS) {
    const waitConfirm = await currentUser.correctConfirmCode(
      verifyEmailCode,
      currentUser.confirmEmailCode,
    );
    if (!waitConfirm) {
      return next(new AppError('The Code is Invalid or Expired ', 401));
    }
  }

  currentUser.confirmEmailExpires = undefined;
  currentUser.confirmEmailCode = undefined;
  currentUser.email = email;

  await req.user.save();

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Verify done successfully',
    },
  });
});

exports.googleAuth = catchAsync(async (req, res, next) => {
  const { access_token, id, email, name, birthDate, profileImage, push_token } =
    req.body;
  if (!access_token) {
    return next(new AppError('access_token is required', 400));
  }
  if (!id) {
    return next(new AppError('id is required', 400));
  }
  if (!email) {
    return next(new AppError('email is required', 400));
  }
  if (!name) {
    return next(new AppError('name is required', 400));
  }

  const googleUser = await fetch(
    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${access_token}`,
  );
  if (!googleUser) {
    return next(new AppError('Cannot get Google User from access_token', 400));
  }
  const googleUserJson = await googleUser.json();
  const user_id = googleUserJson.user_id;
  if (user_id != id) {
    return next(new AppError('Google User id not match', 400));
  }
  const user = await User.findOne({ email: email });
  if (user) {
    const token = signToken(user._id);
    user.profileImage = profileImage || user.profileImage;
    user.set('push_token', push_token);
    await user.save();
    return res.status(201).json({
      token,
      status: 'Google Sign In Success',
      data: {
        user: {
          username: user.username,
          email: user.email,
          nickname: user.nickname,
          push_token: user.push_token,
          _id: user._id.toString(),
          googleId: user.googleId,
          bio: user.bio,
          profileImage: user.profileImage,
          bannerImage: user.bannerImage,
          location: user.location,
          website: user.website,
          birthDate: user.birthDate,
          joinedAt: user.joinedAt,
          followings_num: user.followingUsers.length,
          followers_num: user.followersUsers.length,
        },
      },
    });
  } else {
    if (birthDate) {
      const userAge = userController.calculateAge(birthDate);
      if (userAge < 13) {
        return res.status(403).json({
          error: 'User must be at least 13 years old Or Wrong date Format ',
        });
      }
    }
    const newUser = new User({
      nickname: name,
      email: email,
      active: true,
      profileImage: profileImage || defaultImage,
      birthDate: birthDate,
      joinedAt: Date.now(),
    });
    const generatedUsername = await generateUserName(name);
    newUser.username = generatedUsername;

    newUser.set('googleId', user_id);
    newUser.set('push_token', push_token);
    await newUser.save();
    const token = signToken(newUser._id);
    return res.status(201).json({
      token,
      status: 'Google Sign Up Success',
      data: {
        user: {
          username: newUser.username,
          email: newUser.email,
          nickname: newUser.nickname,
          push_token: newUser.push_token,
          _id: newUser._id.toString(),
          birthDate: newUser.birthDate,
          googleId: user_id,
          bio: newUser.bio,
          profileImage: newUser.profileImage,
          bannerImage: newUser.bannerImage,
          location: newUser.location,
          website: newUser.website,
          joinedAt: newUser.joinedAt,
          followings_num: 0,
          followers_num: 0,
        },
      },
    });
  }
});

exports.confirmPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  let user = await User.findById(req.user._id).select('+password');
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('password is not correct', 401));
  } else {
    return res.status(200).json({
      status: 200,
      data: {
        message: 'password is correct',
      },
    });
  }
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get the input data and check the validity
  let { query } = req.body;
  if (!query) {
    return next(new AppError('Email or username is required', 400));
  }
  //check if email or username

  let email;
  let username;
  if (validator.isEmail(query)) {
    email = query;
  } else {
    username = query;
  }
  let user;
  if (email) {
    user = await User.findOne({ email });
    if (!user) {
      return next(
        new AppError('There is no user with this email address', 404),
      );
    }
  } else {
    user = await User.findOne({ username });
    if (!user) {
      return next(new AppError('There is no user with this username', 404));
    }
  }

  // 2) generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) email to the user with the new resetToken

  // 3.1) generate email message
  const message = `Reset your password?
  If you requested a password reset for @${user.username}, use the confirmation code below to complete the process. If you didn't make this request, ignore this email.
  ${resetToken}`;

  // 3.2) sending the email
  try {
    // we use try catch to resend the email infail and not send the error to our golobal handler function
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'resetToken sent to user email address!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    );
  }
});


exports.checkPasswordResetToken = catchAsync(async (req, res, next) => {
  const { passwordResetToken } = req.body;
  if(!passwordResetToken){
    return next(new AppError('passwordResetToken is required', 400));
  }
  const hashedToken = crypto
    .createHash('sha256')
    .update(passwordResetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, //to check if the token expires or not
  });

  if (!user) {
    return next(
      new AppError('passwordResetToken is invalid or has expired', 400),
    );
  }
  else{
    return res.status(200).json({
      status: 'success',
      message: 'passwordResetToken is valid',
    });
  }

})
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) check input data valididty
  const { password, passwordResetToken } = req.body;

  if (!password || !passwordResetToken) {
    return next(
      new AppError(
        'the user should provide both, password and passwordResetToken',
        400,
      ),
    );
  }
  if (password.length < 8) {
    return next(new AppError('password should be at least 8 characters', 400));
  }

  // 2) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(passwordResetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, //to check if the token expires or not
  });

  if (!user) {
    return next(
      new AppError('passwordResetToken is invalid or has expired', 400),
    );
  }

  // 3) update user password and
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save(); // this will too trigger the pre save hook and update passwordChangedAt property

  // 4) login the user and send nessesary profile data
  const token = signToken(user._id);

  res.status(200).json({
    token,
    status: 'success',
    data: {
      user: {
        username: user.username,
        nickname: user.nickname,
        _id: user._id.toString(),
        bio: user.bio,
        profileImage: user.profileImage,
        bannerImage: user.bannerImage,
        location: user.location,
        website: user.website,
        birthDate: user.birthDate,
        joinedAt: user.joinedAt,
        followings_num: user.followingUsers.length,
        followers_num: user.followersUsers.length,
      },
    },
  });
});

exports.signToken = signToken;
