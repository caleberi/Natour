const db = require('../model/userModel');
const util = require('../helpers/utils');
const { AppError } = require('../helpers/error');
const { cache } = require('../container');
const { sendEmail } = require('../helpers/email');
const config = require('../config');
const _ = require('lodash');
const otpGenerator = require('otp-generator');
const { codes, messages, errorType } = require('../helpers/constants');
const { createfn } = require('../factories/dbFactoryHandlers');

async function resolveJWT(token, req, res, next) {
  try {
    let user = await util.verifyTokenWithJWT(token);
    let isExpired = Date.now() - user.exp < 1 * 60 * 24 * 60 * 1000;

    if (isExpired) {
      return next(
        new AppError(messages.EXPIRED_TOKEN, codes.BAD_REQUEST, false)
      );
    }
    let foundUser = await db.findById(user.id);
    if (!foundUser) {
      return next(
        new AppError(messages.NOT_FOUND_ID('User'), codes.UNAUTHORIZED, false)
      );
    }
    if (foundUser.checkLastPasswordModificationDate(user.iat)) {
      return next(
        new AppError(messages.PASSWORD_CHANGED, codes.UNAUTHORIZED, false)
      );
    }
    req.user = user;
    res.locals = {};
    res.locals.user = foundUser;
    return next();
  } catch (err) {
    console.log(err);
    if (err.name === errorType.TOKEN_EXPIRED_ERROR)
      return next(
        new AppError(messages.EXPIRED_TOKEN, codes.BAD_REQUEST, false)
      );
    if (err.name === errorType.NOT_BEFORE_ERROR)
      return next(new AppError(messages.INACTIVE_JWT, codes.BAD_REQUEST, true));
    return next(
      new AppError(messages.UNAUTHORIZED_ACCESS, codes.UNAUTHORIZED, false)
    );
  }
}
//✅
exports.signup = async (req, res, next) => {
  const payload = util.allowOnlySpecifiedField(
    util.filterBody(req.body, 'role', 'active'),
    'name',
    'email',
    'password',
    'passwordConfirm'
  );
  const exist = await db.findOne({ email: payload.email });
  if (exist)
    return next(
      new AppError(messages.EMAIL_ALREADY_EXIST, codes.BAD_REQUEST, false)
    );

  if (req.originalUrl.startsWith('/api')) {
    return await createfn(db, { name: 'User', email: true })(payload, res, req);
  }
  return await createfn(db, { name: 'User', email: true, template: 'login' })(
    payload,
    res,
    req
  );
};

//✅
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new AppError(messages.INVALID_EMAIL_PASSWORD, codes.BAD_REQUEST, false)
    );
  }

  const user = await db.findOne({ email }).select('+password');
  if (user) {
    if (!(await db.verifyPassword(password, user.password))) {
      return next(new AppError(messages.INVALID_PASSWORD, codes.BAD_REQUEST));
    }
    return util.createSendWithToken(user, codes.OK, res);
  }
  return next(new AppError(messages.NOT_FOUND_EMAIL, codes.BAD_REQUEST, false));
};

exports.isAuthenticated = async (req, res, next) => {
  if (req.headers.passcodetype) {
    const credentials = req.headers.passcodetype;
    const { user, pass } = credentials;
    let isAllowed = false;
    _.forEach(config.admins, ({ _user, _pass }) => {
      if (_user === user && _pass == pass) isAllowed = true;
    });
    if (isAllowed) {
      req.isAllowed = isAllowed;
      return next();
    }
    return next();
  }
  if (req.cookies.jwt) {
    return await resolveJWT(req.cookies.jwt, req, res, next);
  }
  if (!req.headers.authorization) {
    return next(
      new AppError(messages.AUTH_KEY_PROVISION, codes.BAD_REQUEST, false)
    );
  } else {
    const { authorization } = req.headers;
    const [tokenType, token] = authorization.split(' ');
    if (tokenType === 'Bearer' && token) {
      return await resolveJWT(token, req, res, next);
    }
  }

  return next(
    new AppError(messages.UNAUTHORIZED_ACCESS, codes.UNAUTHORIZED, false)
  );
};

