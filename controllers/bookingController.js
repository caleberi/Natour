const config = require('../config');
const { codes } = require('../helpers/constants');
const { createSuccessResponse } = require('../helpers/utils');
const tourDB = require('../model/tourModel');
const db = require('../model/bookingModel');
const {
  getOnefn,
  getAllfn,
  updatefn,
  deletefn,
} = require('../factories/dbFactoryHandlers');
const stripe = require('stripe')(config.stripeSecretKey);

exports.getCheckoutSession = async (req, res, next) => {
  const tour = await tourDB.findById(req.params.tourId);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/overview?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: `${req.user.email}`,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
        ],
        amount: tour.price,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });
  console.log(session);
  res.status(codes.OK).json(createSuccessResponse(session));
};

exports.createBookingCheckout = async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await db.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
};

exports.getBookingById = async (req, res, next) => {
  return await getOnefn(db, { id: req.params.id, res, name: 'Booking' });
};

exports.getAllBookings = async (req, res, next) => {
  return await getAllfn(db, { name: 'Booking' });
};

exports.updateBookingById = async (req, res, next) => {
  return await updatefn(db, res, {
    name: 'Booking',
    id: req.params.id,
    body: req.body,
    newDoc: true,
    upsert: true,
    runValidators: true,
  });
};

exports.deleteBookingById = async (req, res, next) => {
  return await deletefn(db, { id: req.params.id, res });
};
