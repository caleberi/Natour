const tourDB = require('../model/tourModel');
const userDB = require('../model/userModel');
const bookingDB = require('../model/bookingModel');
const reviewDB = require('../model/reviewModel');
const { codes, messages } = require('../helpers/constants');
const { AppError, ValidationError } = require('../helpers/error');

exports.getOverview = async (req, res) => {
  const tours = await tourDB.find();
  if (!tours) {
    return next(
      new AppError(messages.NO_ENTITY('Tours'), codes.NOT_FOUND, false)
    );
  }
  res.status(codes.OK).render('overview', {
    title: 'All Tours',
    tours,
  });
};

exports.getTour = async (req, res) => {
  const tour = await tourDB.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    field: 'review rating user',
  });
  const booked = await bookingDB.findOne({
    user: res.locals.user,
    tour: tour.id,
  });
  if (!tour) {
    return next(
      new AppError(messages.NO_ENTITY(req.params.slug), codes.NOT_FOUND, false)
    );
  }
  res.status(codes.OK).render('tour', {
    title: tour.name,
    tour,
    booked,
  });
};

exports.getLoginForm = async (req, res) => {
  res.status(codes.OK).render('login', {
    title: ' Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(codes.OK).render('account', {
    title: 'My account',
  });
};

exports.updateUserData = async (req, res, next) => {
  let user = await userDB.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
      photo: req.file.filename,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) {
    return next(
      new AppError(
        messages.NO_ENTITY(`User : ${req.body.name}`),
        codes.NOT_FOUND,
        false
      )
    );
  }
  res.status(codes.OK).render('account', {
    title: 'My account',
    user: user,
  });
};

exports.updateUserPassword = async (req, res, next) => {
  const user = await userDB.findById(req.user.id).select('+password');
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;
  if (!(await user.verifyPassword(oldPassword, user.password))) {
    return next(
      new ValidationError(
        messages.INCORRECT_OLD_PASSWORD,
        codes.UNAUTHORIZED,
        false
      )
    );
  }
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();
  res.status(codes.OK).render('account', {
    title: 'My account',
    user: user,
  });
};

exports.getSignupForm = (req, res, next) => {
  res.status(codes.OK).render('signup', {
    title: 'Register',
  });
};

exports.getMyTour = async (req, res, next) => {
  const bookings = await bookingDB.find({ user: req.user.id });
  const tourIDs = bookings.map((booking) => booking.tour);
  const tours = await tourDB.find({ _id: { $in: tourIDs } });
  res.status(codes.OK).render('overview', {
    title: 'My Bookings',
    tours,
  });
};

exports.getManageTour = async (req, res, next) => {
  res.status(codes.OK).render('manage_tour', {
    title: 'Manage Tour',
  });
};

exports.getForgetPasswordPage = async (req, res, next) => {
  res.status(codes.OK).render('forgot', {
    title: 'Forgot Password',
  });
};

exports.getResetPasswordPage = async (req, res, next) => {
  res.status(codes.OK).render('reset_password', {
    title: 'Reset Password',
    token: req.params.token,
  });
};

exports.getForgetPasswordOTPPage = async (req, res, next) => {
  res.status(codes.OK).render('otp', {
    title: 'Reset Password With OTP',
  });
};

exports.createReview = async (req, res) => {
  const userId = req.user.id;
  const tourId = (await tourDB.findOne({ slug: req.params.slug })).id;
  const previousReview = await reviewDB.findOne({ user: userId, tour: tourId });
  if (previousReview) {
    await reviewDB.deleteOne({ user: userId, tour: tourId });
  }
  await reviewDB.create({
    user: userId,
    tour: tourId,
    ...req.body,
  });
  res.redirect(`/tours/${req.params.slug}`);
};

exports.likeOrUnlikeTour = async (req, res) => {
  const { tourSlug, userId } = req.params;
  if (
    await tourDB.findOne({
      likeCount: userId,
    })
  ) {
    await tourDB.findOneAndUpdate(
      { slug: tourSlug },
      {
        $pull: {
          likeCount: userId,
        },
      }
    );
  }
  await tourDB.findOneAndUpdate(
    { slug: tourSlug },
    {
      $push: {
        likeCount: userId,
      },
    }
  );
  res.redirect(`/tours/${tourSlug}`);
};