exports.isAuthorized = (...restrictedRoles) => {
  return (req, res, next) => {
    if (req.isAllowed || restrictedRoles.includes(req.user.role)) return next();

    return next(new AppError(messages.UNAUTHORIZED, codes.UNAUTHORIZED, false));
  };
};

//✅
exports.forgotPassword = async (req, res, next) => {
  const user = await db.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError(messages.NOT_FOUND_EMAIL, codes.NOT_FOUND, false));
  const emailResetToken = await user.createPasswordResetToken();
  try {
    await sendEmail({
      details: {
        email: user.email,
        subject: 'Your 10min Email Reset  ',
        urlResetToken: `${req.protocol}://${req.get(
          'host'
        )}/api/v1/users/resetPassword/${emailResetToken}`,
      },
    });
    return res.status(200).json({
      status: 'success',
      message: 'Token was sent to your email',
    });
  } catch (err) {
    await cache.del(req.body.email);
    return next(
      new AppError(messages.EMAIL_RESET_SEND, codes.INTERNAL_SERVER, false)
    );
  }
};

//✅
exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const email = await cache.get(token);
  const user = await db.findOne({
    email: email,
  });
  if (!user) {
    return next(
      new AppError(messages.INVALID_EXPIRED_TOKEN, codes.BAD_REQUEST, false)
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await cache.del(token);
  await user.save();
  return util.createSendWithToken(user, codes.OK, res);
};

exports.updateUserPassword = async (req, res, next) => {
  const user = await db.findById(req.params.id).select('+password');
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
  return util.createSendWithToken(user, codes.OK, res);
};

//✅
exports.generateOTP = async (req, res, next) => {
  const user = await db.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError(messages.NOT_FOUND_EMAIL, codes.NOT_FOUND, false));
  if (!user.phoneNumber)
    return next(
      new AppError(messages.NO_PRESENT_PHONE_NUMBER, codes.NOT_FOUND, false)
    );
  const OTP = otpGenerator.generate(6, {
    digits: true,
    upperCase: true,
  });

  await cache.set(OTP, req.body.email, {
    PX: 600000,
    NX: true,
  });
  try {
    await util.twilioSMSHelper(
      user.phoneNumber,
      config.twilioPhoneNumber,
      OTP,
      10
    );

    return res.status(codes.OK).json(
      util.createSuccessResponse({
        message: 'OTP was sent to your registered phoneNumber',
      })
    );
  } catch (err) {
    await cache.del(req.body.email);
    return next(
      new AppError(messages.OTP_SEND_ERROR, codes.INTERNAL_SERVER, false)
    );
  }
};

//✅
exports.resetPasswordWithOTP = async (req, res, next) => {
  const { otp } = req.body;
  const email = await cache.get(otp);
  const user = await db.findOne({
    email: email,
  });
  if (!user) {
    return next(
      new AppError(messages.INVALID_EXPIRED_OTP, codes.BAD_REQUEST, false)
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await cache.del(otp);
  await user.save();
  return res
    .status(codes.OK)
    .json(util.createSendWithToken(user, codes.OK, res));
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    let user = await util.verifyTokenWithJWT(req.cookies.jwt);
    let isExpired = Date.now() - user.exp < 1 * 60 * 24 * 60 * 1000;
    if (isExpired) {
      return next(
        new AppError(messages.EXPIRED_TOKEN, codes.BAD_REQUEST, false)
      );
    }

    let foundUser = await db.findById(user.id);
    console.log(foundUser);
    if (!foundUser) {
      return next(
        new AppError(messages.NOT_FOUND_ID('User'), codes.UNAUTHORIZED, false)
      );
    }
    res.locals.user = foundUser;
    return next();
  } else {
    return next(
      new AppError(messages.UNAUTHORIZED_ACCESS, codes.UNAUTHORIZED, false)
    );
  }
};

exports.logout = (req, res, next) => {
  try {
    res.cookie('jwt', 'logging user out', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    return res.status(codes.OK).json(util.createSuccessResponse({}));
  } catch (err) {
    next(err);
  }
};
