const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
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
        tweetId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tweet',
        },
        type: {
          type: String,
          enum: {
            values: ['tweet', 'retweet', 'quote', 'reply'],
            message: 'type must be tweet or retweet or quote or reply',
          },
        },
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
  },
  { strict: false },
);

// Document MiddleWare

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12); //.hash is async

  next();
});
userSchema.pre('save', function (next) {
  if (!this.active || !this.isModified('password') || this.isNew) return next(); // not changed or the user is new

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance Methods

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // if there is password changing even happen first
    const changedTimestamp = parseInt(
      //change the passwordChangedAt to timestamp
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(6).toString('base64');
  // console.log(resetToken);

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //ten minute from now

  return resetToken;
};
userSchema.methods.createConfirmCode = function () {
  let code = crypto.randomBytes(4).readUInt32BE(0);
  code = code.toString().padStart(8, '0');

  this.confirmEmailCode = crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');

  this.confirmEmailExpires = Date.now() + 10 * 60 * 1000; //ten minute from now

  return code;
};
userSchema.methods.correctConfirmCode = async function (
  candidateCode,
  userConfirmCode,
) {
  if (!candidateCode || !userConfirmCode) return false;
  candidateCode = crypto
    .createHash('sha256')
    .update(candidateCode)
    .digest('hex');

  if (candidateCode === userConfirmCode) {
    return Date.now() < this.confirmEmailExpires;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
