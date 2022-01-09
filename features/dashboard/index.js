const express = require('express');
const {
  getDashboardUsers,
  getDashboardTours,
  getDashboardReviews,
} = require('../../controllers/dashboardController');

const { roles } = require('../../helpers/constants');
const { isAuthenticated, isAuthorized } = require('../../middlewares');
const router = express.Router({
  mergeParams: true,
  caseSensitive: true,
});

module.exports = (io) => {
  router.use(isAuthenticated, isAuthorized(roles.C_ADMIN));
  router.get('/users', getDashboardUsers);
  router.get('/tours', getDashboardTours);
  router.get('/reviews', getDashboardReviews);
  return router;
};
