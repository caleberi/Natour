const bcrypt = require('bcrypt');
const { AppError } = require('./error');
const config = require('../config');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const tokenDB = require('../model/tokenModel');
function verifyTokenWithJWT(token) {
  return promisify(jwt.verify)(token, config.jwtSecret);
}
function tokenHasExpired(user) {
  return Date.now() - user.exp < config.jwtCookieExpires * 60 * 24 * 60 * 1000;
}
function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpires,
      algorithm: config.jwtAlgorithm,
    }
  );
}

async function generateRefreshToken(user) {
  const rfToken = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    config.refreshjwtSecret,
    {
      expiresIn: config.refreshjwtExpires,
      algorithm: config.refreshjwtAlgorithm,
    }
  );
  const userToken = await tokenDB.findById(user.id);
  if (userToken) {
    let user = await verifyTokenWithJWT(userToken.token, {
      refreshToken: true,
    });
    let isExpired = tokenHasExpired(user);
    if (isExpired) {
      await tokenDB.findByIdAndDelete({ _id: user.id });
    }
    return await tokenDB.findById(user._id);
  }
  return await tokenDB.create({ _id: user._id, token: rfToken });
}

async function signWithJWT(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user).token;
  return {
    accessToken,
    refreshToken,
  };
}

exports.signWithJWT = signWithJWT;

exports.verifyTokenWithJWT = verifyTokenWithJWT;
exports.cyrb53 = function (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

exports.catchAsync = (fn) => {
  return (req, res, next) => fn(req, res, next).catch((err) => next(err));
};

exports.catchSync = (fn) => {
  return (req, res, next) => {
    try {
      fn(req, res, next);
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
};

exports.encrypt = function (password, saltRounds = 10) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        reject(
          new AppError(
            'Error occurred while hashing data',
            codes.INTERNAL_SERVER
          )
        );
      }
      bcrypt.hash(password, salt, function (err, hash) {
        if (err) {
          reject(
            new AppError(
              'Error occurred while hashing data',
              codes.INTERNAL_SERVER
            )
          );
        }
        resolve(hash);
      });
    });
  });
};

exports.verify = function verify(password, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function (err, result) {
      if (result === false) {
        return reject(false);
      }
      return resolve(true);
    });
  });
};

exports.createSendWithToken = async function createSendWithToken(
  user,
  statusCode,
  res,
  data,
  { template }
) {
  const token = await signWithJWT(user);

  const cookieOptions = {
    expires: new Date(
      Date.now() + config.jwtCookieExpires * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  };
  res.cookie('jwt', token.accessToken, {
    ...cookieOptions,
    httpOnly: config.currentEnvironment === 'production' ? true : false,
  });

  user.password = undefined;
  if (template) {
    return res.status(statusCode).render(template);
  }
  if (data) {
    return res.status(statusCode).json(
      this.createSuccessResponse({
        token,
        data: data,
      })
    );
  }
  return res.status(statusCode).json(
    this.createSuccessResponse({
      token,
    })
  );
};

exports.allowOnlySpecifiedField = function allowOnlySpecifiedField(
  body,
  ...fields
) {
  return _.reduce(
    body,
    (result, val, key) => {
      if (fields.includes(key)) result[key] = val;
      return result;
    },
    {}
  );
};
exports.filterBody = function filterBody(body, ...fields) {
  Object.keys(body).forEach((k) => {
    if (fields.includes(k)) {
      delete body[k];
    }
  });
  return body;
};

exports.filterBodyWithCallback = function filterBody(body, callback) {
  Object.keys(body).forEach((k) => {
    if (callback(k)) {
      delete body[k];
    }
  });
  return body;
};

exports.twilioSMSHelper = async function (to, from, code, time) {
  const accountSid = config.twilioAccountSID;
  const authToken = config.twilioAuthToken;
  const client = require('twilio')(accountSid, authToken);
  await client.messages.create({
    body: `Your one time code to reset your password is ${code} . It expires in ${time}min`,
    from,
    to,
  });
};

exports.createSuccessResponse = (data) => ({
  status: 'success',
  ...data,
});

exports.createFailureResponse = (data) => ({
  status: 'failure',
  ...data,
});

exports.tokenHasExpired = tokenHasExpired;
