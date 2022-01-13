const tourDB = require('../model/tourModel');
const userDB = require('../model/userModel');
const { codes, messages } = require('../helpers/constants');
const { AppError, ValidationError } = require('../helpers/error');

exports.getOverview = async (req, res) => {
  const tours = await tourDB.find();
  if (!tours) {
    return next(
      new AppError(messages.NO_ENTITY('Tours'), codes.NOT_FOUND, false)
    );
  }
  return res.status(codes.OK).render('overview', {
    title: 'All Tours',
    tours,
  });
};

exports.getTour = async (req, res) => {
  const tour = await tourDB.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    field: 'review rating user',
  });
  if (!tour) {
    return next(
      new AppError(messages.NO_ENTITY(req.params.slug), codes.NOT_FOUND, false)
    );
  }
  res.status(codes.OK).render('tour', {
    title: tour.name,
    tour,
  });
};
