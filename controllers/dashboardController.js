const userDB = require('../model/userModel');
const reviewDB = require('../model/reviewModel');
const tourDB = require('../model/tourModel');
const { codes, messages } = require('../helpers/constants');
const { AppError, ValidationError } = require('../helpers/error');
const { createSuccessResponse } = require('../helpers/utils');
const actions = {
  async getDashboardUsers(req, res, next) {
    let users = await userDB.find().select({
      name: 1,
      email: 1,
      phoneNumber: 1,
      photo: 1,
      role: 1,
      active: 1,
    });
    return res.status(codes.OK).json(createSuccessResponse({ data: users }));
  },

  async getDashboardTours(req, res, next) {
    let tours = await tourDB
      .find()
      .select(
        '+name +slug +difficult +ratingsAverage +guides +secretTour +description'
      );
    return res.status(codes.OK).json(createSuccessResponse({ data: tours }));
  },

  async getDashboardReviews(req, res, next) {
    let reviews = await reviewDB
      .find()
      .populate({ path: 'tour', select: 'name slug' })
      .populate({ path: 'users', select: 'name role' });
    return res.status(codes.OK).json(createSuccessResponse({ data: reviews }));
  },
};

module.exports = actions;
