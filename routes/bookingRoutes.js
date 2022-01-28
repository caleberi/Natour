const express = require('express');
const { catchAsync } = require('../helpers/utils');
const {
  getCheckoutSession,
  updateBookingById,
  getBookingById,
  deleteBookingById,
  getAllBookings,
} = require('../controllers/bookingController');
const middlewares = require('../middlewares');
const router = express.Router();
router.use(middlewares.isAuthenticated);
router.get('/checkout-session/:tourId', catchAsync(getCheckoutSession));
router
  .route('/:id')
  .get(catchAsync(getBookingById))
  .patch(catchAsync(updateBookingById))
  .delete(catchAsync(deleteBookingById));
router.get('/', catchAsync(getAllBookings));

module.exports = router;
