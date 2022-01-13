const tourDB = require('../model/tourModel');
const userDB = require('../model/userModel');
const { codes, messages } = require('../helpers/constants');
const { AppError, ValidationError } = require('../helpers/error');

exports.getOverview = async (req, res) => {
  const tours = await tourDB.find();
  if (!tours) {
    return next(
      new AppError(messages.NO_ENTITY('Tours'), codes.NOT_FOUND, false)
    );
  }
  return res.status(codes.OK).render('overview', {
    title: 'All Tours',
    tours,
  });
};

exports.getTour = async (req, res) => {
  const tour = await tourDB.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    field: 'review rating user',
  });
  if (!tour) {
    return next(
      new AppError(messages.NO_ENTITY(req.params.slug), codes.NOT_FOUND, false)
    );
  }
  res.status(codes.OK).render('tour', {
    title: tour.name,
    tour,
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
