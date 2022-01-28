const mongoose = require('mongoose');
const validator = require('validator').default;
const util = require('../helpers/utils');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { roles } = require('../helpers/constants');
const { cache } = require('../container');
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, 'An email needs to be provided'],
      unqiue: true,
      lowercase: true,
      validate: [validator.isEmail, 'Email is not valid'],
    },
    phoneNumber: {
      type: String,
      validate: [validator.isMobilePhone, 'Phone number is not valid'],
    },
    photo: String,
    role: {
      type: String,
      enum: [
        roles.C_ADMIN,
        roles.C_TOUR_GUIDE,
        roles.C_LEAD_GUIDE,
        roles.C_USER,
      ],
      default: roles.C_USER,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      validate: {
        validator: (password) => {
          const re = new RegExp(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
          );
          return re.test(password);
        },
        message: 'Please provide a strong password',
      },
      minlength: 8,
      selected: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: true,
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: 'Password is not the same',
      },
    },
    lastPasswordModifiedAt: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    this.password = await util.encrypt(this.password, 12);
    this.passwordConfirm = undefined;
  } catch (err) {
    next(err);
  }
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.lastPasswordModifiedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

userSchema.methods.verifyPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.statics.verifyPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.checkLastPasswordModificationDate = function (JWTTimestamp) {
  if (this.lastPasswordModifiedAt) {
    const changedTimeStamp = parseInt(
      this.lastPasswordModifiedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
};

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  await cache.set(resetToken, this.email, {
    PX: 600000,
    NX: true,
  });
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
