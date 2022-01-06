const express = require('express');
const router = express.Router({
  mergeParams: true,
  caseSensitive: true,
});
const { catchAsync } = require('../helpers/utils');
const { roles } = require('../helpers/constants');
const {
  deleteReview,
  createReview,
  getReviewsByQuery,
  getAllReviews,
} = require('../controllers/reviewController');
const middlewares = require('../middlewares');

router.use(middlewares.isAuthenticated);
router.route('/:r_id/filter').get(catchAsync(getReviewsByQuery));
router
  .route('/')
  .get(catchAsync(getAllReviews))
  .delete(
    middlewares.isAuthenticated,
    middlewares.isAuthorized(roles.C_USER, roles.C_ADMIN),
    catchAsync(deleteReview)
  )
  .patch(
    middlewares.isAuthenticated,
    middlewares.isAuthorized(roles.C_USER, roles.C_ADMIN),
    middlewares.addToReviewBody,
    catchAsync(createReview)
  );
module.exports = router;
