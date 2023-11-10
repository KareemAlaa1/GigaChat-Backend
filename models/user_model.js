const { mongoose, Schema } = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Email is invalid',
    },
    unique: true,
  },
  password: {
    type: String,
    minlength: 8,
    select: false,
  },
  bio: {
    type: String,
  },
  birthDate: {
    type: Date,
  },
  bannerImage: {
    type: String,
  },
  profileImage: {
    type: String,
  },
  phone: {
    type: Number,
    validate: {
      validator: (value) => typeof value === 'number',
      message: 'phone must be numbers',
    },
    default: '00000000000',
  },
  nickname: {
    type: String,
  },
  location: {
    type: String,
  },
  website: {
    type: String,
  },
  mutedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  blockingUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  followingUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  followersUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  likedTweets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
    },
  ],
  tweetList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
    },
  ],
  notificationList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notifications',
    },
  ],
  chatList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
  ],
  mentionList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
    },
  ],
  joinedAt: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  confirmEmailCode: String,
  confirmEmailExpires: Date,
  active: {
    type: Boolean,
    default: false,
  },
});
// Document MiddleWare

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12); //.hash is async

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next(); // not changed or the user is new

  this.passwordChangedAt = Date.now() - 1000; // video 136 min:16 -> why he minus 1 sec
  next();
});
// Query MiddleWare

// NOT WORKING
// userSchema.pre(/^find/, function (next) {
//   // /^find/ reguler expression
//   // we use normal function to access the this keyword
//   // bypass to allow specific query to still select the inactive user
//   if (!this.getQuery()._bypassMiddleware) {
//     this.find({ active: { $ne: false } });
//   }
//   next();
// });
// i will put the following insteed untill i find sol.

// userSchema.pre('findById', function (next) {
//   this.find({ active: { $ne: false } });
//   next();
// });

// Instance Methods

userSchema.methods.correctPassword = async function (
  //candidatePassword is not encrypted & userPassword is encrypted
  candidatePassword,
  userPassword, //we pass the user password and did not use this.password cz it by default not selected
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // log to see the shapes
  //console.log(this.passwordChangedAt, JWTTimestamp);
  if (this.passwordChangedAt) {
    // if there is password changing even happen first
    const changedTimestamp = parseInt(
      //change the passwordChangedAt to timestamp
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  // we dont need to encrypt this token strongly so we will use simple encrypt model
  const resetToken = crypto.randomBytes(32).toString('hex'); // generate random string
  // and then we will encryt it and not save it to our database as plane as it
  // we always save our sensitive data in encrypted form
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //ten minute from now

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
