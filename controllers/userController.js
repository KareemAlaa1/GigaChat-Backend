const User = require('../models/user_model');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...filter) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    //Object.key(objName) array contian the key names of the object properties
    if (filter.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
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
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
