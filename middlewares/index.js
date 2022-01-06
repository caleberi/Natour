const {
  isAuthenticated,
  isAuthorized,
} = require('../controllers/authController');
const { catchAsync } = require('../helpers/utils');

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
};
