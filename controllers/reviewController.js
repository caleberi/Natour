const db = require('../model/reviewModel');
const { AppError } = require('../helpers/error');
const { codes, messages } = require('../helpers/constants');
const { ReviewQueryApi } = require('../helpers/queries');
const { createSuccessResponse } = require('../helpers/utils');
const { createfn, getAllfn } = require('../factories/dbFactoryHandlers');
const actions = {
  async getAllReviews(req, res, next) {
    if (req.OriginalUrl.endsWith('/bookings')) {
      return res
        .status(codes.OK)
        .json(
          createSuccessResponse({
            data: await db.find({ tour: req.params.id }),
          })
        );
    }
    return await getAllfn(db, { name: 'reviews' });
  },
  async getReviewsByQuery(req, res, next) {
    const feature = new ReviewQueryApi(
      db.find({
        _id: req.params.r_id,
        tour: req.params.id,
      }),
      req.query
    )
      .filter()
      .sort();

    const reviews = await feature.query;
    if (!reviews) {
      return next(new AppError(messages.NO_REVIEW, codes.NOT_FOUND, false));
    }
    return res.status(codes.OK).json(createSuccessResponse({ data: reviews }));
  },
  async deleteReview(req, res, next) {
    await db.findByIdAndDelete(req.params.id);
    res.status(codes.N0_CONTENT).json(createSuccessResponse({ data: null }));
  },
  async createReview(req, res, next) {
    return await createfn(db, { name: 'Review' })(req.body, res);
  },
};

module.exports = actions;
