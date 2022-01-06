const express = require('express');
const reviewRouter = require('../routes/reviewRoutes');
const {
  createTour,
  getAllTours,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getTourDistances,
} = require('../controllers/tourController');

const { roles } = require('../helpers/constants');
const { catchAsync, catchSync } = require('../helpers/utils');
const middlewares = require('../middlewares/index');
const router = express.Router();

router.use('/:id/reviews', reviewRouter);
router.route('/').post(catchAsync(createTour)).get(getAllTours);
router.all('*', middlewares.isAuthenticated);

router
  .route('/top-5-cheap')
  .get(middlewares.aliasTopTours, catchAsync(getAllTours));
router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(catchAsync(getToursWithin));
router.route('/distances/:latlng/unit/:unit').get(catchAsync(getTourDistances));

router.route('/tour-stats').get(catchAsync(getTourStats));

router
  .route('/monthly-plan/:year')
  .get(
    (req, res, next) =>
      middlewares.isAuthorized(
        roles.C_ADMIN,
        roles.C_LEAD_GUIDE,
        roles.C_TOUR_GUIDE
      )(req, res, next),
    catchAsync(getMonthlyPlan)
  );
router
  .route('/:id')
  .get(catchAsync(getTour))
  .patch(
    catchSync((req, res, next) =>
      middlewares.isAuthorized(roles.C_ADMIN, roles.C_LEAD_GUIDE)(
        req,
        res,
        next
      )
    ),
    catchAsync(updateTour)
  )
  .delete(
    (req, res, next) =>
      middlewares.isAuthorized(roles.C_ADMIN, roles.C_LEAD_GUIDE)(
        req,
        res,
        next
      ),
    catchAsync(deleteTour)
  );

module.exports = router;
