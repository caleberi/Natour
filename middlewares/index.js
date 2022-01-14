const path = require('path');
const Jimp = require('jimp');
const config = require('../config');
const { forEach } = require('lodash');
const {
  isAuthenticated,
  isAuthorized,
  isLoggedIn,
} = require('../controllers/authController');
const { catchAsync } = require('../helpers/utils');
const { AppError } = require('../helpers/error');
const { codes } = require('../helpers/constants');
const {
  removePreviousAssociateProfileName,
} = require('../helpers/fileHandler');

function resizingSingleImage(req, res, next) {
  if (!req.file) return next();
  const userId = req.user.id;
  const fieldname = req.file.fieldname;
  const createdAt = Date.now();
  const extension = req.file.mimetype.split('/')[1];
  const filename = `${
    userId + '-' + fieldname + '-' + createdAt + '.' + extension
  }`;
  const dirpath = path.resolve(__dirname, '../public/img/users');

  removePreviousAssociateProfileName(dirpath, {
    userId,
    latestFileTime: createdAt,
  });

  Jimp.read(req.file.buffer, (err, image) => {
    if (err)
      return next(
        new AppError('Could not resize image', codes.INTERNAL_SERVER, true)
      );
    image
      .resize(config.imageHeight, config.imageWidth)
      .quality(config.imageQuality)
      .write(path.join(dirpath, `./${filename}`));
  });
  req.file.filename = filename;
  next();
}

function resizingMultipleImage(req, res, next) {
  if (!req.files) return next();
  forEach(req.files, (files, key) => {
    forEach(files, (file, idx) => {
      const userId = req.params.id;
      const createdAt = Date.now();
      const extension = file.mimetype.split('/')[1];
      const coverTag = key === 'imageCover' ? 'cover' : `${idx}`;
      const filename = `${
        'tour-' + userId + '-' + createdAt + '-' + coverTag + '.' + extension
      }`;
      const dirpath = path.resolve(__dirname, '../public/img/tours');

      Jimp.read(file.buffer, (err, image) => {
        if (err)
          return next(
            new AppError('Could not resize image', codes.INTERNAL_SERVER, true)
          );
        image
          .resize(
            key === 'imageCover' ? 1920 : 1920,
            key === 'imageCover' ? 840 : 840
          )
          .quality(config.imageQuality)
          .write(path.join(dirpath, `./${filename}`));
      });
      if (key === 'imageCover') {
        req.body[key] = filename;
      } else {
        if (!(key in req.body)) req.body[key] = [filename];
        else req.body[key].push(filename);
      }
    });
  });
  next();
}

module.exports = {
  aliasTopTours(req, res, next) {
    req.query.limit = '5';
    req.query.sort = 'price,ratingsAverage';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  },
  isAuthenticated(req, res, next) {
    return catchAsync(isAuthenticated(req, res, next));
  },
  isAuthorized(...roles) {
    return (req, res, next) => isAuthorized(...roles)(req, res, next);
  },
  cleanRequestUrl(req, res, next) {
    // todo: find out how  to clean url before url matching
    next();
  },
  addToReviewBody(req, res, next) {
    if (!req.body.tour) req.body.tour = req.param.id;
    if (!req.body.user) req.body.user = req.user.id;
    next();
  },
  isLoggedIn(req, res, next) {
    return catchAsync(isLoggedIn(req, res, next));
  },
  resizePhoto({ single, multiple }) {
    return (req, res, next) => {
      if (single && !multiple) {
        return resizingSingleImage(req, res, next);
      }
      if (multiple && !single) {
        return resizingMultipleImage(req, res, next);
      }
    };
  },
};
