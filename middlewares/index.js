const { resolve } = require('path');
const Jimp = require('jimp');
const config = require('../config');
const {
  isAuthenticated,
  isAuthorized,
  isLoggedIn,
} = require('../controllers/authController');
const { catchAsync } = require('../helpers/utils');
const { AppError } = require('../helpers/error');
const { codes } = require('../helpers/constants');
const path = require('path');
const {
  removePreviousAssociateProfileName,
} = require('../helpers/fileHandler');
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
  resizePhoto(req, res, next) {
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
  },
};
