const jwt = require('jsonwebtoken');
const { promisify } = require('util'); //util.promisify
const AppError = require('../utils/appError');
const User = require('../models/user_model');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phone: req.body.phone,
    joinedAt: Date.now(),
  });
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
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
