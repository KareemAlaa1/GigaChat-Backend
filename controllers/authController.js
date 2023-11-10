const jwt = require('jsonwebtoken');
const uniqueSlug = require('unique-slug');
const { promisify } = require('util'); //util.promisify
const AppError = require('../utils/appError');
const User = require('../models/user_model');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const generateUserName = async (nickname) => {
  // Generate a unique username based on the nickname
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

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    nickname: req.body.nickname,
    birthDate: req.body.birthDate,
    joinedAt: Date.now(),
  });
  // 2) Generate random code
  const confirmCode = newUser.createConfirmCode();
  await newUser.save({ validateBeforeSave: false });

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
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password'); //+ -> if the field we want is by default selece false -> select: false in the userModel

  if (!user || !(await user.correctPassword(password, user.password))) {
    //.correctPassword -> instance method we declared in userModel and we can use it from any instance of User doc
    //129 -> min 20 is so important
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  const token = signToken(user._id);
  res.status(201).json({
    token,
    status: 'success',
    data: {
      user: user,
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
  // if the user deleted we no more need to send data
  const currentUser = await User.findById(decoded.id);
  if (!currentUser || !currentUser.active) {
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
