const tourDB = require('../model/tourModel');
const { codes } = require('../helpers/constants');
exports.getOverview = async (req, res) => {
  const tours = await tourDB.find();
  return res.status(codes.OK).render('overview', {
    title: 'All Tours',
    tours,
  });
};

exports.getTour = async (req, res) => {
  const tour = await tourDB.findOne({ slug: req.params.slug });
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
};
